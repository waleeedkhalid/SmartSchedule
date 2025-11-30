/**
 * Available Sections Endpoint
 *
 * GET /api/v1/available-sections - Get sections available for student registration
 *
 * This endpoint returns sections that a student can register for, applying
 * academic rules:
 * - Student level must be >= course's recommended level
 * - Prerequisites must be satisfied
 * - Student should not have already passed the course
 * - Section must be released
 * - Section must have available seats
 *
 * Only students can access this endpoint.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// Types for database query results
interface CourseData {
  code: string;
  title: string;
  credits: number;
  is_elective: boolean;
  recommended_level: number | null;
}

interface InstructorData {
  id: string | null;
  user_id: string | null;
  name: string | null;
  email: string | null;
}

interface RoomData {
  code: string;
  type: string;
}

interface SectionRow {
  id: string;
  course_code: string;
  section_no: string;
  activity: string | null;
  instructor_id: string | null;
  room_code: string | null;
  capacity: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  } | null;
  group_level: number;
  state: string;
  created_at: string;
  course: CourseData | CourseData[] | null;
  instructor: InstructorData | InstructorData[] | null;
  room: RoomData | RoomData[] | null;
}

interface PrerequisiteRow {
  course_code: string;
  prerequisite_course_code: string;
}

interface ScheduleSectionRow {
  section_id: string;
}

// Helper to safely extract a single object from potential array
function extractSingle<T>(data: T | T[] | null): T | null {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }
  return data;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);

    // Only students can access available sections
    requireRole(user, ["student"]);

    const studentId = user.id;
    const studentLevel = user.level || 1;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get term_id (optional)
    let termId = searchParams.get("term_id") || searchParams.get("semester_id");

    // If no term_id provided, get current active term
    if (!termId) {
      const { data: currentTerm } = await supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (currentTerm) {
        termId = currentTerm.id;
      }
    }

    // Get section IDs from schedule for the term
    let scheduleSectionIds: string[] = [];
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      scheduleSectionIds = (scheduleSections || []).map(
        (s: ScheduleSectionRow) => s.section_id
      );
    }

    // If term has no sections, return empty
    if (termId && scheduleSectionIds.length === 0) {
      return createSuccessResponse([], 200);
    }

    // Step 1: Get student's completed/passed courses
    const { data: studentEnrollments } = await supabase
      .from("student_enrollment")
      .select(
        `
        section_id,
        status,
        section:section_id (
          course_code
        )
      `
      )
      .eq("student_id", studentId);

    // Build set of passed course codes
    // Consider 'registered' as in-progress (not passed yet)
    // In a full system, you'd have a grades table to check completion
    const passedCourseCodes = new Set<string>();
    const enrolledCourseCodes = new Set<string>();
    const enrolledSectionIds = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (studentEnrollments || []).forEach((enrollment: any) => {
      // Handle both array (if one-to-many inferred) and object (if one-to-one)
      const sectionData = Array.isArray(enrollment.section)
        ? enrollment.section[0]
        : enrollment.section;
      const courseCode = sectionData?.course_code;
      if (courseCode) {
        if (enrollment.status === "registered") {
          enrolledCourseCodes.add(courseCode);
          enrolledSectionIds.add(enrollment.section_id);
        } else if (
          enrollment.status === "passed" ||
          enrollment.status === "completed"
        ) {
          passedCourseCodes.add(courseCode);
        }
      }
    });

    // Step 2: Get all prerequisites
    const { data: allPrerequisites } = await supabase
      .from("course_prerequisite")
      .select("course_code, prerequisite_course_code");

    // Build prerequisite map: course_code -> array of prerequisite codes
    const prerequisiteMap = new Map<string, string[]>();
    (allPrerequisites || []).forEach((prereq: PrerequisiteRow) => {
      const existing = prerequisiteMap.get(prereq.course_code) || [];
      existing.push(prereq.prerequisite_course_code);
      prerequisiteMap.set(prereq.course_code, existing);
    });

    // Step 3: Fetch all sections with their courses
    let query = supabase
      .from("section")
      .select(
        `
        *,
        activity,
        course:course_code (
          code,
          title,
          credits,
          is_elective,
          recommended_level
        ),
        instructor:faculty_profile!section_instructor_id_fkey (
          id,
          user_id,
          name,
          email
        ),
        room:room_code (
          code,
          type
        )
      `
      )
      .eq("state", "released"); // Only released sections

    // Filter by term's sections if available
    if (scheduleSectionIds.length > 0) {
      query = query.in("id", scheduleSectionIds);
    }

    const { data: sectionsData, error } = await query.order("course_code", {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    // Step 4: Get enrollment counts for all sections
    const sectionIds = (sectionsData || []).map((s: SectionRow) => s.id);
    const enrollmentCounts = new Map<string, number>();

    if (sectionIds.length > 0) {
      const { data: enrollmentData } = await supabase
        .from("student_enrollment")
        .select("section_id")
        .in("section_id", sectionIds)
        .eq("status", "registered");

      // Count enrollments per section
      (enrollmentData || []).forEach((e: { section_id: string }) => {
        const count = enrollmentCounts.get(e.section_id) || 0;
        enrollmentCounts.set(e.section_id, count + 1);
      });
    }

    // Step 5: Filter and transform sections based on academic rules
    const availableSections = (sectionsData || [])
      .map((section: SectionRow) => {
        const course = extractSingle(section.course);
        const instructor = extractSingle(section.instructor);
        const room = extractSingle(section.room);

        if (!course) return null;

        const courseCode = section.course_code;
        const courseLevel = course.recommended_level || 1;
        const prerequisites = prerequisiteMap.get(courseCode) || [];

        // Check if student has passed this course already
        const alreadyPassed = passedCourseCodes.has(courseCode);
        if (alreadyPassed) {
          return null; // Skip courses already passed
        }

        // Check student level (student must be at or above course level)
        // Allow students to take courses at their level or below
        const levelEligible = studentLevel >= courseLevel;

        // Check prerequisites (all prerequisites must be passed OR currently enrolled)
        const missingPrerequisites = prerequisites.filter(
          (prereqCode) =>
            !passedCourseCodes.has(prereqCode) &&
            !enrolledCourseCodes.has(prereqCode)
        );
        const prerequisitesSatisfied = missingPrerequisites.length === 0;

        // Check if already enrolled in this specific section
        const alreadyEnrolledInSection = enrolledSectionIds.has(section.id);

        // Check if already enrolled in another section of the same course
        const alreadyEnrolledInCourse = enrolledCourseCodes.has(courseCode);

        // Get enrollment count and calculate availability
        const enrolledCount = enrollmentCounts.get(section.id) || 0;
        const capacity = section.capacity || 0;
        const availableSeats = capacity - enrolledCount;
        const isFull = availableSeats <= 0;

        // Determine lock reasons
        const lockReasons: string[] = [];
        if (!levelEligible) {
          lockReasons.push(
            `Requires level ${courseLevel} (you are level ${studentLevel})`
          );
        }
        if (!prerequisitesSatisfied) {
          lockReasons.push(
            `Missing prerequisites: ${missingPrerequisites.join(", ")}`
          );
        }

        // Determine if section is available for registration
        const isLocked = !levelEligible || !prerequisitesSatisfied;
        const canRegister =
          !isLocked &&
          !isFull &&
          !alreadyEnrolledInSection &&
          !alreadyEnrolledInCourse;

        return {
          section_id: section.id,
          course_code: courseCode,
          course_title: course.title,
          course_credits: course.credits,
          course_level: courseLevel,
          is_elective: course.is_elective,
          section_no: section.section_no,
          activity: section.activity || "lecture",
          instructor_id: section.instructor_id,
          instructor_name: instructor?.name || null,
          room_code: room?.code || section.room_code || null,
          capacity,
          enrolled_count: enrolledCount,
          available_seats: availableSeats,
          is_full: isFull,
          meeting_pattern: section.meeting_pattern || {
            days: [],
            start: "TBA",
            duration: 0,
          },
          group_level: section.group_level,
          // Academic rule results
          is_locked: isLocked,
          lock_reasons: lockReasons,
          prerequisites,
          missing_prerequisites: missingPrerequisites,
          is_enrolled: alreadyEnrolledInSection,
          is_enrolled_in_course: alreadyEnrolledInCourse,
          can_register: canRegister,
        };
      })
      .filter(
        (section): section is NonNullable<typeof section> => section !== null
      );

    // Return available sections
    return createSuccessResponse(availableSections, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
