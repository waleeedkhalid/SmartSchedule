/**
 * Student Dashboard Data
 *
 * Provides real-time data for student dashboard including enrollments, exams, and credit stats
 *
 * Wrapped with React.cache() for request memoization - ensures the same
 * data is only fetched once per request, even if called multiple times
 * in the same render tree.
 *
 * Note: These functions use createClient() which accesses cookies(), so they cannot
 * be wrapped with unstable_cache() for persistent caching. React.cache() provides
 * request-level memoization which is sufficient for preventing duplicate queries.
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";

type Course = Database["public"]["Tables"]["course"]["Row"];

export interface CreditStats {
  total: number;
  required_credits: number;
  elective_credits: number;
  completed_credits: number;
}

export interface StudentEnrollment {
  id: string;
  section_id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  instructor_name: string | null;
  room_code: string | null;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  } | null;
  status: "registered" | "dropped";
  enrolled_at: string;
}

export interface StudentExam {
  id: string;
  course_code: string;
  course_title: string;
  date: string;
  start: string;
  duration: number;
  room_codes: string[];
}

/**
 * Get student level from student_profile table
 * Wrapped with React.cache() for request memoization
 *
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getStudentLevel = cache(
  async (studentId: string): Promise<number | null> => {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("student_profile")
      .select("level")
      .eq("user_id", studentId)
      .single();

    if (error) {
      // PGRST116 is "not found" - expected for students without profile yet
      if (error.code !== "PGRST116") {
        console.warn("Error fetching student level:", error);
      }
      return null;
    }

    return profile?.level ?? null;
  }
);

/**
 * Get student number from student_profile table
 * Wrapped with React.cache() for request memoization
 *
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getStudentNumber = cache(
  async (studentId: string): Promise<string | null> => {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("student_profile")
      .select("student_number")
      .eq("user_id", studentId)
      .single();

    if (error) {
      // PGRST116 is "not found" - expected for students without profile yet
      if (error.code !== "PGRST116") {
        console.warn("Error fetching student number:", error);
      }
      return null;
    }

    return profile?.student_number ?? null;
  }
);

/**
 * Get credit statistics for a student
 * Wrapped with React.cache() for request memoization
 *
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getStudentCreditStats = cache(
  async (studentId: string): Promise<CreditStats> => {
    const supabase = await createClient();

    // Get all enrollments for this student
    const { data: enrollments } = await supabase
      .from("student_enrollment")
      .select(
        `
      section:section!student_enrollment_section_id_fkey(
        course_code,
        course:course!section_course_code_fkey(credits, is_elective)
      )
    `
      )
      .eq("student_id", studentId)
      .eq("status", "registered");

    if (!enrollments) {
      return {
        total: 0,
        required_credits: 0,
        elective_credits: 0,
        completed_credits: 0,
      };
    }

    let totalCredits = 0;
    let requiredCredits = 0;
    let electiveCredits = 0;

    interface EnrollmentWithSection {
      section?: {
        course?: Course;
      };
    }
    for (const enrollment of enrollments as EnrollmentWithSection[]) {
      const section = enrollment.section;
      if (section?.course) {
        const course = section.course as Course;
        const credits = course.credits || 0;
        totalCredits += credits;

        if (course.is_elective) {
          electiveCredits += credits;
        } else {
          requiredCredits += credits;
        }
      }
    }

    return {
      total: totalCredits,
      required_credits: requiredCredits,
      elective_credits: electiveCredits,
      completed_credits: totalCredits, // Assuming enrolled = completed for now
    };
  }
);

/**
 * Get all enrollments for a student with course and section details
 * Wrapped with React.cache() for request memoization
 *
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getStudentEnrollments = cache(
  async (studentId: string): Promise<StudentEnrollment[]> => {
    const supabase = await createClient();

    const { data: enrollments, error } = await supabase
      .from("student_enrollment")
      .select(
        `
      id,
      section_id,
      status,
      enrolled_at,
      section:section!student_enrollment_section_id_fkey(
        course_code,
        section_no,
        room_code,
        meeting_pattern,
        course:course!section_course_code_fkey(title),
        instructor:faculty_profile!section_instructor_id_fkey(name)
      )
    `
      )
      .eq("student_id", studentId)
      .eq("status", "registered")
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Error fetching enrollments:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (enrollments || []).map((enrollment: any) => {
      const sectionData = Array.isArray(enrollment.section)
        ? enrollment.section[0]
        : enrollment.section;
      const courseData = Array.isArray(sectionData?.course)
        ? sectionData.course[0]
        : sectionData?.course;
      const instructorData = Array.isArray(sectionData?.instructor)
        ? sectionData.instructor[0]
        : sectionData?.instructor;

      return {
        id: enrollment.id,
        section_id: enrollment.section_id,
        course_code: sectionData?.course_code || "",
        course_title: courseData?.title || "",
        section_no: sectionData?.section_no || "",
        instructor_name: instructorData?.name || null,
        room_code: sectionData?.room_code || null,
        meeting_pattern: sectionData?.meeting_pattern as {
          days: string[];
          start: string;
          duration: number;
        } | null,
        status: enrollment.status as "registered" | "dropped",
        enrolled_at: enrollment.enrolled_at,
      };
    });
  }
);

/**
 * Get all exams for courses a student is enrolled in
 * Wrapped with React.cache() for request memoization
 *
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getStudentExams = cache(
  async (studentId: string): Promise<StudentExam[]> => {
    const supabase = await createClient();

    // First, get all course codes the student is enrolled in
    const { data: enrollments } = await supabase
      .from("student_enrollment")
      .select(
        `
      section:section!student_enrollment_section_id_fkey(course_code)
    `
      )
      .eq("student_id", studentId)
      .eq("status", "registered");

    if (!enrollments || enrollments.length === 0) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const courseCodes = (enrollments as any[])
      .map((e) => {
        const sectionData = Array.isArray(e.section) ? e.section[0] : e.section;
        return sectionData?.course_code;
      })
      .filter((code: string | undefined): code is string => !!code);

    if (courseCodes.length === 0) {
      return [];
    }

    // Get exams for these courses
    const { data: exams, error } = await supabase
      .from("exam")
      .select(
        `
      id,
      course_code,
      date,
      start_time,
      duration_minutes,
      room_codes,
      course:course!exam_course_code_fkey(title)
    `
      )
      .in("course_code", courseCodes)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching exams:", error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (exams || []).map((exam: any) => {
      const courseData = Array.isArray(exam.course)
        ? exam.course[0]
        : exam.course;
      return {
        id: exam.id,
        course_code: exam.course_code,
        course_title: courseData?.title || "",
        date: exam.date,
        start: exam.start_time,
        duration: exam.duration_minutes,
        room_codes: exam.room_codes || [],
      };
    });
  }
);

/**
 * Get available elective sections with enrollment counts
 * Returns sections that are:
 * - Elective courses (is_elective = true)
 * - Released state
 * - With enrollment counts and capacity info
 */
export interface AvailableElectiveSection {
  section_id: string;
  course_code: string;
  course_title: string;
  course_credits: number;
  section_no: string;
  instructor_name: string | null;
  room_code: string | null;
  capacity: number;
  enrolled_count: number;
  available_seats: number;
  is_full: boolean;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  } | null;
}

export const getAvailableElectiveSections = cache(
  async (): Promise<AvailableElectiveSection[]> => {
    const supabase = await createClient();

    // Get all released sections for elective courses
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select(
        `
      id,
      course_code,
      section_no,
      room_code,
      capacity,
      meeting_pattern,
      state,
      course:course_code (
        code,
        title,
        credits,
        is_elective
      ),
      instructor:faculty_profile!section_instructor_id_fkey (
        name
      )
    `
      )
      .eq("state", "released");

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      return [];
    }

    // Filter for elective courses only
    interface SectionWithCourse {
      course?:
        | {
            is_elective?: boolean;
          }
        | Array<{
            is_elective?: boolean;
          }>;
    }
    const electiveSections = (sections || []).filter(
      (section: SectionWithCourse) => {
        const course = Array.isArray(section.course)
          ? section.course[0]
          : section.course;
        return course?.is_elective === true;
      }
    );

    if (electiveSections.length === 0) {
      return [];
    }

    // Get enrollment counts for each section
    interface SectionWithId {
      id?: string;
    }
    const sectionIds = electiveSections.map((s: SectionWithId) => s.id);
    const { data: enrollments } = await supabase
      .from("student_enrollment")
      .select("section_id")
      .in("section_id", sectionIds)
      .eq("status", "registered");

    // Count enrollments per section
    const enrollmentCounts = new Map<string, number>();
    interface EnrollmentWithSectionId {
      section_id: string;
    }
    (enrollments || []).forEach((enrollment: EnrollmentWithSectionId) => {
      const count = enrollmentCounts.get(enrollment.section_id) || 0;
      enrollmentCounts.set(enrollment.section_id, count + 1);
    });

    // Map to response format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return electiveSections.map((section: any) => {
      const course = Array.isArray(section.course)
        ? section.course[0]
        : section.course;
      const instructor = Array.isArray(section.instructor)
        ? section.instructor[0]
        : section.instructor;
      const enrolledCount = enrollmentCounts.get(section.id) || 0;
      const capacity = section.capacity || 0;
      const availableSeats = capacity - enrolledCount;

      return {
        section_id: section.id,
        course_code: section.course_code,
        course_title: course?.title || "",
        course_credits: course?.credits || 0,
        section_no: section.section_no,
        instructor_name: instructor?.name || null,
        room_code: section.room_code || null,
        capacity,
        enrolled_count: enrolledCount,
        available_seats: availableSeats,
        is_full: availableSeats <= 0,
        meeting_pattern: section.meeting_pattern as {
          days: string[];
          start: string;
          duration: number;
        } | null,
      };
    });
  }
);

/**
 * Get upcoming deadlines for a specific role
 * Wrapped with React.cache() for request memoization
 */
export const getUpcomingDeadlines = cache(
  async (role: string, daysAhead: number = 30) => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "get_upcoming_deadlines_for_role",
      {
        role_name: role,
        days_ahead: daysAhead,
      }
    );

    if (error) {
      console.error("Error fetching upcoming deadlines:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get recent notifications for a user
 * Wrapped with React.cache() for request memoization
 */
export const getUserNotifications = cache(
  async (userId: string, limit: number = 10) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notification")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get registration status for the active semester
 * Wrapped with React.cache() for request memoization
 */
export interface RegistrationStatus {
  is_open: boolean;
  semester: {
    code: string;
    name: string;
  } | null;
  message: string;
}

export const getRegistrationStatus = cache(
  async (): Promise<RegistrationStatus> => {
    const supabase = await createClient();

    // 1. Get the active academic term (draft or released)
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("code, name, status")
      .in("status", ["draft", "released"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!activeTerm) {
      return {
        is_open: false,
        semester: null,
        message: "No active semester found.",
      };
    }

    // 2. Check for a registration event in the timeline for this term
    const { data: registrationEvent } = await supabase
      .from("semester_timeline")
      .select("start_date, end_date, status")
      .eq("term_code", activeTerm.code)
      .eq("event_type", "registration")
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    if (registrationEvent) {
      const now = new Date();
      const startDate = new Date(registrationEvent.start_date);
      const endDate = new Date(registrationEvent.end_date);

      // Registration is open if:
      // 1. Current time is within the event window
      // 2. Event is not cancelled
      const isOpen =
        now >= startDate &&
        now <= endDate &&
        registrationEvent.status !== "cancelled";

      return {
        is_open: isOpen,
        semester: {
          code: activeTerm.code,
          name: activeTerm.name,
        },
        message: isOpen
          ? "Registration is currently open"
          : "Registration is closed. Check the timeline for registration dates.",
      };
    }

    // Default if no registration event found
    return {
      is_open: false,
      semester: {
        code: activeTerm.code,
        name: activeTerm.name,
      },
      message:
        "Registration is closed. Check the timeline for registration dates.",
    };
  }
);
