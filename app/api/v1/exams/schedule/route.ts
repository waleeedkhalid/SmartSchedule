/**
 * Exam Scheduling Endpoint
 * 
 * POST /api/v1/exams/schedule - Schedule final exams for SWE courses using CSP solver
 * 
 * Only scheduling role can schedule exams.
 * This endpoint uses the exam CSP algorithm to assign exam dates, times, and rooms
 * while ensuring no student conflicts.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import {
  solveExamCSP,
  type ExamVariable,
  type ExamCSPSolverConfig,
  type StudentEnrollmentMatrix,
} from "@/lib/scheduling/exam-csp-solver";
// Types for query results (partial types since we only select specific columns)
type CourseQueryResult = {
  code: string;
  title: string;
  recommended_level: number | null;
  credits: number;
  weekly_hours: number;
  is_elective: boolean;
};

type SectionQueryResult = {
  id: string;
  course_code: string;
  section_no: string;
  instructor_id: string | null;
  capacity: number;
  activity: string | null;
  state: string;
};

type ScheduleQueryResult = {
  section_id: string;
};


type RoomQueryResult = {
  code: string;
  type: string;
  capacity: number | null;
};

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

    // Get sections scheduled in this term first (to determine which courses to include)
    const { data: scheduledSections } = await supabase
      .from("schedule")
      .select("section_id")
      .eq("term_id", term_id);

    const scheduledSectionIds = new Set(
      (scheduledSections || []).map((s: ScheduleQueryResult) => s.section_id)
    );

    // Fetch all required data
    const [
      sectionsResult,
      coursesResult,
      roomsResult,
      timeGridResult,
      enrollmentsResult,
    ] = await Promise.all([
      // Get all sections (we'll filter by scheduled sections later)
      supabase
        .from("section")
        .select("id, course_code, section_no, instructor_id, capacity, activity, state"),
      // Get all courses that have scheduled sections (SWE + external departments)
      // We'll filter courses based on which ones have scheduled sections
      supabase
        .from("course")
        .select("code, title, recommended_level, credits, weekly_hours, is_elective"),
      // Get all available rooms
      supabase
        .from("room")
        .select("code, type, capacity"),
      // Get time grid configuration for exam settings
      supabase
        .from("time_grid_config")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      // Get all student enrollments to build enrollment matrix
      supabase
        .from("student_enrollment")
        .select("student_id, section_id, status, section:section_id(course_code)")
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

    if (timeGridResult.error && timeGridResult.error.code !== "PGRST116") {
      throw timeGridResult.error;
    }

    if (enrollmentsResult.error) {
      throw enrollmentsResult.error;
    }

    const sections = sectionsResult.data || [];
    const allCourses = coursesResult.data || [];
    const rooms = roomsResult.data || [];
    const timeGridConfig = timeGridResult.data || {
      exam_days: ["Saturday"],
      exam_start_time: "09:00:00",
      exam_end_time: "17:00:00",
    };
    // Handle enrollment query result - section may be array or single object
    const enrollments = (enrollmentsResult.data || []) as Array<{
      student_id: string;
      section_id: string;
      status: string;
      section: { course_code: string } | { course_code: string }[] | null;
    }>;

    // Filter sections to only those scheduled in this term
    const termSections = (sections || []) as SectionQueryResult[];
    const filteredTermSections = termSections.filter((s) =>
      scheduledSectionIds.has(s.id)
    );

    // Get unique course codes from scheduled sections
    const scheduledCourseCodes = new Set(
      filteredTermSections.map((s) => s.course_code)
    );

    // Filter courses to only those with scheduled sections
    // This includes both SWE courses and external department courses
    const courses = (allCourses || []) as CourseQueryResult[];
    const filteredCourses = courses.filter((c) =>
      scheduledCourseCodes.has(c.code)
    );

    // Build student enrollment matrix: student_id -> Set of course_codes
    const enrollmentMatrix: StudentEnrollmentMatrix = new Map();
    for (const enrollment of enrollments) {
      // Handle section as array or single object
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

    // Group sections by course to calculate enrollment counts
    const courseSectionMap = new Map<string, SectionQueryResult[]>();
    for (const section of filteredTermSections) {
      const courseCode = section.course_code;
      if (!courseSectionMap.has(courseCode)) {
        courseSectionMap.set(courseCode, []);
      }
      courseSectionMap.get(courseCode)!.push(section);
    }

    // Create exam variables (one per course)
    const examVariables: ExamVariable[] = [];
    for (const course of filteredCourses) {
      const courseSections = courseSectionMap.get(course.code) || [];
      if (courseSections.length === 0) continue; // Skip courses with no sections

      // Calculate total enrollment (sum of all section capacities)
      const totalEnrollment = courseSections.reduce(
        (sum, s) => sum + (s.capacity || 0),
        0
      );

      // Get instructor (use first section's instructor, or null)
      const firstSection = courseSections[0];
      const instructorId = firstSection?.instructor_id || null;

      // Check if course has lab component
      const hasLab = courseSections.some(
        (s) => s.activity === "lab"
      );

      examVariables.push({
        course_code: course.code,
        course_title: course.title,
        duration_minutes: 120, // Default 2 hours, can be configured
        student_enrollment_count: totalEnrollment,
        instructor_id: instructorId,
        course_level: course.recommended_level || 4,
        has_lab_component: hasLab,
      });
    }

    if (examVariables.length === 0) {
      return createSuccessResponse(
        {
          message: "No courses found to schedule exams for",
          stats: {
            total_exams: 0,
            assigned: 0,
            unassigned: 0,
          },
          assignments: [],
          unassigned: [],
        },
        200
      );
    }

    // Generate exam days from term dates and exam_days config
    // For now, use a simple approach: generate dates for exam_days in a 2-week window
    const examDays: string[] = [];
    const examDaysConfig = timeGridConfig.exam_days || ["Saturday"];
    // Generate exam dates (simplified - in production, use actual term dates)
    // For now, generate next 10 Saturdays (or configured exam days)
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i * 7);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      if (examDaysConfig.includes(dayName)) {
        examDays.push(date.toISOString().split("T")[0]);
      }
    }

    // Generate exam time slots from config
    const examTimeSlots: string[] = [];
    const [startHour, startMin] = (timeGridConfig.exam_start_time || "09:00:00")
      .split(":")
      .map(Number);
    const [endHour] = (timeGridConfig.exam_end_time || "17:00:00")
      .split(":")
      .map(Number);

    // Generate slots every 3 hours (typical exam schedule: 9 AM, 12 PM, 3 PM)
    for (let hour = startHour; hour < endHour; hour += 3) {
      examTimeSlots.push(`${String(hour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`);
    }

    // Use all available rooms - let the CSP solver handle capacity constraints
    const examRooms = ((rooms || []) as RoomQueryResult[])
      .map((r) => ({
        code: r.code,
        capacity: r.capacity || 0,
        type: r.type as "Lecture" | "Lab" | "Auditorium",
      }));

    // Allow scheduling to proceed even if no rooms are available
    // Exams will be left unassigned if no suitable assignments can be found

    // Configure CSP solver
    const cspConfig: ExamCSPSolverConfig = {
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

    // Run CSP solver
    const result = await solveExamCSP(examVariables, cspConfig);

    // Create exam records in database
    const examsToInsert = [];
    for (const [courseCode, assignment] of result.assignments.entries()) {
      examsToInsert.push({
        course_code: courseCode,
        date: assignment.date,
        start_time: assignment.time,
        duration_minutes: assignment.duration_minutes,
        room_codes: [assignment.room],
        created_by: user.id,
      });
    }

    // Delete existing exams for these courses first (if any)
    if (examsToInsert.length > 0) {
      const courseCodes = Array.from(result.assignments.keys());
      await supabase
        .from("exam")
        .delete()
        .in("course_code", courseCodes);
    }

    // Insert new exams
    if (examsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("exam")
        .insert(examsToInsert);

      if (insertError) {
        throw insertError;
      }
    }

    return createSuccessResponse(
      {
        message:
          result.success && result.unassigned.length === 0
            ? "All exams scheduled successfully"
            : `Scheduled ${result.stats.assigned} exams. ${result.stats.unassigned} exams could not be scheduled.`,
        stats: {
          total_exams: result.stats.total_exams,
          assigned: result.stats.assigned,
          unassigned: result.stats.unassigned,
          backtracks: result.stats.backtracks,
        },
        assignments: Array.from(result.assignments.entries()).map(
          ([courseCode, assignment]) => ({
            course_code: courseCode,
            date: assignment.date,
            time: assignment.time,
            room: assignment.room,
            duration_minutes: assignment.duration_minutes,
          })
        ),
        unassigned: result.unassigned,
        csp_stats: result.stats.softConstraintCost
          ? {
            studentLoadPenalty: result.stats.softConstraintCost.studentLoadPenalty,
            courseLoadImbalance: result.stats.softConstraintCost.courseLoadImbalance,
            finalsFollowUp: result.stats.softConstraintCost.finalsFollowUp,
            total: result.stats.softConstraintCost.total,
          }
          : undefined,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

