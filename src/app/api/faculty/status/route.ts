import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/faculty/status
 * Fetches the faculty member's current status including active term, courses, and phases
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get current user
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

    // Verify user is faculty
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

    // Get active academic term
    const { data: activeTerm, error: termError } = await supabase
      .from("academic_term")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (termError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch active term" },
        { status: 500 }
      );
    }

    // Count assigned sections/courses for the faculty
    const { count: coursesCount, error: coursesError } = await supabase
      .from("section")
      .select("*", { count: "exact", head: true })
      .eq("instructor_id", user.id);

    if (coursesError) {
      console.error("Error fetching courses count:", coursesError);
    }

    // Check if there are any schedule suggestions/proposals
    // For now, we'll use a placeholder - this can be enhanced with a suggestions table
    const hasPendingSuggestions = false;

    // Build status response
    const status = {
      activeTerm: activeTerm?.code || null,
      termName: activeTerm?.name || null,
      termType: activeTerm?.type || null,
      assignedCoursesCount: coursesCount || 0,
      schedulePublished: activeTerm?.schedule_published || false,
      feedbackOpen: activeTerm?.feedback_open || false,
      canViewFeedback: activeTerm?.feedback_open === false && (coursesCount || 0) > 0, // Can view after feedback closes
      hasPendingSuggestions,
      facultyInfo: {
        facultyNumber: faculty.faculty_number,
        title: faculty.title,
        status: faculty.status,
      },
    };

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error("Error in /api/faculty/status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

