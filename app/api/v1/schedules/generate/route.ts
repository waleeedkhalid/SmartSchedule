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
        .select("code, title, recommended_level, credits, weekly_hours, is_elective"),
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
    const sweCourses = courses.filter((c: { code: string; recommended_level: number | null; is_elective: boolean }) => 
      c.code.startsWith('SWE') && c.recommended_level !== null && c.recommended_level >= 4 && c.recommended_level <= 8 && !c.is_elective
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
      const sectionsToCreate = coursesNeedingSections.map((course: { code: string; recommended_level: number | null; credits: number }) => ({
        course_code: course.code,
        section_no: "01", // Default to section 01
        instructor_id: null,
        room_code: null,
        capacity: 30, // Default capacity
        group_level: course.recommended_level ?? 1, // Use recommended_level, default to 1 if null
        activity: "lecture" as const,
        meeting_pattern: {},
        state: "draft",
        created_by: user.id,
      }));

      const { data: newSections, error: createError } = await supabase
        .from("section")
        .insert(sectionsToCreate)
        .select("id, course_code, section_no, instructor_id, room_code, capacity, group_level, activity, meeting_pattern, state");

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

    // Use time grid config from database - MUST follow scheduling settings
    let timeGridConfig;
    if (timeGridResult.error && timeGridResult.error.code === "PGRST116") {
      // No config exists, use defaults (should not happen in production)
      // This means scheduling settings haven't been configured yet
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Scheduling settings not configured. Please configure time grid settings in Scheduling Settings before generating schedules."
      );
    } else if (timeGridResult.error) {
      throw timeGridResult.error;
    } else {
      // Use the actual configured settings from database - MUST follow scheduling settings
      const config = timeGridResult.data;
      
      // Validate that all required settings are present
      if (!config.teaching_days || !Array.isArray(config.teaching_days) || config.teaching_days.length === 0) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Invalid scheduling settings: teaching_days must be a non-empty array. Please update Scheduling Settings."
        );
      }
      
      if (!config.daily_start_time || !config.daily_end_time) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Invalid scheduling settings: daily_start_time and daily_end_time are required. Please update Scheduling Settings."
        );
      }
      
      if (!config.slot_duration_minutes || config.slot_duration_minutes < 15 || config.slot_duration_minutes > 180) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Invalid scheduling settings: slot_duration_minutes must be between 15 and 180. Please update Scheduling Settings."
        );
      }
      
      if (!config.break_start_time || !config.break_end_time) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Invalid scheduling settings: break_start_time and break_end_time are required. Please update Scheduling Settings."
        );
      }
      
      if (!config.typical_lab_duration_minutes || config.typical_lab_duration_minutes < 60 || config.typical_lab_duration_minutes > 300) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Invalid scheduling settings: typical_lab_duration_minutes must be between 60 and 300. Please update Scheduling Settings."
        );
      }
      
      // Use the configured settings exactly as stored in database
      timeGridConfig = {
        teaching_days: config.teaching_days,
        daily_start_time: config.daily_start_time,
        daily_end_time: config.daily_end_time,
        slot_duration_minutes: config.slot_duration_minutes,
        break_start_time: config.break_start_time,
        break_end_time: config.break_end_time,
        typical_lab_duration_minutes: config.typical_lab_duration_minutes,
        // Note: exam_days, exam_start_time, exam_end_time are stored but not used in schedule generation
        // They are used for exam scheduling (separate feature)
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

    // Run scheduling algorithm with configured settings
    // The algorithm will use:
    // - teaching_days: Days when classes can be scheduled
    // - daily_start_time / daily_end_time: Time window for scheduling
    // - slot_duration_minutes: Base duration for time slots
    // - break_start_time / break_end_time: Break period (no classes scheduled)
    // - typical_lab_duration_minutes: Duration for lab sessions
    const schedulingInput: SchedulingInput = {
      sections: sectionsForAlgorithm,
      rooms: roomsForAlgorithm,
      timeGridConfig, // Uses configured settings from Scheduling Settings page
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

    // Schedule exams for all courses with scheduled sections
    // Get unique courses from scheduled sections
    const scheduledCourses = new Set(
      result.assignments.map((a) => a.course_code)
    );

    // Get existing exams for this term's courses to avoid duplicates
    const { data: existingExams } = await supabase
      .from("exam")
      .select("course_code, date")
      .in("course_code", Array.from(scheduledCourses));

    const existingExamKeys = new Set(
      (existingExams || []).map((e) => `${e.course_code}-${e.date}`)
    );

    // Get exam rooms (use lecture rooms for exams)
    const examRooms = rooms.filter((r) => r.type === "Lecture");
    
    if (examRooms.length === 0) {
      console.warn("No lecture rooms available for exam scheduling");
    }

    // Calculate exam dates based on term dates and exam_days
    const examDates: string[] = [];
    if (term.start_date && term.end_date && timeGridConfig.exam_days && timeGridConfig.exam_days.length > 0) {
      const startDate = new Date(term.start_date);
      const endDate = new Date(term.end_date);
      
      // Day name to day of week mapping
      const dayMap: { [key: string]: number } = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      
      const examDayNumbers = timeGridConfig.exam_days.map((day) => dayMap[day] ?? -1).filter((d) => d >= 0);
      
      // Find exam dates within term (typically midterm and final)
      // Midterm: around 1/3 of term
      // Final: near end of term
      const termDuration = endDate.getTime() - startDate.getTime();
      const midtermDate = new Date(startDate.getTime() + termDuration / 3);
      const finalDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week before end
      
      // Find closest exam day to midterm and final dates
      for (const targetDate of [midtermDate, finalDate]) {
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(targetDate);
          checkDate.setDate(targetDate.getDate() + i - 3);
          
          if (checkDate >= startDate && checkDate <= endDate) {
            const dayOfWeek = checkDate.getDay();
            if (examDayNumbers.includes(dayOfWeek)) {
              const dateStr = checkDate.toISOString().split("T")[0];
              if (!examDates.includes(dateStr)) {
                examDates.push(dateStr);
                break;
              }
            }
          }
        }
      }
    }

    // Create exams for each course
    const examEntries: Array<{
      course_code: string;
      date: string;
      start_time: string;
      duration_minutes: number;
      room_codes: string[];
      created_by: string | null;
    }> = [];

    if (examDates.length > 0 && examRooms.length > 0 && timeGridConfig.exam_start_time && timeGridConfig.exam_end_time) {
      // Parse exam time window
      const [startHour, startMin] = timeGridConfig.exam_start_time.split(":").map(Number);
      const [endHour, endMin] = timeGridConfig.exam_end_time.split(":").map(Number);
      const examStartMinutes = startHour * 60 + startMin;
      const examEndMinutes = endHour * 60 + endMin;

      // Default exam duration: 2 hours (120 minutes)
      const defaultExamDuration = 120;
      
      let roomIndex = 0;
      let currentTime = examStartMinutes;

      for (const courseCode of scheduledCourses) {
        for (const examDate of examDates) {
          const examKey = `${courseCode}-${examDate}`;
          
          // Skip if exam already exists
          if (existingExamKeys.has(examKey)) {
            continue;
          }

          // Calculate start time
          if (currentTime + defaultExamDuration > examEndMinutes) {
            // Move to next day or next room group
            currentTime = examStartMinutes;
            roomIndex = (roomIndex + 1) % Math.max(1, Math.floor(examRooms.length / 2));
          }

          // Format start time
          const hours = Math.floor(currentTime / 60);
          const minutes = currentTime % 60;
          const startTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;

          // Assign rooms (use 1-2 rooms per exam depending on capacity needs)
          const assignedRooms = examRooms
            .slice(roomIndex, roomIndex + 2)
            .map((r) => r.code);

          examEntries.push({
            course_code: courseCode,
            date: examDate,
            start_time: startTime,
            duration_minutes: defaultExamDuration,
            room_codes: assignedRooms,
            created_by: user.id,
          });

          // Move time forward for next exam
          currentTime += defaultExamDuration + 30; // 30 min buffer between exams
        }
      }

      // Insert exams
      if (examEntries.length > 0) {
        const { error: examInsertError } = await supabase
          .from("exam")
          .insert(examEntries);

        if (examInsertError) {
          console.error("Error creating exams:", examInsertError);
          // Don't fail the entire request if exam creation fails
        }
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

