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

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(roles as [UserRole, ...UserRole[]]).optional(),
  fullName: z.string().optional(),
});

function ensureRole(role?: string | null): UserRole {
  if (roles.includes(role as UserRole)) {
    return role as UserRole;
  }

  return "student";
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }

  const parsed = signInSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.message },
      { status: 400 }
    );
  }

  const { email, password, role: requestedRole, fullName } = parsed.data;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json(
      { success: false, error: signInError.message },
      { status: 401 }
    );
  }

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return NextResponse.json(
      { success: false, error: getUserError?.message ?? "User not found" },
      { status: 500 }
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const derivedRole = ensureRole(
    profile?.role ?? requestedRole ?? (user.user_metadata?.role as string)
  );

  const upsertPayload = {
    id: user.id,
    email: user.email ?? email,
    full_name:
      (user.user_metadata?.full_name as string | undefined) ??
      fullName ??
      user.email ??
      email,
    role: derivedRole,
  };

  const { error: upsertError } = await supabase
    .from("users")
    .upsert(upsertPayload, { onConflict: "id" });

  if (upsertError) {
    return NextResponse.json(
      { success: false, error: upsertError.message },
      { status: 400 }
    );
  }

  const redirect = redirectByRole(derivedRole);

  return NextResponse.json({ success: true, redirect, role: derivedRole });
}
