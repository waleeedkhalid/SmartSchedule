/**
 * Standardized Error Handler for API Routes
 *
 * Provides consistent error responses across all API endpoints.
 * This ensures platform-agnostic error handling for mobile/web clients.
 */

import { NextResponse } from "next/server";

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiException";
  }
}

/**
 * Creates a standardized error response
 *
 * Why: Ensures all API errors follow the same format, making it easy
 * for any client (PWA, React Native, iOS, Android) to handle errors consistently.
 */
export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && typeof details === "object" && details !== null
        ? { details }
        : {}),
    },
    { status: statusCode }
  );
}

/**
 * Creates a standardized success response
 *
 * Why: Ensures all API success responses follow the same format, making it easy
 * for any client (PWA, React Native, iOS, Android) to handle responses consistently.
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse<{ success: boolean; data: T; message?: string }> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * Handles errors and returns appropriate API response
 *
 * Why: Centralized error handling prevents inconsistent error formats
 * and makes debugging easier across all platforms.
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  // Handle known API exceptions
  if (error instanceof ApiException) {
    return createErrorResponse(
      error.statusCode,
      error.code,
      error.message,
      error.details
    );
  }

  // Handle Supabase errors
  if (error && typeof error === "object" && "message" in error) {
    const supabaseError = error as { message: string; code?: string };
    return createErrorResponse(
      500,
      supabaseError.code || "DATABASE_ERROR",
      supabaseError.message
    );
  }

  // Handle unknown errors
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return createErrorResponse(500, "INTERNAL_ERROR", errorMessage);
}

/**
 * Common error codes used across the API
 *
 * Why: Standardized error codes allow clients to handle specific
 * error scenarios programmatically (e.g., show different UI for AUTH_REQUIRED).
 */
export const ErrorCodes = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  AUTH_INVALID: "AUTH_INVALID",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
