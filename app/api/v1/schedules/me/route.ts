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
import { authenticateRequest, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { getMockStudentSchedule, getMockFacultySections, getMockFacultyProfile } from "@/lib/demo-data";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get("semester_id");

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      if (user.role === "student") {
        const schedule = await getMockStudentSchedule(user.id, user.level);
        
        // Transform to match API response format
        // Ensure schedule.sections is an array
        const sectionsArray = (schedule?.sections && Array.isArray(schedule.sections)) 
          ? schedule.sections 
          : [];
        const scheduleItems = sectionsArray.map((section: {
          id: string;
          course_code: string;
          course_title: string;
          section_no: string;
          credits: number;
          instructor_name: string | null;
          room_code: string | null;
          meeting_pattern: {
            days: string[];
            start: string;
            duration: number;
            is_lab: boolean;
          };
        }) => ({
          enrollment_id: `enrollment-${section.id}`,
          course_code: section.course_code,
          course_name: section.course_title,
          credits: section.credits,
          sections: [{
            section_id: section.id,
            section_no: section.section_no,
            type: section.meeting_pattern.is_lab ? "lab" : "lecture",
            instructor: section.instructor_name || "TBA",
            room: section.room_code || "TBA",
            meeting_pattern: {
              days: section.meeting_pattern.days,
              start_time: section.meeting_pattern.start,
              duration_minutes: section.meeting_pattern.duration,
              type: section.meeting_pattern.is_lab ? "lab" : "lecture",
            },
          }],
        }));

        return createSuccessResponse(
          {
            student_id: user.id,
            level: user.level,
            student_name: user.name,
            semester_id: semesterId || "demo-semester",
            schedule: scheduleItems,
            is_empty: scheduleItems.length === 0,
          },
          200
        );
      } else if (user.role === "faculty") {
        const instructorProfile = await getMockFacultyProfile(user.id);
        
        if (!instructorProfile) {
          return createSuccessResponse(
            {
              instructor_id: null,
              instructor_name: user.name,
              semester_id: semesterId || "demo-semester",
              schedule: [],
              is_empty: true,
            },
            200
          );
        }

        const sections = await getMockFacultySections(instructorProfile.id);
        
        const schedule = sections.map((section) => ({
          section_id: section.id,
          section_no: section.section_no,
          course_code: section.course_code,
          course_name: section.course_title,
          credits: section.credits,
          room: section.room_code || "TBA",
          meeting_pattern: {
            days: section.meeting_pattern.days,
            start_time: section.meeting_pattern.start,
            duration_minutes: section.meeting_pattern.duration,
            type: section.meeting_pattern.is_lab ? "lab" : "lecture",
          },
          capacity: section.capacity,
          current_enrollment: 0, // Mock data doesn't track enrollment counts
        }));

        return createSuccessResponse(
          {
            instructor_id: instructorProfile.id,
            instructor_name: user.name,
            semester_id: semesterId || "demo-semester",
            schedule,
            is_empty: schedule.length === 0,
          },
          200
        );
      } else {
        // Other roles (scheduling, teaching_load, registrar) don't have schedules
        // Return appropriate response based on role
        if (user.role === "scheduling" || user.role === "teaching_load" || user.role === "registrar") {
          return createSuccessResponse(
            {
              student_id: user.id,
              level: user.level,
              student_name: user.name,
              semester_id: semesterId || "demo-semester",
              schedule: [],
              is_empty: true,
            },
            200
          );
        }
        
        return createSuccessResponse(
          {
            message: "Schedule not available for this role",
            schedule: [],
            is_empty: true,
          },
          200
        );
      }
    }

    // Handle real Supabase mode
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

