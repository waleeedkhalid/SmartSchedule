/**
 * HTTP Client for API Requests
 * 
 * Provides a platform-agnostic HTTP client using the Fetch API.
 * This same client works in PWA, React Native, and can be easily
 * adapted for native mobile apps.
 * 
 * Why this supports reusability:
 * - Uses standard Fetch API (available in browsers, React Native, Node.js)
 * - Token management is centralized
 * - Error handling is consistent
 * - Can be replaced with Axios, Retrofit, or URLSession without changing business logic
 */

import { API_ENDPOINTS } from "./endpoints";
import type { ApiError } from "./types";

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "";
  }

  /**
   * Set authentication token
   * 
   * Why: Centralized token management means any client (PWA, React Native, iOS, Android)
   * can use the same authentication flow.
   */
  setToken(token: string | null): void {
    this.token = token;
    // Store token in localStorage for persistence (PWA)
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  /**
   * Get authentication token from storage
   */
  getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    // Try to load from localStorage (PWA)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_token");
      if (stored) {
        this.token = stored;
        return stored;
      }
    }
    return null;
  }

  /**
   * Make HTTP request with automatic token injection
   * 
   * Why: This abstraction means repositories don't need to know about
   * HTTP headers, tokens, or error formats. They just call methods.
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return {} as T;
    }

    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      const error: ApiError = data as ApiError;
      throw new ApiClientError(
        error.error || `HTTP ${response.status}`,
        error.code || "UNKNOWN_ERROR",
        error.details
      );
    }

    // Unwrap data property if present (API returns { data: {...} } format)
    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }

    return data as T;
  }

  /**
   * GET request
   */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: "DELETE",
    });
  }
}

/**
 * Custom API Error class
 * 
 * Why: Provides structured error handling that works consistently
 * across all platforms.
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Singleton API client instance
 * 
 * Why: Single instance ensures token is shared across all repositories
 * and API calls.
 */
export const apiClient = new ApiClient();

