/**
 * Schedule Generation Endpoint
 *
 * POST /api/v1/schedules/generate - Generate schedule for a term
 *
 * Only scheduling role can generate schedules.
 * This endpoint uses the CSP scheduling algorithm to:
 * 1. Assign rooms and time slots to all draft sections
 * 2. Auto-assign instructors to sections (with load balancing)
 * 3. Schedule final exams with room assignments
 * All operations target the current active semester.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import {
  generateSchedule,
  type SchedulingInput,
} from "@/lib/scheduling/algorithm";
import {
  solveCSP,
  assignInstructorsToSections,
  type InstructorForAssignment,
  type InstructorAssignmentResult,
} from "@/lib/scheduling/csp-solver";
import {
  solveExamCSP,
  type ExamVariable,
  type ExamCSPSolverConfig,
  type StudentEnrollmentMatrix,
} from "@/lib/scheduling/exam-csp-solver";

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
    const { term_id, use_csp_solver, csp_config } = body;

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
      .select("id, code, name, start_date, end_date")
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
      instructorsResult,
      enrollmentsResult,
    ] = await Promise.all([
      // Get all courses (for creating sections)
      supabase
        .from("course")
        .select(
          "code, title, recommended_level, credits, weekly_hours, is_elective"
        ),
      // Get all sections (to check which courses already have sections)
      supabase
        .from("section")
        .select(
          "id, course_code, section_no, instructor_id, room_code, capacity, group_level, activity, meeting_pattern, state"
        ),
      // Get all rooms
      supabase.from("room").select("code, type, capacity"),
      // Get time grid configuration
      supabase
        .from("time_grid_config")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      // Get existing schedules for this term
      supabase.from("schedule").select("section_id").eq("term_id", term_id),
      // Get all instructors for auto-assignment
      supabase
        .from("faculty_profile")
        .select("id, name, email, max_load_per_week, unavailable_times"),
      // Get all student enrollments for exam scheduling
      supabase
        .from("student_enrollment")
        .select(
          "student_id, section_id, status, section:section_id(course_code)"
        )
        .eq("status", "registered"),
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

    // Handle instructors fetch result (don't fail if no instructors)
    if (instructorsResult.error) {
      console.warn("Could not fetch instructors:", instructorsResult.error);
    }

    // Handle enrollments fetch result (don't fail if no enrollments)
    if (enrollmentsResult.error) {
      console.warn("Could not fetch enrollments:", enrollmentsResult.error);
    }

    const courses = coursesResult.data || [];
    const allSections = sectionsResult.data || [];
    const rooms = (roomsResult.data || []) as RoomForScheduling[];
    const existingSchedules = (existingSchedulesResult.data ||
      []) as ScheduleEntry[];

    // Process instructors for auto-assignment
    const rawInstructors = instructorsResult.data || [];

    // Calculate current load for each instructor based on existing sections
    const instructorSectionCounts = new Map<string, number>();
    for (const section of allSections) {
      if (section.instructor_id) {
        const current = instructorSectionCounts.get(section.instructor_id) || 0;
        // Estimate hours based on activity type (3 for lecture, 2 for lab/tutorial)
        const hours =
          section.activity === "lab" || section.activity === "tutorial" ? 2 : 3;
        instructorSectionCounts.set(section.instructor_id, current + hours);
      }
    }

    // Prepare instructors for assignment
    interface RawInstructor {
      id: string;
      name: string;
      email: string | null;
      max_load_per_week: number | null;
      unavailable_times: Array<{
        day: string;
        slots: Array<{ start: string; end: string; type: string }>;
      }> | null;
    }

    const instructorsForAssignment: InstructorForAssignment[] = (
      rawInstructors as RawInstructor[]
    ).map((inst) => ({
      id: inst.id,
      name: inst.name,
      email: inst.email,
      max_load_per_week: inst.max_load_per_week,
      unavailable_times: inst.unavailable_times,
      current_load: instructorSectionCounts.get(inst.id) || 0,
    }));

    // Process enrollments for exam scheduling
    const enrollments = (enrollmentsResult.data || []) as Array<{
      student_id: string;
      section_id: string;
      status: string;
      section: { course_code: string } | { course_code: string }[] | null;
    }>;

    // Step 1: Create draft sections for courses that don't have any sections
    // Only create sections for SWE courses in levels 4-8 (per PRD scheduling scope)
    const sweCourses = courses.filter(
      (c: {
        code: string;
        recommended_level: number | null;
        is_elective: boolean;
      }) =>
        c.code.startsWith("SWE") &&
        c.recommended_level !== null &&
        c.recommended_level >= 4 &&
        c.recommended_level <= 8 &&
        !c.is_elective
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
      const sectionsToCreate = coursesNeedingSections.map(
        (course: {
          code: string;
          recommended_level: number | null;
          credits: number;
        }) => ({
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
        })
      );

      const { data: newSections, error: createError } = await supabase
        .from("section")
        .insert(sectionsToCreate)
        .select(
          "id, course_code, section_no, instructor_id, room_code, capacity, group_level, activity, meeting_pattern, state"
        );

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
      if (
        !config.teaching_days ||
        !Array.isArray(config.teaching_days) ||
        config.teaching_days.length === 0
      ) {
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

      if (
        !config.slot_duration_minutes ||
        config.slot_duration_minutes < 15 ||
        config.slot_duration_minutes > 180
      ) {
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

      if (
        !config.typical_lab_duration_minutes ||
        config.typical_lab_duration_minutes < 60 ||
        config.typical_lab_duration_minutes > 300
      ) {
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
        exam_days: config.exam_days,
        exam_start_time: config.exam_start_time,
        exam_end_time: config.exam_end_time,
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
          message:
            creationMessage +
            "No draft sections found to schedule. All courses already have sections.",
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
      const hasPattern =
        pattern &&
        typeof pattern === "object" &&
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
        activity: (s.activity || "lecture") as "lecture" | "tutorial" | "lab",
        meeting_pattern:
          hasPattern && pattern
            ? {
                days: pattern.days || [],
                start: pattern.start || "",
                duration: pattern.duration || 0,
              }
            : {
                days: [],
                start: "",
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

    let result;
    if (use_csp_solver) {
      result = await solveCSP(schedulingInput, csp_config);
    } else {
      result = await generateSchedule(schedulingInput);
    }

    // Step 2: Auto-assign instructors to all scheduled sections
    // Re-evaluate all sections and assign instructors based on availability and load balancing
    let instructorAssignmentResults: InstructorAssignmentResult[] = [];
    let instructorsAssigned = 0;
    let instructorAssignmentsFailed = 0;

    if (result.assignments.length > 0 && instructorsForAssignment.length > 0) {
      // Prepare sections with time slots for instructor assignment
      const sectionsForInstructorAssignment = result.assignments.map(
        (assignment) => ({
          id: assignment.section_id,
          course_code: assignment.course_code,
          time_slot: assignment.time_slot,
          weekly_hours: courseWeeklyHoursMap.get(assignment.course_code) || 3,
        })
      );

      // Reset instructor loads since we're re-evaluating all sections
      const freshInstructors = instructorsForAssignment.map((inst) => ({
        ...inst,
        current_load: 0, // Start fresh for this scheduling run
      }));

      instructorAssignmentResults = assignInstructorsToSections(
        sectionsForInstructorAssignment,
        freshInstructors,
        [] // No existing assignments since we're assigning all
      );

      // Count successes and failures
      instructorsAssigned = instructorAssignmentResults.filter(
        (r) => r.success
      ).length;
      instructorAssignmentsFailed = instructorAssignmentResults.filter(
        (r) => !r.success
      ).length;
    }

    // Create a map of section_id to assigned instructor_id
    const instructorAssignmentMap = new Map<string, string | null>();
    for (const assignmentResult of instructorAssignmentResults) {
      if (assignmentResult.success && assignmentResult.instructor_id) {
        instructorAssignmentMap.set(
          assignmentResult.section_id,
          assignmentResult.instructor_id
        );
      }
    }

    // Update sections with assigned room, meeting pattern, and instructor
    const updatePromises = result.assignments.map(async (assignment) => {
      const meetingPattern = {
        days: assignment.time_slot.days,
        start: assignment.time_slot.start_time,
        duration: assignment.time_slot.duration,
        is_lab: assignment.activity === "lab",
      };

      const updateData: {
        meeting_pattern: typeof meetingPattern;
        room_code?: string;
        instructor_id?: string | null;
      } = {
        meeting_pattern: meetingPattern,
      };

      // Only update room if one was assigned
      if (assignment.room_code) {
        updateData.room_code = assignment.room_code;
      }

      // Update instructor if one was assigned
      const assignedInstructorId = instructorAssignmentMap.get(
        assignment.section_id
      );
      if (assignedInstructorId !== undefined) {
        updateData.instructor_id = assignedInstructorId;
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

    // Schedule exams for all courses with scheduled sections using CSP solver
    // Step 3: Schedule final exams with room assignments
    const scheduledCourses = new Set(
      result.assignments.map((a) => a.course_code)
    );

    // Build student enrollment matrix for exam conflict checking
    const enrollmentMatrix: StudentEnrollmentMatrix = new Map();
    for (const enrollment of enrollments) {
      const section = Array.isArray(enrollment.section)
        ? enrollment.section[0]
        : enrollment.section;
      if (!section?.course_code) continue;

      const studentId = enrollment.student_id;
      if (!enrollmentMatrix.has(studentId)) {
        enrollmentMatrix.set(studentId, new Set());
      }
      enrollmentMatrix.get(studentId)!.add(section.course_code);
    }

    // Prepare exam variables for CSP solver
    const courseSectionMap = new Map<string, typeof result.assignments>();
    for (const assignment of result.assignments) {
      if (!courseSectionMap.has(assignment.course_code)) {
        courseSectionMap.set(assignment.course_code, []);
      }
      courseSectionMap.get(assignment.course_code)!.push(assignment);
    }

    const examVariables: ExamVariable[] = [];
    for (const courseCode of scheduledCourses) {
      const courseSections = courseSectionMap.get(courseCode) || [];
      const course = courses.find(
        (c: { code: string }) => c.code === courseCode
      );

      // Calculate total enrollment from sections
      const totalEnrollment = sectionsToSchedule
        .filter((s) => s.course_code === courseCode)
        .reduce((sum, s) => sum + (s.capacity || 30), 0);

      // Get instructor from first section
      const assignedInstructorId =
        instructorAssignmentMap.get(courseSections[0]?.section_id || "") ||
        null;

      // Check if course has lab component
      const hasLab = courseSections.some((s) => s.activity === "lab");

      examVariables.push({
        course_code: courseCode,
        course_title: course?.title || courseCode,
        duration_minutes: 120, // Default 2-hour exam
        student_enrollment_count: totalEnrollment,
        instructor_id: assignedInstructorId,
        course_level: course?.recommended_level || 4,
        has_lab_component: hasLab,
      });
    }

    // Configure exam scheduling
    let examSchedulingResult: {
      success: boolean;
      assigned: number;
      unassigned: number;
      assignments: Array<{
        course_code: string;
        date: string;
        time: string;
        room: string;
      }>;
      unassignedDetails: Array<{
        course_code: string;
        reason: string;
      }>;
    } = {
      success: true,
      assigned: 0,
      unassigned: 0,
      assignments: [],
      unassignedDetails: [],
    };

    if (
      examVariables.length > 0 &&
      timeGridConfig.exam_days &&
      timeGridConfig.exam_days.length > 0
    ) {
      // Generate exam days from configuration
      const examDays: string[] = [];
      const today = new Date();
      const examDaysConfig = timeGridConfig.exam_days as string[];

      // Generate exam dates for the next 10 weeks on exam days
      for (let i = 0; i < 70; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
        if (examDaysConfig.includes(dayName)) {
          examDays.push(date.toISOString().split("T")[0]);
          if (examDays.length >= 10) break; // Limit to 10 exam days
        }
      }

      // Generate exam time slots
      const examTimeSlots: string[] = [];
      const [startHour] = (timeGridConfig.exam_start_time || "09:00:00")
        .split(":")
        .map(Number);
      const [endHour] = (timeGridConfig.exam_end_time || "17:00:00")
        .split(":")
        .map(Number);

      // Generate slots every 3 hours
      for (let hour = startHour; hour < endHour; hour += 3) {
        examTimeSlots.push(`${String(hour).padStart(2, "0")}:00`);
      }

      // Prepare exam rooms
      const examRooms = rooms.map((r) => ({
        code: r.code,
        capacity: r.capacity || 0,
        type: r.type as "Lecture" | "Lab" | "Auditorium",
      }));

      // Configure and run exam CSP solver
      const examConfig: ExamCSPSolverConfig = {
        examDays,
        examTimeSlots,
        examRooms,
        studentEnrollmentMatrix: enrollmentMatrix,
        maxBacktracks: 50000,
        enableForwardChecking: true,
        enableSoftConstraints: true,
        softConstraintWeights: {
          studentLoadPenalty: 20,
          courseLoadImbalance: 10,
          finalsFollowUp: 5,
        },
      };

      try {
        const examResult = await solveExamCSP(examVariables, examConfig);

        // Delete existing exams for scheduled courses
        if (examResult.assignments.size > 0) {
          const courseCodes = Array.from(scheduledCourses);
          await supabase.from("exam").delete().in("course_code", courseCodes);
        }

        // Insert new exams
        const examsToInsert = [];
        for (const [
          courseCode,
          assignment,
        ] of examResult.assignments.entries()) {
          examsToInsert.push({
            course_code: courseCode,
            date: assignment.date,
            start_time: assignment.time,
            duration_minutes: assignment.duration_minutes,
            room_codes: [assignment.room],
            created_by: user.id,
          });
        }

        if (examsToInsert.length > 0) {
          const { error: examInsertError } = await supabase
            .from("exam")
            .insert(examsToInsert);

          if (examInsertError) {
            console.error("Error creating exams:", examInsertError);
          }
        }

        examSchedulingResult = {
          success: examResult.success,
          assigned: examResult.stats.assigned,
          unassigned: examResult.stats.unassigned,
          assignments: Array.from(examResult.assignments.entries()).map(
            ([courseCode, assignment]) => ({
              course_code: courseCode,
              date: assignment.date,
              time: assignment.time,
              room: assignment.room,
            })
          ),
          unassignedDetails: examResult.unassigned,
        };
      } catch (examError) {
        console.error("Error in exam CSP solver:", examError);
        examSchedulingResult.success = false;
        examSchedulingResult.unassignedDetails = [
          {
            course_code: "ALL",
            reason:
              "Exam scheduling failed: " +
              (examError instanceof Error
                ? examError.message
                : "Unknown error"),
          },
        ];
      }
    }

    // Prepare unassigned sections details
    const unassignedDetails = result.unassigned.map((u) => ({
      section_id: u.section_id,
      course_code: u.course_code,
      section_no: u.section_no,
      reason: u.reason,
    }));

    // Extract CSP stats if available
    const cspStats =
      "stats" in result && "backtracks" in result.stats
        ? {
            backtracks: result.stats.backtracks,
            softConstraintCost:
              "softConstraintCost" in result.stats
                ? result.stats.softConstraintCost
                : undefined,
          }
        : undefined;

    // Build comprehensive message
    let message = creationMessage;
    if (result.success) {
      message += `Successfully generated schedule for ${result.assignments.length} sections`;
    } else {
      message += `Partially generated schedule: ${result.assignments.length} assigned, ${result.unassigned.length} unassigned`;
    }
    message += `. Instructors: ${instructorsAssigned} assigned`;
    if (instructorAssignmentsFailed > 0) {
      message += `, ${instructorAssignmentsFailed} failed`;
    }
    message += `. Exams: ${examSchedulingResult.assigned} scheduled`;
    if (examSchedulingResult.unassigned > 0) {
      message += `, ${examSchedulingResult.unassigned} unassigned`;
    }
    message += ".";

    return createSuccessResponse(
      {
        message,
        stats: {
          total_sections: draftSections.length,
          sections_assigned: result.assignments.length,
          sections_unassigned: result.unassigned.length,
          already_scheduled: existingSectionIds.size,
          sections_created: createdSections.length,
          instructors_assigned: instructorsAssigned,
          instructors_failed: instructorAssignmentsFailed,
          exams_scheduled: examSchedulingResult.assigned,
          exams_unassigned: examSchedulingResult.unassigned,
        },
        unassigned: unassignedDetails,
        instructor_assignments: instructorAssignmentResults
          .filter((r) => r.success)
          .map((r) => ({
            section_id: r.section_id,
            instructor_id: r.instructor_id,
            instructor_name: r.instructor_name,
          })),
        instructor_failures: instructorAssignmentResults
          .filter((r) => !r.success)
          .map((r) => ({
            section_id: r.section_id,
            reason: r.reason,
          })),
        exam_assignments: examSchedulingResult.assignments,
        exam_unassigned: examSchedulingResult.unassignedDetails,
        csp_stats: cspStats,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
