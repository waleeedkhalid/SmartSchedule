/**
 * Cached authentication utilities
 * Implements React.cache() pattern from performance.md for request-level memoization
 * ✅ CORRECT PATTERN: Uses async createServerClient() with no parameters
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/redirect-by-role";

interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string | null;
  email?: string | null;
}

/**
 * Get authenticated user (memoized per request)
 * Includes automatic session refresh if expiring soon
 */
export const getAuthenticatedUser = cache(async () => {
  const supabase = await createServerClient();

  // Get current session to check expiry
  const { data: { session } } = await supabase.auth.getSession();

  // Refresh if expiring soon (within 10 minutes)
  if (session?.expires_at) {
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const expiresAtMs = session.expires_at * 1000;
    const now = Date.now();

    if (expiresAtMs - now < TEN_MINUTES_MS) {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Session refresh error:", error);
      }
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Get user profile (memoized per request)
 */
export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return null;
  }

  const supabase = await createServerClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  if (!profile) {
    return null;
  }

  // SECURITY FIX: Only use database role, never fall back to user_metadata
  // user_metadata can be manipulated and should not be trusted for authorization
  if (!profile.role) {
    console.error("User profile missing role:", profile.id);
    return null;
  }

  return {
    id: profile.id,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    email: profile.email,
  };
});

/**
 * Get committee membership (memoized per request)
 */
export const getCommitteeMembership = cache(async (userId: string) => {
  try {
    const supabase = await createServerClient();

    const { data: membership, error } = await supabase
      .from("committee_members")
      .select("id, committee_type, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching committee membership:", error);
      return null;
    }

    return membership;
  } catch (error) {
    console.error("Failed to fetch committee membership:", error);
    return null;
  }
});

/**
 * Check if user has specific role (memoized per request)
 */
export const hasRole = cache(async (requiredRole: UserRole): Promise<boolean> => {
  const profile = await getUserProfile();
  return profile?.role === requiredRole;
});

/**
 * Check if user is committee member (memoized per request)
 */
export const isCommitteeMember = cache(async (): Promise<boolean> => {
  const profile = await getUserProfile();
  
  if (!profile) {
    return false;
  }

  const committeeRoles: UserRole[] = [
    "scheduling_committee",
    "teaching_load_committee",
    "registrar",
  ];

  return committeeRoles.includes(profile.role);
});

