import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface DraftPreference {
  course_code: string;
  preference_order: number;
}

/**
 * PUT /api/student/electives/draft
 * Auto-saves student's elective preferences as DRAFT
 * Can be called multiple times - always overwrites previous draft
 */
export async function PUT(request: NextRequest) {
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
    const { preferences, term_code } = body as {
      preferences: DraftPreference[];
      term_code: string;
    };

    if (!term_code) {
      return NextResponse.json(
        { error: "term_code is required" },
        { status: 400 }
      );
    }

    if (!preferences || !Array.isArray(preferences)) {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }

    // Validate max 6 preferences
    if (preferences.length > 6) {
      return NextResponse.json(
        { error: "Maximum 6 preferences allowed" },
        { status: 400 }
      );
    }

    // Verify the term exists and electives survey is open
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("code, name, electives_survey_open")
      .eq("code", term_code)
      .single();

    if (termError || !term) {
      return NextResponse.json(
        { error: "Invalid academic term" },
        { status: 400 }
      );
    }

    if (!term.electives_survey_open) {
      return NextResponse.json(
        { error: "Elective preference survey is not currently open" },
        { status: 400 }
      );
    }

    // If no preferences, delete existing draft
    if (preferences.length === 0) {
      await supabase
        .from("elective_preferences")
        .delete()
        .eq("student_id", user.id)
        .eq("term_code", term_code)
        .eq("status", "DRAFT");

      return NextResponse.json({
        success: true,
        message: "Draft cleared",
      });
    }

    // Validate course codes exist
    const courseCodes = preferences.map((p) => p.course_code);
    const { data: courses, error: coursesError } = await supabase
      .from("course")
      .select("code")
      .in("code", courseCodes)
      .eq("type", "ELECTIVE");

    if (coursesError) {
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

    // Delete existing DRAFT preferences for this student and term
    const { error: deleteError } = await supabase
      .from("elective_preferences")
      .delete()
      .eq("student_id", user.id)
      .eq("term_code", term_code)
      .eq("status", "DRAFT");

    if (deleteError) {
      console.error("Error deleting old draft:", deleteError);
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      );
    }

    // Insert new draft preferences
    const insertData = preferences.map((p) => ({
      student_id: user.id,
      course_code: p.course_code,
      term_code: term_code,
      preference_order: p.preference_order,
      status: "DRAFT",
      submitted_at: null,
    }));

    const { error: insertError } = await supabase
      .from("elective_preferences")
      .insert(insertData);

    if (insertError) {
      console.error("Error inserting draft:", insertError);
      return NextResponse.json(
        { error: "Failed to save draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Draft saved",
      count: preferences.length,
      saved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

