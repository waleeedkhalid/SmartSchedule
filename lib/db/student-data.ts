/**
 * Student Dashboard Data
 * 
 * Provides real-time data for student dashboard including enrollments, exams, and credit stats
 */

import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";

type Enrollment = Database["public"]["Tables"]["student_enrollment"]["Row"];
type Section = Database["public"]["Tables"]["section"]["Row"];
type Course = Database["public"]["Tables"]["course"]["Row"];
type Exam = Database["public"]["Tables"]["exam"]["Row"];

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
 * Get credit statistics for a student
 */
export async function getStudentCreditStats(studentId: string): Promise<CreditStats> {
  const supabase = await createClient();

  // Get student profile to determine level
  const { data: profile } = await supabase
    .from("student_profile")
    .select("level")
    .eq("user_id", studentId)
    .single();

  const level = profile?.level || 1;

  // Get all enrollments for this student
  const { data: enrollments } = await supabase
    .from("student_enrollment")
    .select(`
      section:section!student_enrollment_section_id_fkey(
        course_code,
        course:course!section_course_code_fkey(credits, is_elective)
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "registered");

  if (!enrollments) {
    return {
      totalCredits: 0,
      requiredCredits: 0,
      electiveCredits: 0,
      completedCredits: 0,
    };
  }

  let totalCredits = 0;
  let requiredCredits = 0;
  let electiveCredits = 0;

  for (const enrollment of enrollments) {
    const section = enrollment.section as any;
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

/**
 * Get all enrollments for a student with course and section details
 */
export async function getStudentEnrollments(studentId: string): Promise<StudentEnrollment[]> {
  const supabase = await createClient();

  const { data: enrollments, error } = await supabase
    .from("student_enrollment")
    .select(`
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
        instructor:instructor!section_instructor_id_fkey(name)
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "registered")
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }

  return (enrollments || []).map((enrollment: any) => {
    const section = enrollment.section as any;
    return {
      id: enrollment.id,
      section_id: enrollment.section_id,
      course_code: section?.course_code || "",
      course_title: section?.course?.title || "",
      section_no: section?.section_no || "",
      instructor_name: section?.instructor?.name || null,
      room_code: section?.room_code || null,
      meeting_pattern: section?.meeting_pattern as {
        days: string[];
        start: string;
        duration: number;
      } | null,
      status: enrollment.status as "registered" | "dropped",
      enrolled_at: enrollment.enrolled_at,
    };
  });
}

/**
 * Get all exams for courses a student is enrolled in
 */
export async function getStudentExams(studentId: string): Promise<StudentExam[]> {
  const supabase = await createClient();

  // First, get all course codes the student is enrolled in
  const { data: enrollments } = await supabase
    .from("student_enrollment")
    .select(`
      section:section!student_enrollment_section_id_fkey(course_code)
    `)
    .eq("student_id", studentId)
    .eq("status", "registered");

  if (!enrollments || enrollments.length === 0) {
    return [];
  }

  const courseCodes = enrollments
    .map((e: any) => e.section?.course_code)
    .filter((code: string | undefined): code is string => !!code);

  if (courseCodes.length === 0) {
    return [];
  }

  // Get exams for these courses
  const { data: exams, error } = await supabase
    .from("exam")
    .select(`
      id,
      course_code,
      date,
      start_time,
      duration_minutes,
      room_codes,
      course:course!exam_course_code_fkey(title)
    `)
    .in("course_code", courseCodes)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching exams:", error);
    return [];
  }

  return (exams || []).map((exam: any) => ({
    id: exam.id,
    course_code: exam.course_code,
    course_title: exam.course?.title || "",
    date: exam.date,
    start: exam.start_time,
    duration: exam.duration_minutes,
    room_codes: exam.room_codes || [],
  }));
}

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

export async function getAvailableElectiveSections(): Promise<AvailableElectiveSection[]> {
  const supabase = await createClient();

  // Get all released sections for elective courses
  const { data: sections, error: sectionsError } = await supabase
    .from("section")
    .select(`
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
      instructor:instructor_id (
        name
      )
    `)
    .eq("state", "released");

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    return [];
  }

  // Filter for elective courses only
  const electiveSections = (sections || []).filter((section: any) => {
    const course = Array.isArray(section.course) ? section.course[0] : section.course;
    return course?.is_elective === true;
  });

  if (electiveSections.length === 0) {
    return [];
  }

  // Get enrollment counts for each section
  const sectionIds = electiveSections.map((s: any) => s.id);
  const { data: enrollments } = await supabase
    .from("student_enrollment")
    .select("section_id")
    .in("section_id", sectionIds)
    .eq("status", "registered");

  // Count enrollments per section
  const enrollmentCounts = new Map<string, number>();
  (enrollments || []).forEach((enrollment: any) => {
    const count = enrollmentCounts.get(enrollment.section_id) || 0;
    enrollmentCounts.set(enrollment.section_id, count + 1);
  });

  // Map to response format
  return electiveSections.map((section: any) => {
    const course = Array.isArray(section.course) ? section.course[0] : section.course;
    const instructor = Array.isArray(section.instructor) ? section.instructor[0] : section.instructor;
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

