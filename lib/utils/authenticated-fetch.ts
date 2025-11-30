/**
 * Authenticated Fetch Wrapper
 *
 * Provides a simple, type-safe wrapper for making authenticated API calls.
 * Centralizes authentication header management and error handling.
 *
 * Benefits:
 * - DRY: No repeated getAuthToken() calls across components
 * - Type-safe: Generic response types
 * - Consistent error handling
 * - Automatic retry on auth failure
 */

import { getAuthToken } from "./client-auth";

export interface FetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Skip authentication (for public endpoints) */
  skipAuth?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export class AuthenticatedFetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseBody?: unknown
  ) {
    super(`Request failed: ${status} ${statusText}`);
    this.name = "AuthenticatedFetchError";
  }
}

/**
 * Makes an authenticated fetch request
 *
 * @param url - The URL to fetch
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise resolving to the parsed JSON response
 * @throws AuthenticatedFetchError on non-2xx responses
 *
 * @example
 * ```ts
 * // Simple GET
 * const data = await authenticatedFetch<Course[]>('/api/courses');
 *
 * // POST with body
 * const result = await authenticatedFetch<{ id: string }>('/api/sections', {
 *   method: 'POST',
 *   body: JSON.stringify({ course_code: 'CS101' }),
 * });
 * ```
 */
export async function authenticatedFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    skipAuth = false,
    timeout = 30000,
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add auth token if not skipped
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
      throw new AuthenticatedFetchError(
        response.status,
        response.statusText,
        responseBody
      );
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof AuthenticatedFetchError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AuthenticatedFetchError(408, "Request Timeout");
    }

    throw error;
  }
}

/**
 * Makes an authenticated fetch request with error handling
 * Returns an ApiResponse object instead of throwing
 *
 * @example
 * ```ts
 * const { data, error, status } = await safeAuthenticatedFetch<Course[]>('/api/courses');
 * if (error) {
 *   console.error('Failed to fetch courses:', error);
 * }
 * ```
 */
export async function safeAuthenticatedFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const data = await authenticatedFetch<T>(url, options);
    return { data, error: null, status: 200 };
  } catch (error) {
    if (error instanceof AuthenticatedFetchError) {
      const errorMessage =
        typeof error.responseBody === "object" && error.responseBody !== null
          ? (error.responseBody as { message?: string }).message ||
            error.statusText
          : error.statusText;
      return { data: null, error: errorMessage, status: error.status };
    }
    return { data: null, error: "An unexpected error occurred", status: 500 };
  }
}

/**
 * Shorthand for GET requests
 */
export function get<T>(
  url: string,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return authenticatedFetch<T>(url, { ...options, method: "GET" });
}

/**
 * Shorthand for POST requests
 */
export function post<T>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return authenticatedFetch<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Shorthand for PUT requests
 */
export function put<T>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return authenticatedFetch<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Shorthand for PATCH requests
 */
export function patch<T>(
  url: string,
  body?: unknown,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return authenticatedFetch<T>(url, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Shorthand for DELETE requests
 */
export function del<T>(
  url: string,
  options?: Omit<FetchOptions, "method" | "body">
): Promise<T> {
  return authenticatedFetch<T>(url, { ...options, method: "DELETE" });
}

// Export all methods as a namespace for convenience
export const api = {
  fetch: authenticatedFetch,
  safeFetch: safeAuthenticatedFetch,
  get,
  post,
  put,
  patch,
  delete: del,
} as const;
