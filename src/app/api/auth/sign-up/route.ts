import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/utils/supabase/server";

const roles = [
  "student",
  "faculty",
  "scheduling_committee",
  "teaching_load_committee",
  "registrar",
] as const;

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().min(2).max(120),
  role: z.enum(roles),
});

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

  const parsed = signUpSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.message },
      { status: 400 }
    );
  }

  const { email, password, fullName, role } = parsed.data;
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const origin =
    request.headers.get("origin") ??
    (request.headers.get("referer")
      ? new URL(request.headers.get("referer")!).origin
      : null) ??
    new URL(request.url).origin;

  const metadata = {
    full_name: fullName.trim(),
    role,
  } as const;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.status ?? 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Check your email to verify your account.",
  });
}
