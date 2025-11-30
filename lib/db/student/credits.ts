/**
 * Student Credit Tracking
 *
 * Functions for calculating and tracking student credit statistics
 * Wrapped with React.cache() for request memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import type { CreditStats, Course } from "./types";

/**
 * Get credit statistics for a student
 * Wrapped with React.cache() for request memoization
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
