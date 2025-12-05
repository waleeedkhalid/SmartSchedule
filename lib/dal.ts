/**
 * Data Access Layer (DAL)
 *
 * Centralizes authorization logic and data fetching with session verification.
 * All functions use React cache() to deduplicate calls within a single request.
 *
 * This follows Next.js 16+ best practices for authentication:
 * @see https://nextjs.org/docs/app/guides/authentication
 *
 * Usage pattern:
 * 1. Call verifySession() to check if user is authenticated
 * 2. Call getUser() to get full user data with role information
 * 3. Use require* helpers in Server Actions to enforce role-based access
 */

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/session";
import { createClient } from "@/supabase/server";

/**
 * User data returned from the DAL
 * This is the canonical user type for the application
 */
export interface DalUser {
  id: string;
  email: string;
  name: string;
  role: string;
  onboardingCompleted: boolean;
}

/**
 * Verify the current session
 *
 * Checks if a valid session exists and returns the session payload.
 * Redirects to login if no valid session is found.
 *
 * CACHED: Multiple calls in the same request return the same result.
 *
 * @returns Session payload with userId and role
 * @throws Redirects to /login if session is invalid
 */
export const verifySession = cache(
  async (): Promise<{ isAuth: true; userId: string; role: string }> => {
    const session = await getSession();

    if (!session?.userId) {
      redirect("/login");
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      redirect("/login?session=expired");
    }

    return {
      isAuth: true,
      userId: session.userId,
      role: session.role,
    };
  }
);

/**
 * Get the current session without redirecting
 *
 * Use this when you need to check auth status without forcing a redirect.
 * Useful for conditional rendering in layouts.
 *
 * CACHED: Multiple calls in the same request return the same result.
 *
 * @returns Session payload or null if not authenticated
 */
export const getSessionOptional = cache(
  async (): Promise<SessionPayload | null> => {
    const session = await getSession();

    if (!session?.userId) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      return null;
    }

    return session;
  }
);

/**
 * Get the current authenticated user with full profile data
 *
 * Verifies the session first, then fetches user data from the database.
 * Redirects to login if session is invalid.
 *
 * CACHED: Multiple calls in the same request return the same result.
 *
 * @returns Full user data including role and profile information
 */
export const getUser = cache(async (): Promise<DalUser | null> => {
  const session = await verifySession();

  try {
    const supabase = await createClient();

    const { data: userRole, error } = await supabase
      .from("user_roles")
      .select("role, name, email, onboarding_completed")
      .eq("user_id", session.userId)
      .single();

    if (error) {
      // PGRST116 is "not found" - user doesn't have a role entry yet
      if (error.code === "PGRST116") {
        console.log("User role not found for user:", session.userId);
        return null;
      }

      console.error("Error fetching user role:", {
        code: error.code,
        message: error.message,
      });
      return null;
    }

    return {
      id: session.userId,
      email: userRole.email,
      name: userRole.name,
      role: userRole.role,
      onboardingCompleted: userRole.onboarding_completed ?? false,
    };
  } catch (error) {
    console.error("Unexpected error in getUser:", error);
    return null;
  }
});

/**
 * Get user data without requiring authentication
 *
 * Returns null if not authenticated instead of redirecting.
 * Use this for pages that show different content for guests vs users.
 *
 * CACHED: Multiple calls in the same request return the same result.
 */
export const getUserOptional = cache(async (): Promise<DalUser | null> => {
  const session = await getSessionOptional();

  if (!session) {
    return null;
  }

  try {
    const supabase = await createClient();

    const { data: userRole, error } = await supabase
      .from("user_roles")
      .select("role, name, email, onboarding_completed")
      .eq("user_id", session.userId)
      .single();

    if (error || !userRole) {
      return null;
    }

    return {
      id: session.userId,
      email: userRole.email,
      name: userRole.name,
      role: userRole.role,
      onboardingCompleted: userRole.onboarding_completed ?? false,
    };
  } catch {
    return null;
  }
});

// ============================================================================
// Role-Based Authorization Helpers
// Use these in Server Actions and API routes to enforce access control
// ============================================================================

/**
 * Require a specific role to proceed
 *
 * @param allowedRoles - Array of roles that are allowed
 * @throws Redirects to /unauthorized if role doesn't match
 */
export async function requireRole(
  ...allowedRoles: string[]
): Promise<{ userId: string; role: string }> {
  const session = await verifySession();

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return { userId: session.userId, role: session.role };
}

/**
 * Require student role
 */
export async function requireStudent(): Promise<{ userId: string }> {
  const { userId } = await requireRole("student");
  return { userId };
}

/**
 * Require faculty role
 */
export async function requireFaculty(): Promise<{ userId: string }> {
  const { userId } = await requireRole("faculty");
  return { userId };
}

/**
 * Require scheduling committee role
 */
export async function requireScheduling(): Promise<{ userId: string }> {
  const { userId } = await requireRole("scheduling");
  return { userId };
}

/**
 * Require teaching load committee role
 */
export async function requireTeachingLoad(): Promise<{ userId: string }> {
  const { userId } = await requireRole("teaching_load");
  return { userId };
}

/**
 * Require registrar role
 */
export async function requireRegistrar(): Promise<{ userId: string }> {
  const { userId } = await requireRole("registrar");
  return { userId };
}

/**
 * Require any admin/committee role
 */
export async function requireAdmin(): Promise<{
  userId: string;
  role: string;
}> {
  return requireRole("scheduling", "teaching_load", "registrar");
}

// ============================================================================
// Dashboard Path Helper
// ============================================================================

/**
 * Get the dashboard path for a given role
 */
export function getDashboardPathForRole(role: string): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "faculty":
      return "/dashboard/faculty";
    case "scheduling":
      return "/dashboard/scheduling";
    case "teaching_load":
      return "/dashboard/teaching-load";
    case "registrar":
      return "/dashboard/registrar";
    default:
      return "/dashboard";
  }
}
