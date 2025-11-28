/**
 * Academic Plan Database Functions
 * 
 * Server-side functions for fetching academic plan data.
 * All functions are wrapped with React.cache() for request memoization.
 */

import { cache } from 'react';
import { createClient } from "@/supabase/server";

export interface AcademicPlanCourse {
  code: string;
  name: string;
  credits: number;
  level: number;
  course_type: "required" | "elective";
  created_at?: string;
}

/**
 * Get all courses for academic plan
 * Wrapped with React.cache() for request memoization
 */
export const getAcademicPlanCourses = cache(async (): Promise<AcademicPlanCourse[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course")
    .select("code, title, credits, recommended_level, is_elective, created_at")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching courses for academic plan:", error);
    throw error;
  }

  // Map database fields to API response format
  // For electives, recommended_level is NULL, so we use 0 for grouping
  return (data || []).map((course) => ({
    code: course.code,
    name: course.title,
    credits: course.credits,
    level: (course.recommended_level ?? 0) as number, // Use 0 for electives (NULL recommended_level)
    course_type: course.is_elective ? "elective" : "required",
    created_at: course.created_at,
  }));
});

/**
 * Get student's completed course codes
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Currently uses 'registered' status as completion indicator.
 * In production, you'd check a grades/completion table.
 */
export const getStudentCompletedCourses = cache(async (studentId: string): Promise<string[]> => {
  const supabase = await createClient();

  const { data: enrollments, error } = await supabase
    .from("student_enrollment")
    .select(`
      section:section!student_enrollment_section_id_fkey(
        course_code
      )
    `)
    .eq("student_id", studentId)
    .eq("status", "registered");

  if (error) {
    console.error("Error fetching completed courses:", error);
    return [];
  }

  const completedCourseCodes: string[] = [];
  if (enrollments) {
    for (const enrollment of enrollments) {
      const section = enrollment.section as { course_code?: string } | null | undefined;
      if (section?.course_code) {
        completedCourseCodes.push(section.course_code);
      }
    }
  }

  return completedCourseCodes;
});

