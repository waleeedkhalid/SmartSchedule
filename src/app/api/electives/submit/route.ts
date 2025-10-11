// API Route: Submit Student Elective Preferences
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getStudentByEmail } from "@/lib/supabase-admin";
import { validateElectiveSubmissionPayload } from "@/lib/elective-helpers";

export interface ElectiveSubmissionPayload {
  studentId: string;
  selections: {
    packageId: string;
    courseCode: string;
    priority: number;
  }[];
}

export interface ElectiveSubmissionResponse {
  success: boolean;
  id?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = validateElectiveSubmissionPayload(await request.json());

    // Get student from database (body.studentId is email per current UI)
    const student = await getStudentByEmail(body.studentId);
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found in the system.",
        } as ElectiveSubmissionResponse,
        { status: 404 }
      );
    }

    const timestamp = new Date().toISOString();
    const electiveRow = {
      student_id: student.user_id, // references public.user(id)
      elective_choices: {
        selections: body.selections,
      },
      created_at: timestamp,
      updated_at: timestamp,
    };

    const { data, error } = await supabaseAdmin
      .from("elective_preferences")
      .insert(electiveRow)
      .select("id, created_at")
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        id: data?.id,
        timestamp: data?.created_at ?? timestamp,
        message: "Your elective preferences have been submitted successfully.",
      } satisfies ElectiveSubmissionResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting elective preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "An error occurred while submitting your preferences. Please try again.",
      } as ElectiveSubmissionResponse,
      { status: 500 }
    );
  }
}

// GET: Retrieve student's submitted preferences
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Get student from database
    const student = await getStudentByEmail(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
      .from("elective_preferences")
      .select("id, elective_choices, created_at, updated_at")
      .eq("student_id", student.user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, preferences: data ?? [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching elective submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
