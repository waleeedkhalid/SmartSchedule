import { POST } from "@/app/api/auth/sign-in/route";
import { createServerClient } from "@/lib/supabase/server";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { MockSupabaseClient } from "../../utils/mock-types";

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock("@/utils/supabase/server");

// Mock redirect-by-role
vi.mock("@/lib/auth/redirect-by-role", () => ({
  redirectByRole: (role: string) => `/${role}/dashboard`,
}));

describe("API /api/auth/sign-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON payload", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      body: "invalid json",
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Invalid request payload");
  });

  it("returns 400 for invalid email format", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid-email",
        password: "password123",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("email");
  });

  it("returns 400 for password less than 6 characters", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "12345",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 401 for invalid credentials", async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: { message: "Invalid login credentials" },
        }),
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Invalid login credentials");
  });

  it("successfully signs in user with valid credentials", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { full_name: "Test User" },
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: "student" },
              error: null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/student/dashboard");
    expect(body.role).toBe("student");
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("defaults to student role when no role is found", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: {},
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.role).toBe("student");
  });

  it("uses requested role when provided", async () => {
    const mockUser = {
      id: "user-123",
      email: "faculty@example.com",
      user_metadata: { full_name: "Faculty User" },
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({
          error: null,
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "faculty@example.com",
        password: "password123",
        role: "faculty",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.role).toBe("faculty");
    expect(body.redirect).toBe("/faculty/dashboard");
  });

  it("returns 500 when user retrieval fails", async () => {
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Failed to retrieve user" },
        }),
      },
      from: vi.fn(),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Failed to retrieve user");
  });

  it("returns 400 when user upsert fails", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { full_name: "Test User" },
    };

    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          error: null,
        }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: "student" },
              error: null,
            }),
          }),
        }),
        upsert: vi.fn().mockResolvedValue({
          error: { message: "Database error" },
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Database error");
  });
});
