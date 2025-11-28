/**
 * Enrollments Endpoint
 * 
 * GET /api/v1/enrollments - Get user's enrollments
 * POST /api/v1/enrollments - Register for a section
 * 
 * Handles student enrollment operations.
 * Students can only view and manage their own enrollments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { extractJoinedRelation } from "@/lib/utils";

/**
 * Check if two time slots overlap
 */
function doTimeSlotsOverlap(
  days1: string[],
  start1: string,
  duration1: number,
  days2: string[],
  start2: string,
  duration2: number
): boolean {
  // Check if days overlap
  const daysOverlap = days1.some((day) => days2.includes(day));
  if (!daysOverlap) return false;

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start1) || !timeRegex.test(start2)) {
    return false;
  }

  // Parse times to minutes
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = start2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = start1Minutes + duration1;
  const start2Minutes = h2 * 60 + m2;
  const end2Minutes = start2Minutes + duration2;

  // Check if times overlap
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// GET - List user's enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can view enrollments
    requireRole(user, ["student"]);

    // Real Supabase mode only - no demo support
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("semester_id") || searchParams.get("term_id"); // Support both for backward compatibility

    // Get section IDs for the term (if term_id provided)
    let sectionIds: string[] | null = null;
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      sectionIds = (scheduleSections || []).map((s: { section_id: string }) => s.section_id);
    } else {
      // Default to current active term
      const { data: currentTerm } = await supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (currentTerm) {
        const { data: scheduleSections } = await supabase
          .from("schedule")
          .select("section_id")
          .eq("term_id", currentTerm.id);

        sectionIds = (scheduleSections || []).map((s: { section_id: string }) => s.section_id);
      }
    }

    // Build query for student enrollments
    // Uses indexes: idx_student_enrollment_student_id, idx_student_enrollment_status
    let query = supabase
      .from("student_enrollment")
      .select(`
        *,
        section:section_id (
          *,
          course:course_code (
            code,
            title,
            credits,
            is_elective
          )
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "registered");

    // Filter by term if section IDs are available
    // Uses idx_student_enrollment_section_id index
    if (sectionIds && sectionIds.length > 0) {
      query = query.in("section_id", sectionIds);
    } else if (sectionIds !== null && sectionIds.length === 0) {
      // Term exists but has no sections
      return createSuccessResponse([], 200);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map to API response format
    interface EnrollmentWithSection {
      id: string;
      student_id: string;
      section_id: string;
      status: string;
      enrolled_at: string;
      dropped_at: string | null;
      section?: {
        id: string;
        section_no: number;
        meeting_pattern: string;
        course?: {
          code: string;
          title?: string;
          credits?: number;
          is_elective?: boolean;
        } | Array<{
          code: string;
          title?: string;
          credits?: number;
          is_elective?: boolean;
        }>;
        course_code?: string;
      };
    }
    const enrollments = (data || []).map((enrollment: EnrollmentWithSection) => {
      const course = extractJoinedRelation(enrollment.section?.course);
      return {
        id: enrollment.id,
        student_id: enrollment.student_id,
        section_id: enrollment.section_id,
        course_code: course?.code || null, // Fix: course_code comes from section.course.code, not section.course_code
        enrollment_type: course?.is_elective ? "elective" : "required",
        status: enrollment.status === "registered" ? "enrolled" : "dropped",
        enrolled_at: enrollment.enrolled_at,
        dropped_at: enrollment.dropped_at,
        course: course
          ? {
            code: course.code,
            name: course.title || "",
            credits: course.credits || 0,
          }
          : null,
        section: enrollment.section
          ? {
            id: enrollment.section.id,
            section_no: enrollment.section.section_no,
            meeting_pattern: enrollment.section.meeting_pattern,
          }
          : null,
      };
    });

    return createSuccessResponse(enrollments, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Register for a section
export async function POST(request: NextRequest) {


  try {
    const user = await authenticateRequest(request);

    // Only students can enroll
    requireRole(user, ["student"]);

    const body = await request.json();
    const { section_id } = body;

    if (!section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "section_id is required"
      );
    }

    // Real Supabase mode only - no demo support
    const supabase = await createClient();

    // STEP 1: Check if registration is open
    const { data: registrationStatus, error: regError } = await supabase
      .rpc("is_registration_open");

    if (regError) {
      // Continue if function doesn't exist (backward compatibility)
      // Registration status check is optional - if RPC doesn't exist, allow registration
    } else if (!registrationStatus) {
      return createErrorResponse(
        403,
        ErrorCodes.VALIDATION_ERROR,
        "Registration is not currently open. Please check the academic timeline for registration dates."
      );
    }

    // STEP 2: Check if section exists and get full section details
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select(`
        id,
        course_code,
        section_no,
        meeting_pattern,
        capacity,
        course:course_code (
          code,
          title,
          credits,
          is_elective
        )
      `)
      .eq("id", section_id)
      .single();

    if (sectionError || !section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Section not found or no longer available"
      );
    }

    // Check if section is released
    const { data: sectionState } = await supabase
      .from("section")
      .select("state")
      .eq("id", section_id)
      .single();

    if (sectionState?.state !== "released") {
      return createErrorResponse(
        403,
        ErrorCodes.VALIDATION_ERROR,
        "This section is not yet available for registration. Sections must be released before students can enroll."
      );
    }

    // Check if already enrolled
    // Uses indexes: idx_student_enrollment_student_id, idx_student_enrollment_section_id, idx_student_enrollment_status
    const { data: existing } = await supabase
      .from("student_enrollment")
      .select("id")
      .eq("student_id", user.id)
      .eq("section_id", section_id)
      .eq("status", "registered")
      .single();

    if (existing) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Already enrolled in this section"
      );
    }

    // STEP 3: Check for time/day conflicts with existing enrollments
    const meetingPattern = section.meeting_pattern as {
      days?: string[];
      start?: string;
      duration?: number;
    } | null;

    if (meetingPattern?.days && meetingPattern.start && meetingPattern.duration) {
      // Get all student's current enrollments with their meeting patterns
      const { data: currentEnrollments } = await supabase
        .from("student_enrollment")
        .select(`
          section:section_id (
            id,
            course_code,
            section_no,
            meeting_pattern
          )
        `)
        .eq("student_id", user.id)
        .eq("status", "registered");

      // Check for time conflicts
      const conflicts: string[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (currentEnrollments || []).forEach((enrollment: any) => {
        const enrolledSection = Array.isArray(enrollment.section) ? enrollment.section[0] : enrollment.section;
        if (!enrolledSection?.meeting_pattern) return;


        const enrolledPattern = enrolledSection.meeting_pattern as {
          days?: string[];
          start?: string;
          duration?: number;
        };

        if (
          enrolledPattern.days &&
          enrolledPattern.start &&
          enrolledPattern.duration &&
          doTimeSlotsOverlap(
            meetingPattern.days || [],
            meetingPattern.start!,
            meetingPattern.duration!,
            enrolledPattern.days || [],
            enrolledPattern.start!,
            enrolledPattern.duration!
          )


        ) {
          conflicts.push(
            `${enrolledSection.course_code} ${enrolledSection.section_no}`
          );
        }
      });

      if (conflicts.length > 0) {
        return createErrorResponse(
          409,
          ErrorCodes.VALIDATION_ERROR,
          `Time conflict detected! This section overlaps with: ${conflicts.join(", ")}. Please choose a different section or drop the conflicting enrollment first.`
        );
      }
    }

    // STEP 4: Check for exam conflicts
    const course = extractJoinedRelation(section.course);
    const courseCode = section.course_code;

    if (courseCode) {
      // Get exams for the course being enrolled
      const { data: newCourseExams } = await supabase
        .from("exam")
        .select("date, start_time, duration_minutes")
        .eq("course_code", courseCode);

      if (newCourseExams && newCourseExams.length > 0) {
        // Get all courses the student is enrolled in
        const { data: enrolledSections } = await supabase
          .from("student_enrollment")
          .select(`
            section:section_id (
              course_code
            )
          `)
          .eq("student_id", user.id)
          .eq("status", "registered")
          .neq("section_id", section_id);


        const enrolledCourseCodes = (enrolledSections || [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((e: any) => {
            const section = Array.isArray(e.section) ? e.section[0] : e.section;
            return section?.course_code;
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((code: any): code is string => !!code);


        if (enrolledCourseCodes.length > 0) {
          // Get exams for enrolled courses
          const { data: enrolledExams } = await supabase
            .from("exam")
            .select("course_code, date, start_time, duration_minutes")
            .in("course_code", enrolledCourseCodes);

          // Check for exam conflicts
          interface ExamData {
            course_code?: string;
            date: string;
            start_time: string;
            duration_minutes?: number;
          }

          const examConflicts: string[] = [];
          (newCourseExams || []).forEach((newExam: ExamData) => {
            (enrolledExams || []).forEach((enrolledExam: ExamData) => {
              // Check if same date
              if (newExam.date === enrolledExam.date) {
                // Check if times overlap
                const newStart = parseTimeToMinutes(newExam.start_time);
                const newEnd = newStart + (newExam.duration_minutes || 0);
                const enrolledStart = parseTimeToMinutes(enrolledExam.start_time);
                const enrolledEnd = enrolledStart + (enrolledExam.duration_minutes || 0);

                if (newStart < enrolledEnd && enrolledStart < newEnd) {
                  examConflicts.push(
                    `${enrolledExam.course_code} exam on ${newExam.date}`
                  );
                }
              }
            });
          });

          if (examConflicts.length > 0) {
            return createErrorResponse(
              409,
              ErrorCodes.VALIDATION_ERROR,
              `Exam conflict detected! This course's exams conflict with: ${examConflicts.join(", ")}. Please choose a different section or contact your advisor.`
            );
          }
        }
      }
    }

    // STEP 5: Check 20 credit limit
    // Get all current enrollments with their course credits
    const { data: currentEnrollments } = await supabase
      .from("student_enrollment")
      .select(`
        section:section_id (
          course:course_code (
            credits
          )
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "registered");

    // Calculate total credits
    let totalCredits = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (currentEnrollments || []).forEach((enrollment: any) => {
      const enrolledSection = Array.isArray(enrollment.section) ? enrollment.section[0] : enrollment.section;
      const enrolledCourse = Array.isArray(enrolledSection?.course) ? enrolledSection.course[0] : enrolledSection?.course;

      if (enrolledCourse?.credits) {
        totalCredits += enrolledCourse.credits;
      }
    });

    // Get credits for the course being enrolled (course already declared in STEP 4)
    const newCourseCredits = course?.credits || 0;
    const newTotalCredits = totalCredits + newCourseCredits;

    // Check 20 credit limit
    if (newTotalCredits > 20) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        `Credit limit exceeded. You currently have ${totalCredits} credits enrolled. Adding this ${newCourseCredits}-credit course would exceed the 20-credit limit. Please drop a course first or choose a course with fewer credits.`
      );
    }

    // STEP 6: Check capacity
    const { data: enrollmentCount } = await supabase
      .from("student_enrollment")
      .select("id", { count: "exact", head: true })
      .eq("section_id", section_id)
      .eq("status", "registered");

    const currentEnrollmentCount = enrollmentCount || 0;
    if (currentEnrollmentCount >= (section.capacity || 0)) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        "This section is full. Please choose another section."
      );
    }

    // Determine if course is elective
    const isElective = course?.is_elective || false;

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("student_enrollment")
      .insert({
        student_id: user.id,
        section_id: section_id,
        status: "registered",
      })
      .select(`
        *,
        section:section_id (
          *,
          course:course_code (
            code,
            title,
            credits,
            is_elective
          )
        )
      `)
      .single();

    if (enrollError) {
      throw enrollError;
    }

    // Map to API response format
    const enrollmentCourse = extractJoinedRelation(enrollment.section?.course);
    const mappedEnrollment = {
      id: enrollment.id,
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      course_code: enrollmentCourse?.code || null, // Fix: course_code comes from section.course.code, not section.course_code
      enrollment_type: isElective ? "elective" : "required",
      status: "enrolled",
      enrolled_at: enrollment.enrolled_at,
      dropped_at: enrollment.dropped_at,
      course: enrollmentCourse
        ? {
          code: enrollmentCourse.code,
          name: enrollmentCourse.title || "",
          credits: enrollmentCourse.credits || 0,
        }
        : null,
      section: enrollment.section
        ? {
          id: enrollment.section.id,
          section_no: enrollment.section.section_no,
          meeting_pattern: enrollment.section.meeting_pattern,
        }
        : null,
    };

    return createSuccessResponse(mappedEnrollment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

