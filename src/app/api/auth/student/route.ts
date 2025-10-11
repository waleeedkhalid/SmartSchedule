// API Route: Student Authentication (Supabase-backed)
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminOrThrow } from "@/lib/supabase-admin";

export interface StudentAuthRequest {
  studentId: string;
  password: string;
}

export interface StudentAuthResponse {
  success: boolean;
  session?: {
    studentId: string;
    name: string;
    level: number;
    completedCourses: string[];
    email?: string;
  };
  error?: string;
}

// NOTE: This endpoint emulates a simple student credential check by looking up a student
// record in Supabase by student_id or email. It does NOT create a Supabase Auth session.
// Keep response shape compatible with Phase 3 consumers.

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: StudentAuthRequest = await request.json();

    // Validate input
    if (!body.studentId || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Student ID and password are required.",
        } as StudentAuthResponse,
        { status: 400 }
      );
    }

    // Simulate authentication delay (kept for UX parity)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const admin = getSupabaseAdminOrThrow();

    // Try lookup by student_id first, else by email
    const { data: studentRow, error: studentErr } = await admin
      .from("students")
      .select("id, student_id, name, level, email")
      .or(`student_id.eq.${body.studentId},email.eq.${body.studentId}`)
      .single();

    if (studentErr || !studentRow) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid credentials. Please check your Student ID and password.",
        } as StudentAuthResponse,
        { status: 401 }
      );
    }

    // NOTE: No password verification here since Supabase Auth isn’t wired in this endpoint.
    // Optionally, you could enforce a shared demo password.
    if (body.password !== "student123" && body.password !== "test") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid credentials. Please check your Student ID and password.",
        } as StudentAuthResponse,
        { status: 401 }
      );
    }

    // TODO: completed courses no longer stored in a dedicated table.
    // Consider deriving from transcripts or registration history when available.
    const completedCourses: string[] = [];

    return NextResponse.json(
      {
        success: true,
        session: {
          studentId: studentRow.student_id,
          name: studentRow.name,
          level: Number(studentRow.level ?? 0),
          completedCourses,
          email: studentRow.email ?? undefined,
        },
      } as StudentAuthResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during authentication. Please try again.",
      } as StudentAuthResponse,
      { status: 500 }
    );
  }
}
