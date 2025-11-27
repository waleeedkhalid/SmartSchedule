/**
 * Authentication Utilities for API Routes
 * 
 * Handles JWT token extraction and validation from HTTP requests.
 * This enables token-based authentication that works identically
 * across all platforms (PWA, React Native, iOS, Android).
 */

import { NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { createErrorResponse, ErrorCodes, ApiException } from "./error-handler";
import { verifyDemoCredentials, getMockUserByEmail, mockUsers } from "@/lib/demo-data";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  level?: number;
}

/**
 * Extracts JWT token from Authorization header or cookies
 * 
 * Priority:
 * 1. Authorization header (Bearer token)
 * 2. demo_user_id cookie (for demo users where client can't access HttpOnly cookie)
 */
export function extractAuthToken(request: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }

  // 2. Check cookies for demo user
  // This is crucial because demo_user_id cookie is HttpOnly and cannot be read by client
  const demoCookie = request.cookies.get("demo_user_id");
  if (demoCookie) {
    return `demo:${demoCookie.value}`;
  }

  return null;
}

/**
 * Validates demo token format
 * Demo tokens are in format: "demo:{user_id}"
 */
function isDemoToken(token: string): boolean {
  return token.startsWith("demo:");
}

/**
 * Validates JWT token and returns authenticated user
 * 
 * Why: Centralized auth validation ensures consistent security
 * across all API endpoints, regardless of which client calls them.
 * Supports both real Supabase tokens and demo tokens.
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  const token = extractAuthToken(request);

  if (!token) {
    throw new ApiException(
      401,
      ErrorCodes.AUTH_REQUIRED,
      "Authentication required. Please provide a valid token."
    );
  }

  // Handle demo tokens
  if (isDemoToken(token)) {
    const userId = token.substring(5); // Remove "demo:" prefix
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new ApiException(
        401,
        ErrorCodes.AUTH_INVALID,
        "Invalid demo authentication token."
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      level: user.level ?? undefined,
    };
  }

  // Handle real Supabase tokens
  const supabase = await createClient();

  // Verify token and get user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new ApiException(
      401,
      ErrorCodes.AUTH_INVALID,
      "Invalid or expired authentication token."
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
    // Handle 400 errors specifically - these are query/RLS issues
    if (roleError.status === 400 || roleError.code?.startsWith('PGRST')) {
      console.warn('user_roles query error (400) in getAuthenticatedUser:', {
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

