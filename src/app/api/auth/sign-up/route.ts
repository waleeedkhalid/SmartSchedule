/**
 * Sign Up API Route
 * POST: Create new user account
 */

import { cookies } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { successResponse, validationErrorResponse, errorResponse } from "@/lib/api";
import { USER_ROLES, type UserRole } from "@/lib/auth/constants";

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  fullName: z.string().min(2).max(120),
  role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return validationErrorResponse("Invalid request payload");
  }

  const parsed = signUpSchema.safeParse(payload);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
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
    return errorResponse(error.message, error.status ?? 400);
  }

  return successResponse(
    { message: "Check your email to verify your account." },
    "Account created successfully"
  );
}
