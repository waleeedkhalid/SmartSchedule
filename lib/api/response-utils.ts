/**
 * Response Formatting Utilities
 * 
 * Provides consistent response formatting for successful API responses.
 * This ensures all endpoints return data in a predictable format.
 */

import { NextResponse } from "next/server";

/**
 * Creates a successful JSON response
 * 
 * Why: Standardized success responses make it easier for clients to
 * parse and handle data consistently across all platforms.
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode });
}

/**
 * Creates a paginated response
 * 
 * Why: Pagination is a common pattern that should be consistent
 * across all list endpoints, making it easy for any client to implement.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse<PaginatedResponse<T>> {
  return createSuccessResponse({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

