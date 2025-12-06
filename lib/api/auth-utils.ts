/**
 * Authentication Utilities for API Routes
 *
 * Provides centralized authentication and authorization for all API endpoints.
 * Follows MySQL-style CRUD approach with clear separation of concerns:
 * - Authentication: Verify user identity (WHO is the user?)
 * - Authorization: Verify user permissions (WHAT can they do?)
 *
 * Works identically across all platforms (PWA, React Native, iOS, Android).
 */

import { NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { ErrorCodes, ApiException } from "./error-handler";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  level?: number;
}

interface UserRoleData {
  role: string;
  name: string;
  email: string;
}

// ============================================================================
// PRIVATE HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts JWT token from Authorization header
 *
 * @param request - The incoming HTTP request
 * @returns The JWT token or null if not found
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Fetches authenticated Supabase user from token or session cookie
 *
 * @param token - Optional JWT token from Authorization header
 * @returns The authenticated user or throws ApiException
 */
async function fetchSupabaseUser(token: string | null) {
  const supabase = await createClient();

  // Use token if provided, otherwise rely on session cookies
  const { data, error } = token
    ? await supabase.auth.getUser(token)
    : await supabase.auth.getUser();

  if (error || !data?.user) {
    // Check if this is a session expiry error
    const isSessionExpired =
      error?.message?.toLowerCase().includes("expired") ||
      error?.message?.toLowerCase().includes("invalid") ||
      error?.code === "session_not_found" ||
      error?.code === "invalid_token";

    throw new ApiException(
      401,
      isSessionExpired ? ErrorCodes.SESSION_EXPIRED : ErrorCodes.AUTH_REQUIRED,
      isSessionExpired
        ? "Your session has expired. Please log in again."
        : "Authentication required. Please log in.",
      { redirectTo: "/login" }
    );
  }

  return { user: data.user, supabase };
}

/**
 * Fetches user role from user_roles table (MySQL-style READ operation)
 *
 * @param supabase - Supabase client instance
 * @param userId - The authenticated user's ID
 * @returns User role data or throws ApiException
 */
async function fetchUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<UserRoleData> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role, name, email")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Log for debugging (avoid exposing internal details to client)
    if (error) {
      console.warn("[auth-utils] Failed to fetch user role:", {
        userId,
        errorCode: error.code,
        errorMessage: error.message,
      });
    }

    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      "User role not found. Please complete onboarding."
    );
  }

  return data;
}

/**
 * Fetches student level from student_profile table (MySQL-style READ operation)
 *
 * @param supabase - Supabase client instance
 * @param userId - The authenticated user's ID
 * @returns Student level or undefined if not found
 */
async function fetchStudentLevel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<number | undefined> {
  const { data } = await supabase
    .from("student_profile")
    .select("level")
    .eq("user_id", userId)
    .single();

  return data?.level;
}

// ============================================================================
// PUBLIC API FUNCTIONS
// ============================================================================

/**
 * Gets authenticated user with role and profile information
 *
 * This is the main authentication function. It:
 * 1. Validates the JWT token or session cookie
 * 2. Fetches the user's role from the database
 * 3. Fetches additional profile data (e.g., student level) if needed
 *
 * @param request - The incoming HTTP request
 * @returns The authenticated user with all required information
 * @throws ApiException if authentication fails
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  // Step 1: Extract token and validate with Supabase
  const token = extractBearerToken(request);
  const { user, supabase } = await fetchSupabaseUser(token);

  // Step 2: Fetch user role (required for all users)
  const userRole = await fetchUserRole(supabase, user.id);

  // Step 3: Fetch additional profile data based on role
  const level =
    userRole.role === "student"
      ? await fetchStudentLevel(supabase, user.id)
      : undefined;

  return {
    id: user.id,
    email: userRole.email,
    role: userRole.role,
    name: userRole.name,
    level,
  };
}

/**
 * Checks if user has one of the required roles
 *
 * @param user - The authenticated user
 * @param requiredRoles - Single role or array of allowed roles
 * @returns true if user has one of the required roles
 */
export function hasRequiredRole(
  user: AuthenticatedUser,
  requiredRoles: string | string[]
): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
}

/**
 * Validates user has required role, throws if not (Authorization check)
 *
 * Use this for role-based access control in API routes:
 * ```typescript
 * const user = await authenticateRequest(request);
 * requireRole(user, ["scheduling", "teaching_load"]);
 * ```
 *
 * @param user - The authenticated user
 * @param requiredRoles - Single role or array of allowed roles
 * @throws ApiException if user lacks required role
 */
export function requireRole(
  user: AuthenticatedUser,
  requiredRoles: string | string[]
): void {
  if (!hasRequiredRole(user, requiredRoles)) {
    const roles = Array.isArray(requiredRoles)
      ? requiredRoles.join(" or ")
      : requiredRoles;
    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      `Access denied. Required role: ${roles}`
    );
  }
}

/**
 * Authenticates request and returns user (main entry point for API routes)
 *
 * This is the primary function to use in API route handlers:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const user = await authenticateRequest(request);
 *   // user is guaranteed to be authenticated here
 * }
 * ```
 *
 * @param request - The incoming HTTP request
 * @returns The authenticated user
 * @throws ApiException if authentication fails
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser> {
  return getAuthenticatedUser(request);
}
