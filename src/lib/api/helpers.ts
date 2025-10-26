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
 */
export function validationErrorResponse(
  details?: unknown
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      ...(details && { details }),
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

