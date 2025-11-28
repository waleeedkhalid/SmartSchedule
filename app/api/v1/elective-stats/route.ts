/**
 * Elective Statistics API Route
 * 
 * GET /api/v1/elective-stats - Get aggregated elective preference statistics
 * 
 * Returns statistics about student elective preferences grouped by course.
 * Only accessible by scheduling role.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export interface ElectivePreferenceStat {
  course_code: string;
  course_title: string;
  level: number | null;
  total_requests: number;
  first_choice: number;
  second_choice: number;
  third_choice: number;
  other_choice: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only scheduling role can view elective stats
    requireRole(user, ["scheduling"]);

    const supabase = await createClient();

    // Get all elective preferences with course information
    const { data: preferences, error: prefError } = await supabase
      .from("elective_preference")
      .select(`
        course_code,
        rank,
        course:course!elective_preference_course_code_fkey(
          code,
          title,
          recommended_level
        )
      `);

    if (prefError) {
      throw prefError;
    }

    // Group preferences by course_code
    const statsMap = new Map<string, ElectivePreferenceStat>();

    preferences?.forEach((pref) => {
      const courseCode = pref.course_code;
      const course = pref.course as
        | { code: string; title: string; recommended_level: number | null }
        | null;

      if (!course) return;

      if (!statsMap.has(courseCode)) {
        statsMap.set(courseCode, {
          course_code: courseCode,
          course_title: course.title,
          level: course.recommended_level,
          total_requests: 0,
          first_choice: 0,
          second_choice: 0,
          third_choice: 0,
          other_choice: 0,
        });
      }

      const stat = statsMap.get(courseCode)!;
      stat.total_requests++;

      if (pref.rank === 1) {
        stat.first_choice++;
      } else if (pref.rank === 2) {
        stat.second_choice++;
      } else if (pref.rank === 3) {
        stat.third_choice++;
      } else {
        stat.other_choice++;
      }
    });

    // Convert map to array and sort by course_code
    const stats = Array.from(statsMap.values()).sort((a, b) =>
      a.course_code.localeCompare(b.course_code)
    );

    // Calculate summary statistics
    const totalRequests = stats.reduce((sum, s) => sum + s.total_requests, 0);
    const totalFirstChoice = stats.reduce((sum, s) => sum + s.first_choice, 0);
    const avgRequestsPerCourse =
      stats.length > 0 ? Number((totalRequests / stats.length).toFixed(1)) : 0;

    return createSuccessResponse(
      {
        stats,
        summary: {
          totalRequests,
          totalFirstChoice,
          totalCourses: stats.length,
          avgRequestsPerCourse,
        },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

