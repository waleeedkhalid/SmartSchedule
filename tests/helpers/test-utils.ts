/**
 * Test helpers and mocks for API testing
 */

import { NextRequest, NextResponse } from "next/server";

export function createMockNextRequest(
  method: string = "GET",
  options: {
    body?: unknown;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  } = {}
): NextRequest {
  const url = new URL("http://localhost:3000/api/test");
  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = new Headers(options.headers || {});

  const init = {
    method,
    headers,
  } as any;

  if (options.body) {
    init.body = JSON.stringify(options.body);
    headers.set("Content-Type", "application/json");
  }

  return new NextRequest(url, init);
}

export function createMockUser(overrides = {}) {
  return {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "student",
    ...overrides,
  };
}

export function mockSupabaseClient() {
  return {
    auth: {
      getUser: jest.fn(),
      refreshSession: jest.fn(),
    },
    from: jest.fn(),
  };
}

export async function getResponseData<T>(response: NextResponse): Promise<T> {
  const text = await response.text();
  return JSON.parse(text);
}
