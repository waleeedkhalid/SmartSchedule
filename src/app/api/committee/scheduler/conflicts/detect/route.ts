/**
 * Conflict Detection API
 * Comprehensive conflict detection for schedules and sections
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";
import { ConflictChecker } from "@/lib/schedule/ConflictChecker";
import { ConflictResolutionEngine } from "@/lib/schedule/ConflictResolutionEngine";
import type {
  ScheduledSection,
  ScheduledExam,
  SchedulerCourse,
} from "@/types/scheduler";

/**
 * POST /api/committee/scheduler/conflicts/detect
 * Detect conflicts in a schedule or set of sections
 * 
 * Body:
 * {
 *   student_id?: string;
 *   student_level?: number;
 *   sections: ScheduledSection[];
 *   exams?: ScheduledExam[];
 *   completed_courses?: string[];
 *   required_courses?: string[];
 *   include_suggestions?: boolean; // Include resolution suggestions
 *   max_daily_hours?: number;
 * }
 */
export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();
    const {
      student_id,
      student_level,
      sections,
      exams = [],
      completed_courses = [],
      required_courses = [],
      include_suggestions = true,
      max_daily_hours,
    } = body;

    // Validate required fields
    if (!sections || !Array.isArray(sections)) {
      return validationErrorResponse({
        message: "sections array is required",
      });
    }

    // Initialize conflict checkers
    const conflictChecker = new ConflictChecker();
    const resolutionEngine = new ConflictResolutionEngine();

    // Get course data for prerequisite checking
    const { data: coursesData } = await supabase
      .from("course")
      .select("code, name, credits, department, level, type, prerequisites, is_swe_managed");

    const courseMap = new Map<string, SchedulerCourse>();
    if (coursesData) {
      coursesData.forEach((course) => {
        courseMap.set(course.code, {
          code: course.code,
          name: course.name,
          credits: course.credits,
          department: course.department,
          level: course.level,
          type: course.type as "REQUIRED" | "ELECTIVE",
          prerequisites: course.prerequisites,
          is_swe_managed: course.is_swe_managed,
          created_at: new Date().toISOString(),
          updated_at: null,
        });
      });
    }

    // Detect conflicts
    const conflicts = student_id
      ? conflictChecker.detectAllConflicts({
          studentId: student_id,
          studentLevel: student_level || 1,
          sections,
          exams,
          completedCourses: completed_courses,
          requiredCourses: required_courses,
          courseData: courseMap,
          maxDailyHours: max_daily_hours,
        })
      : [
          // If no student_id, just check basic conflicts
          ...conflictChecker.checkRoomConflicts(sections),
        ];

    // Check faculty conflicts
    const facultySchedule = new Map<string, ScheduledSection[]>();
    sections.forEach((section) => {
      if (section.instructor_name) {
        if (!facultySchedule.has(section.instructor_name)) {
          facultySchedule.set(section.instructor_name, []);
        }
        facultySchedule.get(section.instructor_name)!.push(section);
      }
    });
    conflicts.push(...conflictChecker.checkFacultyConflicts(facultySchedule));

    // Generate resolution suggestions if requested
    if (include_suggestions) {
      for (const conflict of conflicts) {
        const options = resolutionEngine.generateResolutionOptions(conflict, sections);
        conflict.resolution_suggestions = options.map((opt) => opt.description);
      }
    }

    // Get conflict summary
    const summary = conflictChecker.summarizeConflicts(conflicts);

    return successResponse({
      conflicts,
      summary,
      student_id,
      detected_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/conflicts/detect:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

