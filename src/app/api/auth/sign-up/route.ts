import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import { signUpSchema } from "@/lib/validations/auth.schemas";

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
    // Format validation errors in a user-friendly way
    const zodErrors = parsed.error.issues;
    const errors = zodErrors.map((err) => {
      const field = err.path.join(".");
      return `${field}: ${err.message}`;
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: errors.length === 1 
          ? errors[0] 
          : "Please fix the following errors:\n" + errors.join("\n"),
        validationErrors: zodErrors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      },
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
