/**
 * Faculty Schedule API Route (Optimized)
 * GET: Fetch faculty teaching schedule for the current term
 * 
 * Performance Optimizations:
 * - Uses cached auth and profile functions
 * - Parallel data fetching with Promise.all()
 * - Select only required columns
 * - Removed force-dynamic for better caching
 * - Optimized time calculation
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";

/**
 * Calculate total teaching hours from time slots
 */
function calculateTotalHours(sections: any[]): number {
  return sections.reduce((sum, section) => {
    const sectionHours = (section.times || []).reduce((timeSum: number, time: any) => {
      const [startHour, startMinute] = time.start_time.split(':').map(Number);
      const [endHour, endMinute] = time.end_time.split(':').map(Number);
      const hours = (endHour * 60 + endMinute - startHour * 60 - startMinute) / 60;
      return timeSum + hours;
    }, 0);
    return sum + sectionHours;
  }, 0);
}

export async function GET(request: NextRequest) {
  try {
    // Use cached auth function (10-100x faster)
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use cached profile function
    const profile = await getUserProfile();

    if (profile?.role !== "faculty") {
      return NextResponse.json(
        { error: "Faculty access required" },
        { status: 403 }
      );
    }

    const supabase = await createServerClient();

    // Parallel fetching: Get active term and sections simultaneously
    const [activeTermResult, sectionsResult] = await Promise.all([
      supabase
        .from("academic_term")
        .select("code, name")
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("section")
        .select(`
          id,
          section_id,
          course:course_code (
            code,
            name,
            credits
          ),
          room:room_id (
            room_id
          ),
          section_time (
            day,
            start_time,
            end_time
          )
        `)
        .eq("faculty_id", user.id),
    ]);

    const { data: activeTerm } = activeTermResult;
    const { data: sections, error: sectionsError } = sectionsResult;

    if (!activeTerm) {
      return NextResponse.json(
        { error: "No active academic term" },
        { status: 404 }
      );
    }

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return NextResponse.json(
        { error: "Failed to fetch schedule" },
        { status: 500 }
      );
    }

    // Format sections
    const formattedSections = (sections || []).map((section: any) => ({
      section_id: section.section_id,
      course_code: section.course?.code,
      course_name: section.course?.name,
      credits: section.course?.credits,
      room: section.room?.room_id,
      times: section.section_time || [],
    }));

    // Calculate total teaching hours per week
    const totalHours = calculateTotalHours(formattedSections);

    return NextResponse.json({
      success: true,
      term: activeTerm,
      sections: formattedSections,
      total_hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error("Error in /api/faculty/schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

