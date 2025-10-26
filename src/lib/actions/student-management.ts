/**
 * Server Actions for Student Management
 * Handles notifications, capacity threshold updates, and related operations
 */

"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/cached-auth";

// ============================================================================
// Notification Actions
// ============================================================================

/**
 * Send notification to registrar about irregular students
 */
export async function notifyRegistrarAboutIrregular(data: {
  irregularStudentIds: string[];
  message?: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    // Verify user is scheduling committee
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "scheduling_committee") {
      return {
        success: false,
        error: "Only scheduling committee can send notifications",
      };
    }

    // Get registrar user(s)
    const { data: registrars, error: registrarError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "registrar");

    if (registrarError || !registrars || registrars.length === 0) {
      return { success: false, error: "No registrar found" };
    }

    // Get irregular student details
    const { data: irregularStudents, error: studentsError } = await supabase
      .from("irregular_students")
      .select(
        `
        id,
        student_id,
        reason,
        courses_needed,
        student:users!irregular_students_student_id_fkey(
          full_name
        ),
        student_info:students!irregular_students_student_id_fkey(
          student_number,
          level
        )
      `
      )
      .in("id", data.irregularStudentIds);

    if (studentsError || !irregularStudents) {
      return { success: false, error: "Failed to fetch student details" };
    }

    // Create notifications for each registrar
    const notifications = registrars.map((registrar) => ({
      recipient_id: registrar.id,
      sender_id: user.id,
      type: "irregular_student" as const,
      title: `${irregularStudents.length} Irregular Student${irregularStudents.length > 1 ? "s" : ""} Need Attention`,
      message:
        data.message ||
        `There are ${irregularStudents.length} irregular student(s) that require your attention. Please review and take necessary action.`,
      data: {
        irregular_student_ids: data.irregularStudentIds,
        student_details: irregularStudents.map((s: any) => ({
          name: s.student?.full_name,
          student_number: s.student_info?.student_number,
          level: s.student_info?.level,
          reason: s.reason,
          courses_needed: s.courses_needed,
        })),
      },
      read: false,
    }));

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
      return { success: false, error: "Failed to send notifications" };
    }

    // Update irregular students status to "notified"
    const { error: updateError } = await supabase
      .from("irregular_students")
      .update({
        status: "notified",
        notified_at: new Date().toISOString(),
      })
      .in("id", data.irregularStudentIds);

    if (updateError) {
      console.error("Error updating irregular students:", updateError);
    }

    revalidatePath("/committee/scheduler/student-management");

    return {
      success: true,
      message: `Notification sent to ${registrars.length} registrar(s)`,
    };
  } catch (error) {
    console.error("Error in notifyRegistrarAboutIrregular:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    const { error } = await supabase
      .from("notifications")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("recipient_id", user.id); // Ensure user can only mark their own notifications

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: "Failed to mark notification as read" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================================
// Capacity Threshold Actions
// ============================================================================

/**
 * Update capacity threshold for a course
 */
export async function updateCapacityThreshold(data: {
  courseCode: string;
  termCode: string;
  thresholdPercentage: number;
  isSWECourse: boolean;
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    // Verify user is scheduling committee
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "scheduling_committee") {
      return {
        success: false,
        error: "Only scheduling committee can update thresholds",
      };
    }

    // Validate threshold percentage
    let thresholdPercentage = data.thresholdPercentage;
    if (!data.isSWECourse) {
      // External courses: fixed 15%
      thresholdPercentage = 15;
    } else {
      // SWE courses: 5-50%
      if (thresholdPercentage < 5 || thresholdPercentage > 50) {
        return {
          success: false,
          error: "Threshold for SWE courses must be between 5% and 50%",
        };
      }
    }

    // Calculate base capacity from sections
    const { data: sections } = await supabase
      .from("section")
      .select("capacity")
      .eq("course_code", data.courseCode)
      .eq("term_code", data.termCode);

    let baseCapacity = 30; // Default
    if (sections && sections.length > 0) {
      const avgCapacity =
        sections.reduce((sum, s) => sum + (s.capacity || 0), 0) /
        sections.length;
      baseCapacity = Math.round(avgCapacity);
    }

    // Upsert threshold
    const { error: upsertError } = await supabase
      .from("capacity_thresholds")
      .upsert(
        {
          course_code: data.courseCode,
          term_code: data.termCode,
          base_capacity: baseCapacity,
          threshold_percentage: thresholdPercentage,
          is_swe_course: data.isSWECourse,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "course_code,term_code",
        }
      );

    if (upsertError) {
      console.error("Error updating capacity threshold:", upsertError);
      return { success: false, error: "Failed to update threshold" };
    }

    revalidatePath("/committee/scheduler/student-management");

    return {
      success: true,
      message: "Capacity threshold updated successfully",
    };
  } catch (error) {
    console.error("Error in updateCapacityThreshold:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Toggle SWE course status
 */
export async function toggleSWECourse(data: {
  courseCode: string;
  termCode: string;
  isSWECourse: boolean;
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    // Verify user is scheduling committee
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "scheduling_committee") {
      return {
        success: false,
        error: "Only scheduling committee can manage SWE courses",
      };
    }

    // Get current threshold or create new one
    const { data: existingThreshold } = await supabase
      .from("capacity_thresholds")
      .select("*")
      .eq("course_code", data.courseCode)
      .eq("term_code", data.termCode)
      .single();

    // Calculate base capacity if needed
    let baseCapacity = existingThreshold?.base_capacity || 30;
    if (!existingThreshold) {
      const { data: sections } = await supabase
        .from("section")
        .select("capacity")
        .eq("course_code", data.courseCode)
        .eq("term_code", data.termCode);

      if (sections && sections.length > 0) {
        const avgCapacity =
          sections.reduce((sum, s) => sum + (s.capacity || 0), 0) /
          sections.length;
        baseCapacity = Math.round(avgCapacity);
      }
    }

    // Set threshold based on SWE status
    const thresholdPercentage = data.isSWECourse
      ? existingThreshold?.threshold_percentage || 20 // Default 20% for SWE
      : 15; // Fixed 15% for external

    // Upsert threshold
    const { error: upsertError } = await supabase
      .from("capacity_thresholds")
      .upsert(
        {
          course_code: data.courseCode,
          term_code: data.termCode,
          base_capacity: baseCapacity,
          threshold_percentage: thresholdPercentage,
          is_swe_course: data.isSWECourse,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "course_code,term_code",
        }
      );

    if (upsertError) {
      console.error("Error toggling SWE course:", upsertError);
      return { success: false, error: "Failed to update SWE course status" };
    }

    revalidatePath("/committee/scheduler/student-management");

    return {
      success: true,
      message: data.isSWECourse
        ? "Course marked as SWE-managed"
        : "Course marked as external",
    };
  } catch (error) {
    console.error("Error in toggleSWECourse:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// ============================================================================
// Export Actions
// ============================================================================

/**
 * Generate export data for student enrollment
 */
export async function exportStudentData(data: {
  termCode: string;
  viewType: "all" | "irregular" | "statistics";
  format: "csv" | "json";
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const supabase = await createServerClient();

    // Verify user is committee member
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      !["scheduling_committee", "teaching_load_committee", "registrar"].includes(
        profile.role
      )
    ) {
      return { success: false, error: "Unauthorized" };
    }

    let exportData: any = {};

    if (data.viewType === "all" || data.viewType === "irregular") {
      // Fetch student data
      const { data: students } = await supabase
        .from("students")
        .select(
          `
          id,
          student_number,
          level,
          users!inner(
            full_name,
            email
          )
        `
        )
        .order("level");

      // Fetch enrollments
      const studentIds = students?.map((s) => s.id) || [];
      const { data: enrollments } = await supabase
        .from("section_enrollment")
        .select(
          `
          student_id,
          section:section!inner(
            course:course!inner(
              code,
              name
            )
          )
        `
        )
        .in("student_id", studentIds);

      // Fetch irregular students if needed
      let irregularRecords = [];
      if (data.viewType === "irregular" || data.viewType === "all") {
        const { data: irregular } = await supabase
          .from("irregular_students")
          .select("*")
          .eq("term_code", data.termCode)
          .neq("status", "resolved");

        irregularRecords = irregular || [];
      }

      exportData = {
        students: students || [],
        enrollments: enrollments || [],
        irregular_students: irregularRecords,
      };
    }

    if (data.viewType === "statistics") {
      // Fetch statistics data
      const { data: stats } = await supabase.rpc(
        "get_course_enrollment_stats",
        {
          p_term_code: data.termCode,
        }
      );

      exportData = { statistics: stats || [] };
    }

    return {
      success: true,
      data: exportData,
      format: data.format,
    };
  } catch (error) {
    console.error("Error in exportStudentData:", error);
    return { success: false, error: "Failed to export data" };
  }
}

