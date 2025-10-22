import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/utils/supabase/server";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";

const roles: readonly UserRole[] = [
  "student",
  "faculty",
  "scheduling_committee",
  "teaching_load_committee",
  "registrar",
];

const bootstrapSchema = z
  .object({
    email: z.email(),
    role: z.enum(roles as [UserRole, ...UserRole[]]).optional(),
    fullName: z.string().optional(),
  })
  .partial();

function ensureRole(role?: string | null): UserRole {
  if (roles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "student";
}

export async function POST(request: Request) {
  let payload: unknown = {};

  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }
  }

  const parsed = bootstrapSchema.safeParse(payload ?? {});

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.message },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = ensureRole(
    profile?.role ?? parsed.data.role ?? (user.user_metadata?.role as string)
  );

  const { error: upsertError } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        parsed.data.fullName ??
        user.email ??
        "User",
      role,
    },
    { onConflict: "id" }
  );

  if (upsertError) {
    return NextResponse.json(
      { success: false, error: upsertError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, redirect: redirectByRole(role) });
}
