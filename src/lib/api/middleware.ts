/**
 * API Middleware Utilities
 * Reusable authentication and authorization middleware for API routes
 * Follows patterns from api-error-handling.mdc
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export interface AuthenticatedContext {
  user: User;
  role: string;
}

/**
 * Custom API Error Classes
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized - Please log in") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden - Insufficient permissions") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, "NOT_FOUND");
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: unknown) {
    super(400, message, "VALIDATION_ERROR");
  }
}

/**
 * Centralized error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Known API error
  if (error instanceof ApiError) {
    return NextResponse.json(
      { 
        error: error.message, 
        code: error.code,
        ...(error instanceof ValidationError && error.details ? { details: error.details } : {})
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

/**
 * Authentication middleware
 * Verifies user is logged in
 */
export async function withAuth<T = unknown>(
  handler: (
    request: NextRequest,
    context: AuthenticatedContext
  ) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const supabase = await createServerClient();

      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new UnauthorizedError();
      }

      // Get user role
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        throw new UnauthorizedError("User profile not found");
      }

      return await handler(request, {
        user,
        role: profile.role,
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Role-based authorization middleware
 * Verifies user has one of the allowed roles
 */
export function withRole(
  allowedRoles: string[],
  handler: (
    request: NextRequest,
    context: AuthenticatedContext
  ) => Promise<NextResponse>
) {
  return withAuth(async (request, context) => {
    if (!allowedRoles.includes(context.role)) {
      throw new ForbiddenError(
        `This action requires one of the following roles: ${allowedRoles.join(", ")}`
      );
    }

    return handler(request, context);
  });
}

/**
 * Validate query parameters
 */
export function getRequiredQueryParam(
  request: NextRequest,
  paramName: string
): string {
  const value = request.nextUrl.searchParams.get(paramName);
  
  if (!value) {
    throw new ValidationError(`Missing required parameter: ${paramName}`);
  }
  
  return value;
}

/**
 * Safe JSON parsing
 */
export async function parseRequestBody<T = unknown>(
  request: NextRequest
): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body");
  }
}

