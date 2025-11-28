/**
 * Faculty Statistics API
 * 
 * GET - Get faculty dashboard statistics and chart data
 */

import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { 
  getFacultyStats,
  getFacultyWeeklySchedule,
  getFacultyTeachingLoad,
  getFacultySections
} from "@/lib/db/faculty-data";

/**
 * GET /api/v1/faculty/stats
 * Get comprehensive statistics for the faculty dashboard
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is faculty
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== 'faculty') {
      return NextResponse.json(
        { error: "Forbidden: Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Fetch all data in parallel
    const [stats, weeklySchedule, teachingLoad, sections] = await Promise.all([
      getFacultyStats(user.id),
      getFacultyWeeklySchedule(user.id),
      getFacultyTeachingLoad(user.id),
      getFacultySections(user.id),
    ]);

    // Calculate enrollment data
    const totalEnrolled = sections.reduce((sum, s) => sum + (s.current_enrollment || 0), 0);
    const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);

    return NextResponse.json({
      stats,
      weeklySchedule,
      teachingLoad,
      enrollment: {
        enrolled: totalEnrolled,
        capacity: totalCapacity,
        available: totalCapacity - totalEnrolled,
        utilizationPercent: totalCapacity > 0 
          ? Math.round((totalEnrolled / totalCapacity) * 100) 
          : 0,
      },
      sections: sections.map(s => ({
        id: s.id,
        course_code: s.course_code,
        course_title: s.course_title,
        section_no: s.section_no,
        capacity: s.capacity,
        enrolled: s.current_enrollment || 0,
        state: s.state,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

