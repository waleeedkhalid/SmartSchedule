import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/faculty/courses
 * LOCKED: Courses will be assigned after schedule generation
 * Currently in data collection phase - collecting faculty availability and student preferences
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

    // Return locked state - schedule not yet generated
    return NextResponse.json({
      success: true,
      locked: true,
      message: "Course assignments will be available after schedule generation. We are currently collecting faculty availability and student preferences to create Version 1 of the schedule.",
      data: {
        sections: [],
        totalCourses: 0,
      },
    });
  } catch (error) {
    console.error("Error in /api/faculty/courses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

