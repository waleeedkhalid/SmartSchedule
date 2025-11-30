/**
 * Paginated List Utilities
 *
 * Provides shared pagination interfaces and utilities for list functions.
 * Use these types consistently across all paginated data fetching.
 */

/**
 * Pagination parameters for list functions
 */
export interface PaginationParams {
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Search term for filtering */
  search?: string;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Items for the current page */
  data: T[];
  /** Total number of items matching the query */
  totalCount: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Calculate pagination range for Supabase queries
 */
export function calculateRange(
  page: number,
  pageSize: number
): { from: number; to: number } {
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const from = (validPage - 1) * validPageSize;
  const to = from + validPageSize - 1;
  return { from, to };
}

/**
 * Build paginated result from query data
 */
export function buildPaginatedResult<T>(
  data: T[],
  totalCount: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(totalCount / pageSize);
  return {
    data,
    totalCount,
    totalPages,
    page,
    pageSize,
    hasMore: page < totalPages,
  };
}
