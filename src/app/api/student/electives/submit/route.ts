import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PreferencePayload {
  course_code: string;
  term_code: string;
}

/**
 * POST /api/student/electives/submit
 * Submits student's elective course preference survey responses
 * This is NOT enrollment - it's collecting preferences for future term planning
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { selections } = body as { selections: PreferencePayload[] };

    if (!selections || !Array.isArray(selections)) {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }

    if (selections.length === 0 || selections.length > 6) {
      return NextResponse.json(
        { error: "Please select 1-6 elective preferences" },
        { status: 400 }
      );
    }

    // Verify all selections have the same term_code
    const termCodes = new Set(selections.map(s => s.term_code));
    if (termCodes.size !== 1) {
      return NextResponse.json(
        { error: "All preferences must be for the same term" },
        { status: 400 }
      );
    }

    const termCode = selections[0].term_code;

    // Verify student exists
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("id", user.id)
      .single();

    if (studentError || !studentData) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Validate that all course codes exist and are electives
    const courseCodes = selections.map((s) => s.course_code);
    const { data: courses, error: coursesError } = await supabase
      .from("course")
      .select("code")
      .in("code", courseCodes)
      .eq("type", "ELECTIVE");

    if (coursesError) {
      console.error("Error validating courses:", coursesError);
      return NextResponse.json(
        { error: "Failed to validate courses" },
        { status: 500 }
      );
    }

    const validCodes = new Set(courses?.map((c) => c.code) || []);
    const invalidCodes = courseCodes.filter((code) => !validCodes.has(code));

    if (invalidCodes.length > 0) {
      return NextResponse.json(
        { error: `Invalid course codes: ${invalidCodes.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify the term exists and electives survey is open
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("code, name, electives_survey_open")
      .eq("code", termCode)
      .single();

    if (termError || !term) {
      console.error("Error fetching term:", termError);
      return NextResponse.json(
        { error: "Invalid academic term" },
        { status: 400 }
      );
    }

    if (!term.electives_survey_open) {
      return NextResponse.json(
        { error: "Elective preference survey is not currently open for this term" },
        { status: 400 }
      );
    }

    // Check if draft exists
    const { data: existingDraft } = await supabase
      .from("elective_preferences")
      .select("id")
      .eq("student_id", user.id)
      .eq("term_code", termCode)
      .eq("status", "DRAFT")
      .limit(1);

    // Delete ALL existing preferences (both draft and submitted) for this student and term
    const { error: deleteError } = await supabase
      .from("elective_preferences")
      .delete()
      .eq("student_id", user.id)
      .eq("term_code", termCode);

    if (deleteError) {
      console.error("Error deleting old preferences:", deleteError);
      return NextResponse.json(
        { error: "Failed to clear old preferences" },
        { status: 500 }
      );
    }

    // Insert new preferences with SUBMITTED status
    const now = new Date().toISOString();
    const insertData = selections.map((s, index) => ({
      student_id: user.id,
      course_code: s.course_code,
      term_code: s.term_code,
      preference_order: index + 1,
      status: "SUBMITTED",
      submitted_at: now,
    }));

    const { error: insertError } = await supabase
      .from("elective_preferences")
      .insert(insertData);

    if (insertError) {
      console.error("Error inserting preferences:", insertError);
      return NextResponse.json(
        { error: "Failed to save preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your elective preferences have been recorded successfully",
      count: selections.length,
      term: term.name,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

