import { NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { getActiveTerm } from "@/lib/db/term";

/**
 * GET /api/v1/teaching-load/stats
 *
 * Returns teaching load statistics for all instructors
 *
 * Access: teaching_load, scheduling roles
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["teaching_load", "scheduling"]);

    const supabase = await createClient();

    const activeTerm = await getActiveTerm();

    if (!activeTerm) {
      return createSuccessResponse({
        instructors: [],
        totalInstructors: 0,
        overloaded: 0,
        nearCapacity: 0,
        balanced: 0,
        underutilized: 0,
        avgUtilization: 0,
      });
    }

    // Get all faculty profiles with their sections
    const { data: facultyProfiles, error: facultyError } = await supabase
      .from("faculty_profile")
      .select(
        `
        user_id,
        name,
        max_load_per_week,
        department
      `
      )
      .eq("department", "SWE");

    if (facultyError) {
      throw facultyError;
    }

    // Get all sections with instructor assignments - Filter by Active Term
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select(
        `
        id,
        instructor_id,
        course_code,
        course:course!section_course_code_fkey(weekly_hours),
        schedule:schedule!schedule_section_id_fkey!inner(term_id)
      `
      )
      .like("course_code", "SWE%")
      .eq("schedule.term_id", activeTerm.id);

    if (sectionsError) {
      throw sectionsError;
    }

    // Calculate load for each instructor
    const instructors = (facultyProfiles || []).map((profile) => {
      const instructorSections = (sections || []).filter(
        (s) => s.instructor_id === profile.user_id
      );

      // Calculate current sections and hours
      const currentSections = instructorSections.length;
      const currentHours = instructorSections.reduce((sum, section) => {
        const course = Array.isArray(section.course)
          ? section.course[0]
          : section.course;
        return sum + (course?.weekly_hours || 3); // Default to 3 hours if not specified
      }, 0);

      const maxLoad = profile.max_load_per_week || 12;
      const utilizationPercent =
        maxLoad > 0 ? Math.round((currentHours / maxLoad) * 100) : 0;

      let status: "overloaded" | "near-capacity" | "balanced" | "underutilized";
      if (utilizationPercent > 100) {
        status = "overloaded";
      } else if (utilizationPercent >= 80) {
        status = "near-capacity";
      } else if (utilizationPercent >= 60) {
        status = "balanced";
      } else {
        status = "underutilized";
      }

      return {
        user_id: profile.user_id,
        name: profile.name || "Unknown",
        max_load_per_week: maxLoad,
        current_sections: currentSections,
        current_hours: currentHours,
        utilization_percent: utilizationPercent,
        status,
      };
    });

    // Calculate summary statistics
    const totalInstructors = instructors.length;
    const overloaded = instructors.filter(
      (i) => i.status === "overloaded"
    ).length;
    const nearCapacity = instructors.filter(
      (i) => i.status === "near-capacity"
    ).length;
    const balanced = instructors.filter((i) => i.status === "balanced").length;
    const underutilized = instructors.filter(
      (i) => i.status === "underutilized"
    ).length;
    const avgUtilization =
      totalInstructors > 0
        ? Math.round(
          instructors.reduce((sum, i) => sum + i.utilization_percent, 0) /
          totalInstructors
        )
        : 0;

    return createSuccessResponse({
      instructors,
      totalInstructors,
      overloaded,
      nearCapacity,
      balanced,
      underutilized,
      avgUtilization,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
