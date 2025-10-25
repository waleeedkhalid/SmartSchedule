import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/faculty/feedback
 * LOCKED: Faculty feedback on assigned schedules
 * This endpoint is for faculty to provide feedback on their assigned teaching schedules
 * Only accessible after schedules have been generated
 */
export async function GET() {
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

    // Return locked state - schedules not yet generated
    return NextResponse.json({
      success: true,
      locked: true,
      message: "Schedule feedback will be available after Version 1 of the schedule is generated and published. This feature allows you to provide feedback on your assigned teaching schedule.",
      data: {
        canProvideFeedback: false,
        feedback: null,
      },
    });
  } catch (error) {
    console.error("Error in /api/faculty/feedback:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

