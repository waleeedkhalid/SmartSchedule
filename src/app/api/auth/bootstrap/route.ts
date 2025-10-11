import { randomUUID } from "node:crypto";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminOrThrow } from "@/lib/supabase-admin";

function createSupabaseServerClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        void name;
        void value;
        void options;
        // No-op; route handlers do not mutate cookies in this flow
      },
      remove(name: string, options: CookieOptions) {
        void name;
        void options;
        // No-op; route handlers do not mutate cookies in this flow
      },
    },
  });
}

function resolveDisplayName(
  email: string | null,
  metadata: Record<string, unknown> | null
) {
  const rawName =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined);

  if (rawName && rawName.trim().length > 0) {
    return rawName.trim();
  }

  if (email) {
    return email.split("@")[0] || "Student";
  }

  return "Student";
}

function resolveRole(
  appMetadata: Record<string, unknown> | null,
  userMetadata: Record<string, unknown> | null
) {
  const explicitRole =
    (appMetadata?.role as string | undefined) ??
    (userMetadata?.role as string | undefined) ??
    (appMetadata?.preferred_role as string | undefined) ??
    (userMetadata?.preferred_role as string | undefined);

  return explicitRole ?? "student";
}

function generateStudentNumber(existing?: string | null) {
  if (existing && existing.trim().length > 0) {
    return existing;
  }

  return `STU${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient(request);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = getSupabaseAdminOrThrow();

    const displayName = resolveDisplayName(
      user.email ?? null,
      user.user_metadata ?? null
    );
    const role = resolveRole(
      user.app_metadata ?? null,
      user.user_metadata ?? null
    );
    const email = user.email ?? "";

    const { error: userUpsertError } = await admin.from("user").upsert(
      {
        id: user.id,
        name: displayName,
        email,
        role,
      },
      { onConflict: "id" }
    );

    if (userUpsertError) {
      throw userUpsertError;
    }

    let createdProfile = false;
    let studentNumber: string | undefined;

    if (role === "student") {
      const { data: existingStudent, error: studentLookupError } = await admin
        .from("students")
        .select("id, student_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (studentLookupError) {
        throw studentLookupError;
      }

      studentNumber = generateStudentNumber(existingStudent?.student_id);

      if (existingStudent) {
        const { error: updateError } = await admin
          .from("students")
          .update({
            name: displayName,
            email,
          })
          .eq("id", existingStudent.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await admin.from("students").insert({
          user_id: user.id,
          student_id: studentNumber,
          name: displayName,
          email,
        });

        if (insertError) {
          throw insertError;
        }

        createdProfile = true;
      }
    }

    return NextResponse.json({
      success: true,
      role,
      createdProfile,
      studentNumber,
    });
  } catch (error) {
    console.error("Bootstrap auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
