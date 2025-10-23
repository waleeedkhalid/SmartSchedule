import { POST } from "@/app/api/auth/sign-out/route";
import { createServerClient } from "@/utils/supabase/server";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock Next.js modules
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(new Map())),
}));

vi.mock("@/utils/supabase/server");

describe("API /api/auth/sign-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully signs out user", async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: null,
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when sign-out fails", async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: { message: "Failed to sign out" },
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Failed to sign out");
  });

  it("handles network errors gracefully", async () => {
    const mockSupabase = {
      auth: {
        signOut: vi.fn().mockResolvedValue({
          error: { message: "Network error" },
        }),
      },
    };

    vi.mocked(createServerClient).mockReturnValue(mockSupabase as unknown as ReturnType<typeof createServerClient>);

    const res = await POST();
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toContain("Network error");
  });
});
