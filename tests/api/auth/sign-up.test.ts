import { POST } from "@/app/api/auth/sign-up/route";
import { createServerClient } from "@/lib/supabase/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock("@/utils/supabase/server");

describe("API /api/auth/sign-up", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON payload", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
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
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "invalid-email",
        password: "password123",
        fullName: "Test User",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("email");
  });

  it("returns 400 for password less than 6 characters", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "12345",
        fullName: "Test User",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 400 for missing fullName", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 400 for fullName less than 2 characters", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "A",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 400 for fullName more than 120 characters", async () => {
    const longName = "A".repeat(121);
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: longName,
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("returns 400 for invalid role", async () => {
    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
        role: "invalid_role",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it("successfully signs up a new student user", async () => {
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        email: "newuser@example.com",
        password: "password123",
        fullName: "New User",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Check your email to verify your account.");
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "newuser@example.com",
      password: "password123",
      options: {
        data: {
          full_name: "New User",
          role: "student",
        },
        emailRedirectTo: "http://localhost:3000/login",
      },
    });
  });

  it("successfully signs up a new faculty user", async () => {
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        email: "faculty@example.com",
        password: "password123",
        fullName: "Faculty User",
        role: "faculty",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "faculty@example.com",
      password: "password123",
      options: {
        data: {
          full_name: "Faculty User",
          role: "faculty",
        },
        emailRedirectTo: "http://localhost:3000/login",
      },
    });
  });

  it("trims whitespace from fullName", async () => {
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "  Trimmed User  ",
        role: "student",
      }),
    });

    const res = await POST(request);
    await res.json();

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            full_name: "Trimmed User",
          }),
        }),
      })
    );
  });

  it("handles Supabase sign-up errors", async () => {
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          error: {
            message: "User already registered",
            status: 422,
          },
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        email: "existing@example.com",
        password: "password123",
        fullName: "Existing User",
        role: "student",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe("User already registered");
  });

  it("uses origin from referer header if origin is not provided", async () => {
    const mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        referer: "https://example.com/sign-up",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
        role: "student",
      }),
    });

    const res = await POST(request);
    await res.json();

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "https://example.com/login",
        }),
      })
    );
  });

  it("supports all valid roles", async () => {
    const roles = [
      "student",
      "faculty",
      "scheduling_committee",
      "teaching_load_committee",
      "registrar",
    ];

    for (const role of roles) {
      const mockSupabase = {
        auth: {
          signUp: vi.fn().mockResolvedValue({
            error: null,
          }),
        },
      };

      vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

      const request = new Request("http://localhost:3000/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: `${role}@example.com`,
          password: "password123",
          fullName: `${role} User`,
          role,
        }),
      });

      const res = await POST(request);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    }
  });
});
