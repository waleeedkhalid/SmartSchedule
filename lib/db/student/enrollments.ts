/**
 * Student Enrollment Operations
 *
 * Functions for fetching student enrollments, exams, and elective sections
 * Wrapped with React.cache() for request memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import type {
  StudentEnrollment,
  StudentExam,
  AvailableElectiveSection,
} from "./types";

/**
 * Get all enrollments for a student with course and section details
 * Wrapped with React.cache() for request memoization
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
