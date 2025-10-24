/**
 * Bootstrap API Route
 * POST: Initialize or update user profile after authentication
 */

import { cookies } from "next/headers";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from "@/lib/api";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { USER_ROLES, ensureValidRole } from "@/lib/auth/constants";

const bootstrapSchema = z
  .object({
    email: z.email(),
    role: z.enum(USER_ROLES as [UserRole, ...UserRole[]]).optional(),
    fullName: z.string().optional(),
  })
  .partial();

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
    return validationErrorResponse(parsed.error);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError || !user) {
    return unauthorizedResponse();
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = ensureValidRole(
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
    return errorResponse(upsertError.message, 400);
  }

  return successResponse({ redirect: redirectByRole(role), role });
}
