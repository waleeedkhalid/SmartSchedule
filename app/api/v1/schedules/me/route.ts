/**
 * User Schedule Endpoint
 * 
 * GET /api/v1/schedules/me
 * GET /api/v1/schedules/me?semester_id=:id
 * 
 * Returns the authenticated user's schedule for the current or specified semester.
 * For students, returns their enrolled courses and sections.
 * For faculty, returns their assigned sections.
 * 
 * Why platform-agnostic: Returns structured JSON schedule data that any client
 * can render in their native UI components.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get("semester_id");

    // Real Supabase mode only - no demo support
    const supabase = await createClient();

    // Determine term_id (use provided or current active term)
    let finalTermId = semesterId; // Keep parameter name for backward compatibility
    if (!finalTermId) {
      const { data: currentTerm } = await supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!currentTerm) {
        return createSuccessResponse(
          {
            student_id: user.id,
            level: user.level,
            student_name: user.name,
            semester_id: null,
            schedule: [],
            is_empty: true,
          },
          200
        );
      }
      finalTermId = currentTerm.id;
    }

    // Build schedule based on user role
    if (user.role === "student") {
      // Get sections in schedule for this term, then filter by student enrollments
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", finalTermId);

      const sectionIds = (scheduleSections || []).map((s: any) => s.section_id);

      if (sectionIds.length === 0) {
        return createSuccessResponse(
          {
            student_id: user.id,
            level: user.level,
            student_name: user.name,
            semester_id: finalTermId,
            schedule: [],
            is_empty: true,
          },
          200
        );
      }

      // Get student enrollments with section details
      const { data: enrollments, error: enrollError } = await supabase
        .from("student_enrollment")
        .select(`
          id,
          enrollment_id:id,
          section:section_id (
            id,
            section_id:id,
            section_no,
            course_code,
            activity,
            instructor:instructor_id (
              name
            ),
            room:room_code (
              code
            ),
            meeting_pattern,
            course:course_code (
              code,
              title,
              credits
            )
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "registered")
        .in("section_id", sectionIds);

      if (enrollError) {
        throw enrollError;
      }

      // Group enrollments by course
      const scheduleMap = new Map<string, any>();

      (enrollments || []).forEach((enrollment: any) => {
        // Fix: course_code doesn't exist on enrollment, it comes from section.course.code
        const courseCode = enrollment.section?.course?.code;
        if (!courseCode || !enrollment.section) return;

        if (!scheduleMap.has(courseCode)) {
          scheduleMap.set(courseCode, {
            enrollment_id: enrollment.enrollment_id,
            course_code: courseCode,
            course_name: enrollment.section.course?.title || "",
            credits: enrollment.section.course?.credits || 0,
            sections: [],
          });
        }

        const courseEntry = scheduleMap.get(courseCode);
        courseEntry.sections.push({
          section_id: enrollment.section.section_id,
          section_no: enrollment.section.section_no,
          // Fix: query selects 'activity' field, not 'type'
          type: enrollment.section.activity || "lecture",
          instructor: enrollment.section.instructor?.name || "TBA",
          room: enrollment.section.room?.code || "TBA",
          meeting_pattern: enrollment.section.meeting_pattern,
        });
      });

      const schedule = Array.from(scheduleMap.values());

      return createSuccessResponse(
        {
          student_id: user.id,
          level: user.level,
          student_name: user.name,
          semester_id: finalTermId,
          schedule,
          is_empty: schedule.length === 0,
        },
        200
      );
    } else if (user.role === "faculty") {
      // Get faculty's assigned sections
      // Uses idx_instructor_user_id index
      const { data: instructor, error: instructorError } = await supabase
        .from("instructor")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (instructorError || !instructor) {
        return createSuccessResponse(
          {
            instructor_id: null,
            instructor_name: user.name,
            semester_id: finalTermId,
            schedule: [],
            is_empty: true,
          },
          200
        );
      }

      // Fix: Filter sections by instructor_id first, then check if they're in the schedule
      // This ensures we only get sections assigned to this instructor
      // Uses idx_section_instructor_id index
      const { data: sections, error: sectionsError } = await supabase
        .from("section")
        .select(`
          id,
          section_id:id,
          section_no,
          course:course_code (
            code,
            title,
            credits
          ),
          room:room_code (
            code
          ),
          meeting_pattern,
          capacity
        `)
        .eq("instructor_id", instructor.id);

      if (sectionsError) {
        throw sectionsError;
      }

      if (!sections || sections.length === 0) {
        return createSuccessResponse(
          {
            instructor_id: instructor.id,
            instructor_name: user.name,
            semester_id: finalTermId,
            schedule: [],
            is_empty: true,
          },
          200
        );
      }

      // Get sections in schedule for this term to filter by term
      // Uses idx_schedule_term_id and idx_schedule_section_id indexes
      const sectionIds = (sections || []).map((s: any) => s.id);
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", finalTermId)
        .in("section_id", sectionIds);

      const scheduledSectionIds = new Set(
        (scheduleSections || []).map((s: any) => s.section_id)
      );

      // Filter sections to only include those in the schedule for this term
      const filteredSections = sections.filter((section: any) => 
        scheduledSectionIds.has(section.id)
      );

      if (sectionsError) {
        throw sectionsError;
      }

      // Calculate current enrollment for each section
      const schedule = await Promise.all(
        (filteredSections || []).map(async (section: any) => {
          // Count registered enrollments for this section
          const { count } = await supabase
            .from("student_enrollment")
            .select("*", { count: "exact", head: true })
            .eq("section_id", section.id)
            .eq("status", "registered");

          return {
            section_id: section.section_id,
            section_no: section.section_no,
            course_code: section.course?.code || "",
            course_name: section.course?.title || "",
            credits: section.course?.credits || 0,
            room: section.room?.code || "TBA",
            meeting_pattern: section.meeting_pattern,
            capacity: section.capacity,
            current_enrollment: count || 0,
          };
        })
      );

      return createSuccessResponse(
        {
          instructor_id: instructor.id,
          instructor_name: user.name,
          semester_id: finalTermId,
          schedule,
          is_empty: schedule.length === 0,
        },
        200
      );
    } else {
      // Other roles don't have schedules
      return createSuccessResponse(
        {
          message: "Schedule not available for this role",
          schedule: [],
          is_empty: true,
        },
        200
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

