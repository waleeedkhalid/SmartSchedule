import { POST } from "@/app/api/auth/bootstrap/route";
import { createServerClient } from "@/lib/supabase/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock("@/utils/supabase/server");

// Mock redirect-by-role
vi.mock("@/lib/auth/redirect-by-role", () => ({
  redirectByRole: (role: string) => `/${role}/dashboard`,
}));

describe("API /api/auth/bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Not authenticated" },
        }),
      },
      from: vi.fn(),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Unauthorized");
  });

  it("successfully bootstraps user with no payload", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { full_name: "Test User" },
    };

    const mockSupabase = {
      auth: {
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/student/dashboard");
  });

  it("accepts empty request without content-type", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { full_name: "Test User" },
    };

    const mockSupabase = {
      auth: {
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("uses role from payload when provided", async () => {
    const mockUser = {
      id: "user-123",
      email: "faculty@example.com",
      user_metadata: {},
    };

    const mockSupabase = {
      auth: {
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "faculty",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/faculty/dashboard");
  });

  it("uses fullName from payload when provided", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: {},
    };

    const mockUpsert = vi.fn().mockResolvedValue({
      error: null,
    });

    const mockSupabase = {
      auth: {
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
        upsert: mockUpsert,
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Custom Name",
      }),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Custom Name",
      }),
      { onConflict: "id" }
    );
  });

  it("defaults to student role when no role is found", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: {},
    };

    const mockSupabase = {
      auth: {
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/student/dashboard");
  });

  it("uses role from user_metadata when profile is missing", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { role: "faculty" },
    };

    const mockSupabase = {
      auth: {
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/faculty/dashboard");
  });

  it("prioritizes profile role over metadata role", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: { role: "student" },
    };

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { role: "faculty" },
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

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.redirect).toBe("/faculty/dashboard");
  });

  it("returns 400 when upsert fails", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: {},
    };

    const mockSupabase = {
      auth: {
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
          error: { message: "Database error" },
        }),
      }),
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const request = new Request("http://localhost:3000/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(request);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Database error");
  });

  it("accepts all valid role types", async () => {
    const roles = [
      "student",
      "faculty",
      "scheduling_committee",
      "teaching_load_committee",
      "registrar",
    ];

    for (const role of roles) {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {},
      };

      const mockSupabase = {
        auth: {
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

      const request = new Request("http://localhost:3000/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const res = await POST(request);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.redirect).toBe(`/${role}/dashboard`);
    }
  });
});
