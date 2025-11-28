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
import { extractJoinedRelation } from "@/lib/utils";

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

      const sectionIds = (scheduleSections || []).map((s: { section_id: string }) => s.section_id);

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
      interface ScheduleItem {
        enrollment_id: string;
        course_code: string;
        course_title: string;
        course_name: string;
        credits: number;
        sections: Array<{
          section_id: string;
          section_no: string;
          type: string;
          instructor?: string;
          room?: string;
          meeting_pattern?: {
            days?: string[];
            start?: string;
            duration?: number;
          };
        }>;
      }
      const scheduleMap = new Map<string, ScheduleItem>();


      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enrollments || []).forEach((enrollment: any) => {
        if (!enrollment.section) return;

        // Safely extract joined relations (can be arrays from Supabase)
        const course = extractJoinedRelation(enrollment.section.course);
        const instructor = extractJoinedRelation(enrollment.section.instructor);
        const room = extractJoinedRelation(enrollment.section.room);

        const courseCode = course?.code;
        if (!courseCode) return;

        if (!scheduleMap.has(courseCode)) {
          scheduleMap.set(courseCode, {
            enrollment_id: enrollment.enrollment_id,
            course_code: courseCode,
            course_title: course?.title || "",
            course_name: course?.title || "",
            credits: course?.credits || 0,
            sections: [],
          });
        }

        const courseEntry = scheduleMap.get(courseCode)!;
        courseEntry.sections.push({
          section_id: enrollment.section.section_id,
          section_no: enrollment.section.section_no,
          // Fix: query selects 'activity' field, not 'type'
          type: enrollment.section.activity || "lecture",
          instructor: instructor?.name || "TBA",
          room: room?.code || "TBA",
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
      // Get faculty's profile
      const { data: facultyProfile, error: facultyError } = await supabase
        .from("faculty_profile")
        .select("user_id, name")
        .eq("user_id", user.id)
        .single();

      if (facultyError || !facultyProfile) {
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
        .eq("instructor_id", facultyProfile.user_id);

      if (sectionsError) {
        throw sectionsError;
      }

      if (!sections || sections.length === 0) {
        return createSuccessResponse(
          {
            instructor_id: user.id,
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
      interface SectionWithId {
        id: string;
      }
      const sectionIds = (sections || []).map((s: SectionWithId) => s.id);
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", finalTermId)
        .in("section_id", sectionIds);

      const scheduledSectionIds = new Set(
        (scheduleSections || []).map((s: { section_id: string }) => s.section_id)
      );

      // Filter sections to only include those in the schedule for this term
      const filteredSections = sections.filter((section: SectionWithId) =>
        scheduledSectionIds.has(section.id)
      );

      if (sectionsError) {
        throw sectionsError;
      }

      // Calculate current enrollment for each section
      interface SectionForSchedule extends SectionWithId {
        section_id?: string;
        course_code?: string;
        section_no?: string;
        course?: { code?: string; title?: string; credits?: number } | Array<{ code?: string; title?: string; credits?: number }>;
        room?: { code?: string } | Array<{ code?: string }>;
        meeting_pattern?: unknown;
        capacity?: number;
      }
      const schedule = await Promise.all(
        (filteredSections || []).map(async (section: SectionForSchedule) => {
          // Count registered enrollments for this section
          const { count } = await supabase
            .from("student_enrollment")
            .select("*", { count: "exact", head: true })
            .eq("section_id", section.id)
            .eq("status", "registered");

          // Safely extract joined relations (can be arrays from Supabase)
          const course = extractJoinedRelation(section.course);
          const room = extractJoinedRelation(section.room);

          return {
            section_id: section.section_id || section.id,
            section_no: section.section_no,
            course_code: course?.code || "",
            course_name: course?.title || "",
            credits: course?.credits || 0,
            room: room?.code || "TBA",
            meeting_pattern: section.meeting_pattern,
            capacity: section.capacity,
            current_enrollment: count || 0,
          };
        })
      );

      return createSuccessResponse(
        {
          instructor_id: user.id,
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

