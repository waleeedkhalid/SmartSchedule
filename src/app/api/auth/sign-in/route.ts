/**
 * Sign In API Route
 * POST: Authenticate user and create session
 */

import { cookies } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/api";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { USER_ROLES, ensureValidRole } from "@/lib/auth/constants";

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]).optional(),
  fullName: z.string().optional(),
});

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return validationErrorResponse("Invalid request payload");
  }

  const parsed = signInSchema.safeParse(payload);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email, password, role: requestedRole, fullName } = parsed.data;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return errorResponse(signInError.message, 401);
  }

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return errorResponse(getUserError?.message ?? "User not found");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const derivedRole = ensureValidRole(
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
    return errorResponse(upsertError.message, 400);
  }

  const redirect = redirectByRole(derivedRole);

  return successResponse({ redirect, role: derivedRole });
}
