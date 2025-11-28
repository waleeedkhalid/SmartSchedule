import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Faculty Feedback API
 * GET: Retrieve feedback status and existing feedback
 * POST: Submit new feedback on assigned schedule
 */

const feedbackSchema = z.object({
  schedule_version_id: z.string().uuid(),
  section_id: z.string().min(1),
  feedback_type: z.enum(['WORKLOAD', 'TIME_CONFLICT', 'COURSE_PREFERENCE', 'OTHER']),
  comment: z.string().min(10).max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is a faculty member
    const { data: faculty, error: facultyError } = await supabase
      .from("faculty")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (facultyError || !faculty) {
      return NextResponse.json(
        { success: false, error: "Faculty profile not found" },
        { status: 404 }
      );
    }

    // Check if feedback period is open
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("is_faculty_feedback_visible, code")
      .eq("is_active", true)
      .maybeSingle();

    if (!activeTerm?.is_faculty_feedback_visible) {
      return NextResponse.json({
        success: true,
        locked: true,
        message:
          "Schedule feedback will be available after the schedule is published. This feature allows you to provide feedback on your assigned teaching schedule.",
        data: {
          canProvideFeedback: false,
          feedback: [],
        },
      });
    }

    // Fetch faculty's sections
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select(`
        section_id,
        course_code,
        capacity,
        instructor_id,
        course:course_code (
          course_code,
          course_name,
          credits
        )
      `)
      .eq("instructor_id", user.id);

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch sections" },
        { status: 500 }
      );
    }

    // Fetch existing feedback
    const { data: existingFeedback, error: feedbackError } = await supabase
      .from("faculty_feedback")
      .select("*")
      .eq("faculty_id", user.id)
      .order("created_at", { ascending: false });

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
    }

    return NextResponse.json({
      success: true,
      locked: false,
      data: {
        canProvideFeedback: true,
        sections: sections || [],
        feedback: existingFeedback || [],
        term_code: activeTerm.code,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/faculty/feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is a faculty member
    const { data: faculty, error: facultyError } = await supabase
      .from("faculty")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (facultyError || !faculty) {
      return NextResponse.json(
        { success: false, error: "Faculty profile not found" },
        { status: 404 }
      );
    }

    // Check if feedback period is open
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("is_faculty_feedback_visible, code")
      .eq("is_active", true)
      .maybeSingle();

    if (!activeTerm?.is_faculty_feedback_visible) {
      return NextResponse.json(
        { success: false, error: "Feedback period is not currently open" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = feedbackSchema.parse(body);

    // Verify section belongs to this faculty member
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select("section_id, course_code")
      .eq("section_id", validated.section_id)
      .eq("instructor_id", user.id)
      .maybeSingle();

    if (sectionError || !section) {
      return NextResponse.json(
        { success: false, error: "Section not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Insert feedback
    const { data: insertedFeedback, error: insertError } = await supabase
      .from("faculty_feedback")
      .insert({
        faculty_id: user.id,
        schedule_version_id: validated.schedule_version_id,
        section_id: validated.section_id,
        course_code: section.course_code,
        feedback_type: validated.feedback_type,
        comment: validated.comment,
        severity: validated.severity,
        status: 'SUBMITTED',
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      data: insertedFeedback,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Unexpected error in POST /api/faculty/feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
