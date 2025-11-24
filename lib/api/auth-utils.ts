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
 * Extracts JWT token from Authorization header
 * 
 * Why: Standard Bearer token format works identically across
 * all HTTP clients (Fetch, Axios, Retrofit, URLSession).
 */
export function extractAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
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

  // Fetch user role from user_roles table
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role, name, email, level")
    .eq("user_id", user.id)
    .single();

  if (roleError || !userRole) {
    throw new ApiException(
      403,
      ErrorCodes.FORBIDDEN,
      "User role not found. Please complete onboarding."
    );
  }

  return {
    id: user.id,
    email: userRole.email,
    role: userRole.role,
    name: userRole.name,
    level: userRole.level ?? undefined,
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

