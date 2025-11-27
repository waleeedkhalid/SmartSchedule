/**
 * Schedule Generation Endpoint
 * 
 * POST /api/v1/schedules/generate - Generate schedule for a term
 * 
 * Only scheduling role can generate schedules.
 * This endpoint uses the scheduling algorithm to assign rooms and time slots
 * to all draft sections, then creates schedule entries.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { generateSchedule, type SchedulingInput } from "@/lib/scheduling/algorithm";

interface MeetingPattern {
  days?: string[];
  start?: string;
  duration?: number;
  is_lab?: boolean;
}

interface SectionForScheduling {
  id: string;
  course_code: string;
  section_no: string;
  instructor_id: string | null;
  room_code: string | null;
  capacity: number;
  group_level: number;
  activity: string | null;
  meeting_pattern: unknown;
}

interface RoomForScheduling {
  code: string;
  type: "Lecture" | "Lab";
  capacity: number | null;
}

interface ScheduleEntry {
  section_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { term_id } = body;

    if (!term_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: term_id"
      );
    }

    const supabase = await createClient();

    // Check if term exists
    const { data: term } = await supabase
      .from("academic_term")
      .select("id, code, name")
      .eq("id", term_id)
      .single();

    if (!term) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Academic term with id '${term_id}' not found`
      );
    }

    // Fetch all required data in parallel
    const [
      coursesResult,
      sectionsResult,
      roomsResult,
      timeGridResult,
      existingSchedulesResult,
    ] = await Promise.all([
      // Get all courses (for creating sections)
      supabase
        .from("course")
        .select("code, title, level, credits, weekly_hours, is_elective"),
      // Get all sections (to check which courses already have sections)
      supabase
        .from("section")
        .select("id, course_code, section_no, instructor_id, room_code, capacity, group_level, activity, meeting_pattern, state"),
      // Get all rooms
      supabase
        .from("room")
        .select("code, type, capacity"),
      // Get time grid configuration
      supabase
        .from("time_grid_config")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      // Get existing schedules for this term
      supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", term_id),
    ]);

    if (coursesResult.error) {
      throw coursesResult.error;
    }

    if (sectionsResult.error) {
      throw sectionsResult.error;
    }

    if (roomsResult.error) {
      throw roomsResult.error;
    }

    const courses = coursesResult.data || [];
    const allSections = sectionsResult.data || [];
    const rooms = (roomsResult.data || []) as RoomForScheduling[];
    const existingSchedules = (existingSchedulesResult.data || []) as ScheduleEntry[];

    // Step 1: Create draft sections for courses that don't have any sections
    // Only create sections for SWE courses in levels 4-8 (per PRD scheduling scope)
    const sweCourses = courses.filter((c: { code: string; level: number; is_elective: boolean }) => 
      c.code.startsWith('SWE') && c.level >= 4 && c.level <= 8 && !c.is_elective
    );

    // Check which courses already have sections (any state)
    const coursesWithSections = new Set(
      allSections.map((s: { course_code: string }) => s.course_code)
    );

    const coursesNeedingSections = sweCourses.filter(
      (c: { code: string }) => !coursesWithSections.has(c.code)
    );

    // Create draft sections for courses that need them
    const createdSections: SectionForScheduling[] = [];
    if (coursesNeedingSections.length > 0) {
      const sectionsToCreate = coursesNeedingSections.map((course: { code: string; level: number; credits: number }) => ({
        course_code: course.code,
        section_no: "01", // Default to section 01
        instructor_id: null,
        room_code: null,
        capacity: 30, // Default capacity
        group_level: course.level,
        activity: "lecture" as const,
        meeting_pattern: {},
        state: "draft",
        created_by: user.id,
      }));

      const { data: newSections, error: createError } = await supabase
        .from("section")
        .insert(sectionsToCreate)
        .select("id, course_code, section_no, instructor_id, room_code, capacity, group_level, activity, meeting_pattern");

      if (createError) {
        throw createError;
      }

      if (newSections) {
        createdSections.push(...(newSections as SectionForScheduling[]));
      }
    }

    // Get all draft sections (including newly created ones) for scheduling
    const draftSections = [
      ...allSections.filter((s: { state: string }) => s.state === "draft"),
      ...createdSections,
    ] as SectionForScheduling[];

    // Use default time grid config if none exists
    let timeGridConfig;
    if (timeGridResult.error && timeGridResult.error.code === "PGRST116") {
      // No config exists, use defaults
      timeGridConfig = {
        teaching_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        daily_start_time: '08:00:00',
        daily_end_time: '17:00:00',
        slot_duration_minutes: 60,
        break_start_time: '12:00:00',
        break_end_time: '13:00:00',
        typical_lab_duration_minutes: 120,
      };
    } else if (timeGridResult.error) {
      throw timeGridResult.error;
    } else {
      timeGridConfig = {
        teaching_days: timeGridResult.data.teaching_days,
        daily_start_time: timeGridResult.data.daily_start_time,
        daily_end_time: timeGridResult.data.daily_end_time,
        slot_duration_minutes: timeGridResult.data.slot_duration_minutes,
        break_start_time: timeGridResult.data.break_start_time,
        break_end_time: timeGridResult.data.break_end_time,
        typical_lab_duration_minutes: timeGridResult.data.typical_lab_duration_minutes,
      };
    }

    // Prepare response message
    let creationMessage = "";
    if (createdSections.length > 0) {
      creationMessage = `Created ${createdSections.length} draft section(s) for courses without sections. `;
    }

    if (draftSections.length === 0) {
      return createSuccessResponse(
        {
          message: creationMessage + "No draft sections found to schedule. All courses already have sections.",
          stats: {
            total_sections: 0,
            added: 0,
            already_scheduled: 0,
            unassigned: 0,
            created: createdSections.length,
          },
          unassigned: [],
        },
        200
      );
    }

    // Filter out sections already in schedule
    const existingSectionIds = new Set(
      (existingSchedules || []).map((s) => s.section_id)
    );

    const sectionsToSchedule = draftSections.filter(
      (s) => !existingSectionIds.has(s.id)
    );

    if (sectionsToSchedule.length === 0) {
      return createSuccessResponse(
        {
          message: "All draft sections are already in the schedule",
          stats: {
            total_sections: draftSections.length,
            added: 0,
            already_scheduled: draftSections.length,
            unassigned: 0,
          },
          unassigned: [],
        },
        200
      );
    }

    // Create a map of course codes to weekly_hours for quick lookup
    const courseWeeklyHoursMap = new Map<string, number>();
    courses.forEach((course: { code: string; weekly_hours: number | null }) => {
      if (course.weekly_hours) {
        courseWeeklyHoursMap.set(course.code, course.weekly_hours);
      }
    });

    // Prepare sections for algorithm - include ALL sections for conflict validation
    // Even sections with existing assignments need to be validated for conflicts
    const sectionsForAlgorithm = sectionsToSchedule.map((s) => {
      const pattern = s.meeting_pattern as MeetingPattern | null;
      const hasPattern = pattern && 
        typeof pattern === 'object' && 
        Object.keys(pattern).length > 0 &&
        pattern.days &&
        pattern.days.length > 0;

      // Get weekly_hours from course, default to 3 if not found
      const weeklyHours = courseWeeklyHoursMap.get(s.course_code) || 3;

      return {
        id: s.id,
        course_code: s.course_code,
        section_no: s.section_no,
        instructor_id: s.instructor_id,
        room_code: s.room_code,
        capacity: s.capacity,
        group_level: s.group_level,
        weekly_hours: weeklyHours,
        activity: (s.activity || 'lecture') as 'lecture' | 'tutorial' | 'lab',
        meeting_pattern: hasPattern && pattern
          ? {
              days: pattern.days || [],
              start: pattern.start || '',
              duration: pattern.duration || 0,
            }
          : {
              days: [],
              start: '',
              duration: 0,
            },
      };
    });

    // Prepare rooms for algorithm
    const roomsForAlgorithm = rooms.map((r) => ({
      code: r.code,
      type: r.type as "Lecture" | "Lab",
      capacity: r.capacity || 0,
    }));

    // Run scheduling algorithm
    const schedulingInput: SchedulingInput = {
      sections: sectionsForAlgorithm,
      rooms: roomsForAlgorithm,
      timeGridConfig,
    };

    const result = await generateSchedule(schedulingInput);

    // Update sections with assigned room and meeting pattern
    const updatePromises = result.assignments.map(async (assignment) => {
      const meetingPattern = {
        days: assignment.time_slot.days,
        start: assignment.time_slot.start_time,
        duration: assignment.time_slot.duration,
        is_lab: assignment.activity === 'lab',
      };

      const updateData: {
        meeting_pattern: typeof meetingPattern;
        room_code?: string;
      } = {
        meeting_pattern: meetingPattern,
      };

      // Only update room if one was assigned
      if (assignment.room_code) {
        updateData.room_code = assignment.room_code;
      }

      return supabase
        .from("section")
        .update(updateData)
        .eq("id", assignment.section_id);
    });

    await Promise.all(updatePromises);

    // Create schedule entries for all assigned sections
    const scheduleEntries = result.assignments.map((assignment) => ({
      term_id,
      section_id: assignment.section_id,
    }));

    if (scheduleEntries.length > 0) {
      const { error: insertError } = await supabase
        .from("schedule")
        .insert(scheduleEntries);

      if (insertError) {
        throw insertError;
      }
    }

    // Prepare unassigned sections details
    const unassignedDetails = result.unassigned.map((u) => ({
      section_id: u.section_id,
      course_code: u.course_code,
      section_no: u.section_no,
      reason: u.reason,
    }));

    return createSuccessResponse(
      {
        message: creationMessage + (result.success
          ? `Successfully generated schedule for ${result.assignments.length} sections`
          : `Partially generated schedule: ${result.assignments.length} assigned, ${result.unassigned.length} unassigned`),
        stats: {
          total_sections: draftSections.length,
          added: result.assignments.length,
          already_scheduled: existingSectionIds.size,
          unassigned: result.unassigned.length,
          created: createdSections.length,
        },
        unassigned: unassignedDetails,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

