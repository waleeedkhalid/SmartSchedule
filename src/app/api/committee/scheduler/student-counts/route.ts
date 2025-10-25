/**
 * Scheduler Student Counts API
 * Get student enrollment data and statistics for schedule planning
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";

/**
 * GET /api/committee/scheduler/student-counts
 * Get student enrollment statistics for a term
 * Query params:
 * - term_code: string (required)
 * - group_by: 'level' | 'course' | 'course_type' (optional, default: 'course')
 */
export async function GET(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is committee member
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee) {
    return errorResponse("Unauthorized: Must be committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const termCode = searchParams.get("term_code");
  const groupBy = searchParams.get("group_by") || "course";

  if (!termCode) {
    return validationErrorResponse({ message: "term_code is required" });
  }

  try {
    // Use the database function to get enrollment stats
    const { data: enrollmentStats, error: statsError } = await supabase
      .rpc("get_course_enrollment_stats", { p_term_code: termCode });

    if (statsError) {
      console.error("Database error:", statsError);
      return errorResponse(statsError.message);
    }

    // Get elective preference counts
    const { data: preferenceData, error: prefError } = await supabase
      .from("elective_preferences")
      .select("course_code, preference_order")
      .eq("term_code", termCode)
      .eq("status", "SUBMITTED");

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
    }

    // Group preference counts by course and rank
    const preferencesByCourse = (preferenceData || []).reduce(
      (acc, pref) => {
        if (!acc[pref.course_code]) {
          acc[pref.course_code] = {};
        }
        if (!acc[pref.course_code][pref.preference_order]) {
          acc[pref.course_code][pref.preference_order] = 0;
        }
        acc[pref.course_code][pref.preference_order]++;
        return acc;
      },
      {} as Record<string, Record<number, number>>
    );

    // Enhance enrollment stats with preference counts
    const enhancedStats = (enrollmentStats || []).map((stat: any) => ({
      course_code: stat.course_code,
      course_name: stat.course_name,
      course_type: stat.course_type,
      level: stat.level,
      total_students: stat.total_students || 0,
      enrolled_students: stat.enrolled_students || 0,
      sections_needed: stat.sections_needed || 0,
      preference_counts:
        stat.course_type === "ELECTIVE" && preferencesByCourse[stat.course_code]
          ? Object.entries(preferencesByCourse[stat.course_code]).map(
              ([rank, count]) => ({
                preference_rank: parseInt(rank),
                student_count: count,
              })
            )
          : [],
    }));

    if (groupBy === "course") {
      return successResponse({
        term_code: termCode,
        courses: enhancedStats,
        total_courses: enhancedStats.length,
      });
    }

    if (groupBy === "level") {
      // Group by level
      const byLevel = enhancedStats.reduce(
        (acc: any, stat: any) => {
          const level = stat.level || 0;
          if (!acc[level]) {
            acc[level] = {
              level,
              student_count: 0,
              required_courses: 0,
              elective_selections: 0,
            };
          }
          acc[level].student_count += stat.total_students;
          if (stat.course_type === "REQUIRED") {
            acc[level].required_courses++;
          } else {
            acc[level].elective_selections += stat.total_students;
          }
          return acc;
        },
        {} as Record<number, {
          level: number;
          student_count: number;
          required_courses: number;
          elective_selections: number;
        }>
      );

      return successResponse({
        term_code: termCode,
        by_level: Object.values(byLevel).sort((a: any, b: any) => a.level - b.level),
      });
    }

    if (groupBy === "course_type") {
      // Group by course type
      const byCourseType = enhancedStats.reduce(
        (acc: any, stat: any) => {
          const type = stat.course_type;
          if (!acc[type]) {
            acc[type] = {
              type,
              course_count: 0,
              total_enrollments: 0,
              avg_students_per_course: 0,
            };
          }
          acc[type].course_count++;
          acc[type].total_enrollments += stat.total_students;
          return acc;
        },
        {} as Record<string, {
          type: string;
          course_count: number;
          total_enrollments: number;
          avg_students_per_course: number;
        }>
      );

      // Calculate averages
      Object.values(byCourseType).forEach((group: any) => {
        group.avg_students_per_course = group.course_count > 0
          ? Math.round(group.total_enrollments / group.course_count)
          : 0;
      });

      return successResponse({
        term_code: termCode,
        by_course_type: Object.values(byCourseType),
      });
    }

    return errorResponse("Invalid group_by parameter", 400);
  } catch (error) {
    console.error("Error in GET /api/committee/scheduler/student-counts:", error);
    return errorResponse("Internal server error");
  }
}


