/**
 * Student Elective Registration Validator
 * Comprehensive validation for course registration
 */

import { createServerClient } from "@/lib/supabase/server";
import { doTimeSlotsOverlap, type TimeSlot } from "./conflict-detector";

export interface RegistrationValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SectionWithDetails {
  id: string;
  course_code: string;
  capacity: number;
  enrolled_count: number;
  course: {
    code: string;
    name: string;
    credits: number;
    prerequisites: string[] | null;
    type: string;
  };
  section_time: Array<{
    day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
    start_time: string;
    end_time: string;
  }>;
}

/**
 * Main validation function for course registration
 */
export async function validateRegistration(
  student_id: string,
  section_id: string
): Promise<RegistrationValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const supabase = await createServerClient();

    // 1. Get section details
    const section = await getSectionDetails(section_id);
    if (!section) {
      errors.push("Section not found");
      return { valid: false, errors };
    }

    // 2. Check if student is already enrolled
    const alreadyEnrolled = await isAlreadyEnrolled(student_id, section_id);
    if (alreadyEnrolled) {
      errors.push("You are already enrolled in this section");
      return { valid: false, errors };
    }

    // 3. Check capacity
    if (section.enrolled_count >= section.capacity) {
      errors.push("Section is full");
      return { valid: false, errors };
    }

    // 4. Check credit hour limit (≤20)
    const totalCH = await getTotalCreditHours(student_id);
    const sectionCH = section.course.credits;
    if (totalCH + sectionCH > 20) {
      errors.push(`Exceeds 20 credit hour limit. You currently have ${totalCH} CH, and this course is ${sectionCH} CH.`);
    }

    // 5. Check prerequisites
    const prereqsMet = await checkPrerequisites(
      student_id,
      section.course.prerequisites
    );
    if (!prereqsMet.valid) {
      errors.push(prereqsMet.message);
    }

    // 6. Check time conflicts
    const timeConflict = await checkTimeConflict(
      student_id,
      section_id,
      section.section_time
    );
    if (timeConflict.hasConflict) {
      errors.push(timeConflict.message);
    }

    // 7. Check exam conflicts
    const examConflict = await checkExamConflict(
      student_id,
      section.course_code
    );
    if (examConflict.hasConflict) {
      errors.push(examConflict.message);
    }

    // 8. Warnings (don't block registration)
    // Check if student is close to credit hour limit
    if (totalCH + sectionCH >= 18 && totalCH + sectionCH <= 20) {
      warnings.push(`You will have ${totalCH + sectionCH} credit hours if you register for this course.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("Registration validation error:", error);
    return {
      valid: false,
      errors: ["An error occurred during validation. Please try again."],
    };
  }
}

/**
 * Get section details with related data
 */
async function getSectionDetails(
  section_id: string
): Promise<SectionWithDetails | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("section")
    .select(
      `
      id,
      course_code,
      capacity,
      enrolled_count,
      course:course_code (
        code,
        name,
        credits,
        prerequisites,
        type
      ),
      section_time (
        day,
        start_time,
        end_time
      )
    `
    )
    .eq("id", section_id)
    .single();

  if (error || !data) {
    console.error("Error fetching section details:", error);
    return null;
  }

  return data as unknown as SectionWithDetails;
}

/**
 * Check if student is already enrolled in this section
 */
async function isAlreadyEnrolled(
  student_id: string,
  section_id: string
): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("section_enrollment")
    .select("id")
    .eq("student_id", student_id)
    .eq("section_id", section_id)
    .eq("status", "enrolled")
    .maybeSingle();

  if (error) {
    console.error("Error checking enrollment:", error);
    return false;
  }

  return !!data;
}

/**
 * Get total credit hours for student (current enrollments)
 */
async function getTotalCreditHours(student_id: string): Promise<number> {
  const supabase = await createServerClient();

  // Get current term
  const { data: term } = await supabase
    .from("academic_term")
    .select("code")
    .eq("is_active", true)
    .single();

  if (!term) return 0;

  // Get enrolled sections
  const { data: enrollments } = await supabase
    .from("section_enrollment")
    .select(
      `
      section:section_id (
        course:course_code (
          credits
        )
      )
    `
    )
    .eq("student_id", student_id)
    .eq("status", "enrolled");

  if (!enrollments) return 0;

  // Sum up credits
  const totalCredits = enrollments.reduce((sum, enrollment: any) => {
    const credits = enrollment.section?.course?.credits || 0;
    return sum + credits;
  }, 0);

  return totalCredits;
}

/**
 * Check if prerequisites are met
 */
async function checkPrerequisites(
  student_id: string,
  prerequisites: string[] | null
): Promise<{ valid: boolean; message: string }> {
  // If no prerequisites, always valid
  if (!prerequisites || prerequisites.length === 0) {
    return { valid: true, message: "" };
  }

  const supabase = await createServerClient();

  // Check enrollment table for completed courses
  const { data: completedCourses } = await supabase
    .from("enrollment")
    .select("course_code, grade, status")
    .eq("student_id", student_id)
    .eq("status", "completed")
    .in("course_code", prerequisites);

  if (!completedCourses) {
    return {
      valid: false,
      message: "Unable to verify prerequisites",
    };
  }

  // Check which prerequisites are missing
  const completedCodes = completedCourses
    .filter((c) => c.grade && c.grade >= 50) // Must pass with grade >= 50
    .map((c) => c.course_code);

  const missingPrereqs = prerequisites.filter(
    (prereq) => !completedCodes.includes(prereq)
  );

  if (missingPrereqs.length > 0) {
    return {
      valid: false,
      message: `Missing prerequisites: ${missingPrereqs.join(", ")}`,
    };
  }

  return { valid: true, message: "" };
}

/**
 * Check for time conflicts with existing enrollments
 */
async function checkTimeConflict(
  student_id: string,
  section_id: string,
  section_times: Array<{
    day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
    start_time: string;
    end_time: string;
  }>
): Promise<{ hasConflict: boolean; message: string }> {
  const supabase = await createServerClient();

  // Get all enrolled sections with their times
  const { data: enrollments } = await supabase
    .from("section_enrollment")
    .select(
      `
      section:section_id (
        id,
        course_code,
        section_time (
          day,
          start_time,
          end_time
        )
      )
    `
    )
    .eq("student_id", student_id)
    .eq("status", "enrolled");

  if (!enrollments || enrollments.length === 0) {
    return { hasConflict: false, message: "" };
  }

  // Check each enrolled section's times against new section's times
  for (const enrollment of enrollments) {
    const enrolledSection = enrollment.section as any;
    if (!enrolledSection || !enrolledSection.section_time) continue;

    for (const enrolledTime of enrolledSection.section_time) {
      for (const newTime of section_times) {
        const slot1: TimeSlot = {
          day: enrolledTime.day,
          start_time: enrolledTime.start_time,
          end_time: enrolledTime.end_time,
        };
        const slot2: TimeSlot = {
          day: newTime.day,
          start_time: newTime.start_time,
          end_time: newTime.end_time,
        };

        if (doTimeSlotsOverlap(slot1, slot2)) {
          return {
            hasConflict: true,
            message: `Time conflict with ${enrolledSection.course_code} on ${newTime.day}`,
          };
        }
      }
    }
  }

  return { hasConflict: false, message: "" };
}

/**
 * Check for exam conflicts
 */
async function checkExamConflict(
  student_id: string,
  course_code: string
): Promise<{ hasConflict: boolean; message: string }> {
  const supabase = await createServerClient();

  // Get current term
  const { data: term } = await supabase
    .from("academic_term")
    .select("code")
    .eq("is_active", true)
    .single();

  if (!term) return { hasConflict: false, message: "" };

  // Get exam schedule for the new course
  const { data: newExams } = await supabase
    .from("exam")
    .select("exam_type, exam_date, start_time, duration")
    .eq("course_code", course_code)
    .eq("term_code", term.code);

  if (!newExams || newExams.length === 0) {
    return { hasConflict: false, message: "" };
  }

  // Get all enrolled courses
  const { data: enrollments } = await supabase
    .from("section_enrollment")
    .select(
      `
      section:section_id (
        course_code
      )
    `
    )
    .eq("student_id", student_id)
    .eq("status", "enrolled");

  if (!enrollments || enrollments.length === 0) {
    return { hasConflict: false, message: "" };
  }

  const enrolledCourseCodes = enrollments
    .map((e: any) => e.section?.course_code)
    .filter(Boolean);

  // Get exams for enrolled courses
  const { data: enrolledExams } = await supabase
    .from("exam")
    .select("course_code, exam_type, exam_date, start_time, duration")
    .in("course_code", enrolledCourseCodes)
    .eq("term_code", term.code);

  if (!enrolledExams || enrolledExams.length === 0) {
    return { hasConflict: false, message: "" };
  }

  // Check for exam conflicts
  for (const newExam of newExams) {
    for (const enrolledExam of enrolledExams) {
      // Same date and overlapping time
      if (newExam.exam_date === enrolledExam.exam_date) {
        // Simple check: if start times are within 3 hours, likely conflict
        const newStart = new Date(`2000-01-01 ${newExam.start_time}`);
        const enrolledStart = new Date(
          `2000-01-01 ${enrolledExam.start_time}`
        );
        const diffMs = Math.abs(newStart.getTime() - enrolledStart.getTime());
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 3) {
          return {
            hasConflict: true,
            message: `Exam conflict with ${enrolledExam.course_code} on ${newExam.exam_date}`,
          };
        }
      }
    }
  }

  return { hasConflict: false, message: "" };
}

/**
 * Validate drop request
 */
export async function validateDrop(
  student_id: string,
  section_id: string
): Promise<RegistrationValidation> {
  const errors: string[] = [];

  try {
    const supabase = await createServerClient();

    // Check if student is enrolled
    const { data: enrollment } = await supabase
      .from("section_enrollment")
      .select("id, status")
      .eq("student_id", student_id)
      .eq("section_id", section_id)
      .eq("status", "enrolled")
      .maybeSingle();

    if (!enrollment) {
      errors.push("You are not enrolled in this section");
    }

    // Check if drop deadline has passed (optional)
    const { data: term } = await supabase
      .from("academic_term")
      .select("code, registration_open")
      .eq("is_active", true)
      .single();

    if (!term?.registration_open) {
      errors.push("Registration period is closed. Cannot drop courses.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error("Drop validation error:", error);
    return {
      valid: false,
      errors: ["An error occurred during validation. Please try again."],
    };
  }
}

