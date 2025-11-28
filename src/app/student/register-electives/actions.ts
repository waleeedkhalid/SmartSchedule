/**
 * Server Actions for Student Elective Registration
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/cached-auth";
import {
  validateRegistration,
  validateDrop,
  type RegistrationValidation,
} from "@/lib/validations/registration-validator";

export interface ActionResult {
  success: boolean;
  message: string;
  validation?: RegistrationValidation;
}

/**
 * Register student for an elective section
 */
export async function registerForSection(
  section_id: string
): Promise<ActionResult> {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to register for courses",
      };
    }

    // 2. Validate registration
    const validation = await validateRegistration(user.id, section_id);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors[0] || "Registration validation failed",
        validation,
      };
    }

    // 3. Perform registration
    const supabase = await createServerClient();
    const { error } = await supabase.from("section_enrollment").insert({
      student_id: user.id,
      section_id: section_id,
      status: "enrolled",
      enrolled_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Failed to register for course. Please try again.",
      };
    }

    // 4. Update section enrolled_count
    await updateSectionEnrollmentCount(section_id);

    // 5. Revalidate paths
    revalidatePath("/student/schedule");
    revalidatePath("/student/register-electives");

    return {
      success: true,
      message: "Successfully registered for course!",
      validation,
    };
  } catch (error) {
    console.error("registerForSection error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Drop a section enrollment
 */
export async function dropSection(section_id: string): Promise<ActionResult> {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to drop courses",
      };
    }

    // 2. Validate drop
    const validation = await validateDrop(user.id, section_id);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.errors[0] || "Drop validation failed",
        validation,
      };
    }

    // 3. Update enrollment status to dropped
    const supabase = await createServerClient();
    const { error } = await supabase
      .from("section_enrollment")
      .update({
        status: "dropped",
        dropped_at: new Date().toISOString(),
      })
      .eq("student_id", user.id)
      .eq("section_id", section_id)
      .eq("status", "enrolled");

    if (error) {
      console.error("Drop error:", error);
      return {
        success: false,
        message: "Failed to drop course. Please try again.",
      };
    }

    // 4. Update section enrolled_count
    await updateSectionEnrollmentCount(section_id);

    // 5. Revalidate paths
    revalidatePath("/student/schedule");
    revalidatePath("/student/register-electives");

    return {
      success: true,
      message: "Successfully dropped course!",
      validation,
    };
  } catch (error) {
    console.error("dropSection error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Helper: Update section enrollment count
 */
async function updateSectionEnrollmentCount(section_id: string): Promise<void> {
  try {
    const supabase = await createServerClient();

    // Get current enrollment count
    const { count } = await supabase
      .from("section_enrollment")
      .select("*", { count: "exact", head: true })
      .eq("section_id", section_id)
      .eq("status", "enrolled");

    if (count !== null) {
      // Update section
      await supabase
        .from("section")
        .update({ enrolled_count: count })
        .eq("id", section_id);
    }
  } catch (error) {
    console.error("Error updating enrollment count:", error);
  }
}

/**
 * Get student's current enrollments
 */
export async function getStudentEnrollments() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, data: [] };
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("section_enrollment")
      .select(
        `
        id,
        section_id,
        status,
        enrolled_at,
        section:section_id (
          id,
          course_code,
          capacity,
          enrolled_count,
          course:course_code (
            code,
            name,
            credits,
            type
          ),
          section_time (
            day,
            start_time,
            end_time
          ),
          instructor:instructor_id (
            full_name
          )
        )
      `
      )
      .eq("student_id", user.id)
      .eq("status", "enrolled");

    if (error) {
      console.error("Error fetching enrollments:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("getStudentEnrollments error:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get available elective sections
 */
export async function getAvailableElectives() {
  try {
    const supabase = await createServerClient();

    // Get current term
    const { data: term } = await supabase
      .from("academic_term")
      .select("code")
      .eq("is_active", true)
      .single();

    if (!term) {
      return { success: false, data: [] };
    }

    // Get all elective sections for current term
    const { data, error } = await supabase
      .from("section")
      .select(
        `
        id,
        course_code,
        capacity,
        enrolled_count,
        section_type,
        status,
        course:course_code (
          code,
          name,
          description,
          credits,
          type,
          department
        ),
        section_time (
          day,
          start_time,
          end_time
        ),
        instructor:instructor_id (
          full_name
        ),
        room:room_id (
          number
        )
      `
      )
      .eq("term_code", term.code)
      .in("course:course_code.type", ["ELECTIVE"]);

    if (error) {
      console.error("Error fetching electives:", error);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("getAvailableElectives error:", error);
    return { success: false, data: [] };
  }
}

/**
 * Get student's total credit hours
 */
export async function getStudentCreditHours() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, credits: 0 };
    }

    const supabase = await createServerClient();

    // Get enrolled sections with credits
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
      .eq("student_id", user.id)
      .eq("status", "enrolled");

    if (!enrollments) {
      return { success: true, credits: 0 };
    }

    // Sum up credits
    const totalCredits = enrollments.reduce((sum, enrollment: any) => {
      const credits = enrollment.section?.course?.credits || 0;
      return sum + credits;
    }, 0);

    return { success: true, credits: totalCredits };
  } catch (error) {
    console.error("getStudentCreditHours error:", error);
    return { success: false, credits: 0 };
  }
}

