// API Route: Submit Student Elective Preferences
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, getStudentByEmail } from "@/lib/supabase-admin";

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
  submissionId: string;
  timestamp: string;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ElectiveSubmissionPayload = await request.json();

    // Validate payload
    if (!body.studentId || !body.selections || body.selections.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid submission data. Student ID and selections are required.",
        } as ElectiveSubmissionResponse,
        { status: 400 }
      );
    }

    // Validate selections
    const invalidSelections = body.selections.filter(
      (s) => !s.courseCode || !s.packageId || typeof s.priority !== "number"
    );

    if (invalidSelections.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid selection data. Each selection must have courseCode, packageId, and priority.",
        } as ElectiveSubmissionResponse,
        { status: 400 }
      );
    }

    // Get student from database
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
    const submissionId = `SUB-${Date.now()}-${student.student_id}`;

    // Insert submission record
    const { data: submission, error: submissionError } = await supabaseAdmin
      .from("elective_submissions")
      .insert({
        student_id: student.id,
        submission_id: submissionId,
        status: "submitted",
        submitted_at: timestamp,
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error creating submission:", submissionError);
      throw new Error("Failed to create submission record");
    }

    // Insert preferences
    const preferences = body.selections.map((s) => ({
      submission_id: submission.id,
      student_id: student.id,
      course_code: s.courseCode,
      package_id: s.packageId,
      priority: s.priority,
    }));

    const { error: prefsError } = await supabaseAdmin
      .from("elective_preferences")
      .insert(preferences);

    if (prefsError) {
      console.error("Error creating preferences:", prefsError);
      // Rollback submission if preferences fail
      await supabaseAdmin
        .from("elective_submissions")
        .delete()
        .eq("id", submission.id);
      throw new Error("Failed to save preferences");
    }

    // Log submission success
    console.log("✅ Elective Submission Saved:", {
      submissionId,
      studentId: student.student_id,
      selectionsCount: body.selections.length,
      timestamp,
    });

    return NextResponse.json(
      {
        success: true,
        submissionId,
        timestamp,
        message: "Your elective preferences have been submitted successfully.",
      } as ElectiveSubmissionResponse,
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

    // Query submissions with preferences using the view
    const { data: submissions, error } = await supabaseAdmin
      .from("student_submission_details")
      .select("*")
      .eq("student_id", student.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        submissions: submissions || [],
      },
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
