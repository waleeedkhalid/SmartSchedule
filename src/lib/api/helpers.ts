/**
 * API Route Helper Functions
 * Common utilities for API endpoints
 * ✅ CORRECT PATTERN: Uses async createServerClient()
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

/**
 * Get authenticated user from request
 * ✅ UPDATED: Now uses async createServerClient()
 */
export async function getAuthenticatedUser() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, error };
  }

  return { user, supabase, error: null };
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  status: number = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

/**
 * Create validation error response
 * Handles both string messages and Zod error objects
 */
export function validationErrorResponse(
  messageOrDetails?: string | unknown
): NextResponse<ApiResponse> {
  // If it's a string, use it directly
  if (typeof messageOrDetails === "string") {
    return NextResponse.json(
      {
        success: false,
        error: messageOrDetails,
      },
      { status: 400 }
    );
  }
  
  // If it's a Zod error, extract first error message
  if (messageOrDetails && typeof messageOrDetails === "object" && "issues" in messageOrDetails) {
    const zodError = messageOrDetails as { issues: Array<{ path: string[]; message: string }> };
    const firstIssue = zodError.issues[0];
    if (firstIssue) {
      const fieldName = firstIssue.path.join(".");
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${fieldName} - ${firstIssue.message}`,
          details: zodError.issues,
        },
        { status: 400 }
      );
    }
  }
  
  // Default response
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      ...(messageOrDetails && { details: messageOrDetails }),
    },
    { status: 400 }
  );
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof Error) {
    return errorResponse(error.message);
  }
  return errorResponse("An unexpected error occurred");
}

