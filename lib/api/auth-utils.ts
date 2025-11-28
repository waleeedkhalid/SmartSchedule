/**
 * Authentication Utilities for API Routes
 * 
 * Handles JWT token extraction and validation from HTTP requests.
 * This enables token-based authentication that works identically
 * across all platforms (PWA, React Native, iOS, Android).
 */

import { NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { ErrorCodes, ApiException } from "./error-handler";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  level?: number;
}

/**
 * Extracts JWT token from Authorization header
 * 
 * Note: For Supabase SSR, we don't need to extract tokens from cookies.
 * The createClient() function automatically reads session cookies.
 */
export function extractAuthToken(request: NextRequest): string | null {
  // Check Authorization header (for client-side API calls)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  return null;
}

/**
 * Validates authentication and returns authenticated user
 * 
 * Why: Centralized auth validation ensures consistent security
 * across all API endpoints, regardless of which client calls them.
 * 
 * Authentication methods (in priority order):
 * 1. Authorization header with Bearer token (for client-side API calls)
 * 2. Supabase session cookies (automatically read by createClient())
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  // Check for Authorization header token (for client-side API calls)
  const token = extractAuthToken(request);
  
  // Handle Supabase authentication
  const supabase = await createClient();

  let user;
  let authError;

  if (token) {
    // If token is provided in Authorization header, use it
    const result = await supabase.auth.getUser(token);
    user = result.data?.user || null;
    authError = result.error;
  } else {
    // Standard Supabase SSR pattern: getUser() without arguments
    // The client automatically reads session cookies from the request
    const result = await supabase.auth.getUser();
    user = result.data?.user || null;
    authError = result.error;
  }

  if (authError || !user) {
    throw new ApiException(
      401,
      ErrorCodes.AUTH_REQUIRED,
      "Authentication required. Please provide a valid token."
    );
  }

  // Fetch user role from user_roles table with error handling
  let userRole;
  let roleError;
  
  try {
    const result = await supabase
      .from("user_roles")
      .select("role, name, email")
      .eq("user_id", user.id)
      .single();
    
    userRole = result.data;
    roleError = result.error;
  } catch (error) {
    // Catch any unexpected errors (network issues, etc.)
    console.warn('Unexpected error fetching user role in getAuthenticatedUser:', error);
    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      "User role not found. Please complete onboarding."
    );
  }

  // Handle errors gracefully
  if (roleError) {
    // Handle PGRST errors specifically - these are query/RLS issues
    if (roleError.code?.startsWith('PGRST')) {
      console.warn('user_roles query error in getAuthenticatedUser:', {
        code: roleError.code,
        message: roleError.message,
        userId: user.id,
      });
      throw new ApiException(
        403,
        ErrorCodes.FORBIDDEN,
        "User role not found. Please complete onboarding."
      );
    }
    
    // For other errors, throw appropriate exception
    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      "User role not found. Please complete onboarding."
    );
  }

  if (!userRole) {
    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      "User role not found. Please complete onboarding."
    );
  }

  // Fetch student level from student_profile if user is a student
  let studentLevel: number | undefined = undefined;
  if (userRole.role === 'student') {
    const { data: studentProfile } = await supabase
      .from("student_profile")
      .select("level")
      .eq("user_id", user.id)
      .single();
    
    if (studentProfile) {
      studentLevel = studentProfile.level;
    }
  }

  return {
    id: user.id,
    email: userRole.email,
    role: userRole.role,
    name: userRole.name,
    level: studentLevel,
  };
}

/**
 * Checks if user has required role(s)
 * 
 * Why: Role-based access control is centralized here, making it
 * easy to enforce permissions consistently across all endpoints.
 */
export function hasRequiredRole(
  user: AuthenticatedUser,
  requiredRoles: string | string[]
): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
}

/**
 * Validates user has required role, throws if not
 * 
 * Why: Simplifies role checking in API routes - just call this
 * and it handles the error response automatically.
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
 * Authenticates request and returns user (helper for route handlers)
 * 
 * Why: Simplifies route handler code - one function call handles
 * all authentication logic and error handling.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthenticatedUser> {
  try {
    return await getAuthenticatedUser(request);
  } catch (error) {
    // Re-throw ApiException as-is, wrap others
    if (error instanceof ApiException) {
      throw error;
    }
    throw new ApiException(
      401,
      ErrorCodes.AUTH_REQUIRED,
      "Authentication failed"
    );
  }
}

