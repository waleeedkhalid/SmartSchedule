/**
 * Student Feedback Server Actions
 *
 * Server actions for managing student feedback on schedules and sections.
 * Uses the unified schedule_comment table.
 */

"use server";

import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

export interface StudentFeedback {
  id: string;
  section_id: string | null;
  schedule_id: string | null;
  comment_text: string;
  rating: number | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string | null;
  section: {
    id: string;
    course_code: string;
    section_no: string;
    activity: string | null;
    course_title: string | null;
  } | null;
}

export interface EnrolledSection {
  id: string;
  course_code: string;
  section_no: string;
  activity: string | null;
  course_title: string;
}

/**
 * Get the current user's feedback
 */
export async function getStudentFeedback(): Promise<{
  success: boolean;
  data?: StudentFeedback[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Fetch feedback with section details
    const { data: comments, error } = await supabase
      .from("schedule_comment")
      .select(
        `
        id,
        section_id,
        schedule_id,
        comment_text,
        rating,
        is_resolved,
        resolved_at,
        resolved_by,
        created_at,
        updated_at,
        section:section!schedule_comment_section_id_fkey(
          id,
          course_code,
          section_no,
          activity,
          course:course!section_course_code_fkey(
            title
          )
        )
      `
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching feedback:", error);
      return { success: false, error: "Failed to fetch feedback" };
    }

    // Transform data
    const transformedComments: StudentFeedback[] = (comments || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (comment: any) => {
        const sectionData = Array.isArray(comment.section)
          ? comment.section[0]
          : comment.section;

        return {
          id: comment.id,
          section_id: comment.section_id,
          schedule_id: comment.schedule_id,
          comment_text: comment.comment_text,
          rating: comment.rating,
          is_resolved: comment.is_resolved || false,
          resolved_at: comment.resolved_at,
          resolved_by: comment.resolved_by,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          section: sectionData
            ? {
              id: sectionData.id,
              course_code: sectionData.course_code,
              section_no: sectionData.section_no,
              activity: sectionData.activity,
              course_title: Array.isArray(sectionData.course)
                ? sectionData.course[0]?.title
                : sectionData.course?.title,
            }
            : null,
        };
      }
    );

    return { success: true, data: transformedComments };
  } catch (error) {
    console.error("Error in getStudentFeedback:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get enrolled sections for the feedback form dropdown
 */
export async function getEnrolledSections(): Promise<{
  success: boolean;
  data?: EnrolledSection[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Get student's enrolled sections
    const { data: enrollments, error } = await supabase
      .from("student_enrollment")
      .select(
        `
        section:section!student_enrollment_section_id_fkey(
          id,
          course_code,
          section_no,
          activity,
          course:course!section_course_code_fkey(
            title
          )
        )
      `
      )
      .eq("student_id", user.id)
      .eq("status", "registered");

    if (error) {
      console.error("Error fetching enrolled sections:", error);
      return { success: false, error: "Failed to fetch enrolled sections" };
    }

    // Transform data
    const sections: EnrolledSection[] = (enrollments || [])
      .map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (enrollment: any) => {
          const section = Array.isArray(enrollment.section)
            ? enrollment.section[0]
            : enrollment.section;

          if (!section) return null;

          return {
            id: section.id,
            course_code: section.course_code,
            section_no: section.section_no,
            activity: section.activity,
            course_title: Array.isArray(section.course)
              ? section.course[0]?.title || section.course_code
              : section.course?.title || section.course_code,
          };
        }
      )
      .filter(Boolean) as EnrolledSection[];

    return { success: true, data: sections };
  } catch (error) {
    console.error("Error in getEnrolledSections:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Submit new feedback
 */
export async function submitFeedback(data: {
  section_id?: string | null;
  comment_text: string;
  rating?: number | null;
}): Promise<{
  success: boolean;
  data?: StudentFeedback;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Validate comment text
    if (!data.comment_text || data.comment_text.trim().length < 10) {
      return {
        success: false,
        error: "Feedback must be at least 10 characters",
      };
    }

    if (data.comment_text.length > 2000) {
      return {
        success: false,
        error: "Feedback must not exceed 2000 characters",
      };
    }

    // Validate rating if provided
    if (data.rating !== undefined && data.rating !== null) {
      if (data.rating < 1 || data.rating > 5) {
        return { success: false, error: "Rating must be between 1 and 5" };
      }
    }

    // If section_id provided, verify it exists and get associated schedule_id
    let scheduleId = null;
    if (data.section_id) {
      const { data: section, error: sectionError } = await supabase
        .from("section")
        .select("id")
        .eq("id", data.section_id)
        .single();

      if (sectionError || !section) {
        return { success: false, error: "Section not found" };
      }

      // Look up schedule_id for this section
      const { data: schedule } = await supabase
        .from("schedule")
        .select("id")
        .eq("section_id", data.section_id)
        .single();

      if (schedule) {
        scheduleId = schedule.id;
      }
    }

    // Insert feedback
    const { data: newComment, error: insertError } = await supabase
      .from("schedule_comment")
      .insert({
        author_id: user.id,
        section_id: data.section_id || null,
        schedule_id: scheduleId,
        comment_text: data.comment_text.trim(),
        rating: data.rating || null,
        is_resolved: false,
      })
      .select(
        `
        id,
        section_id,
        schedule_id,
        comment_text,
        rating,
        is_resolved,
        created_at,
        updated_at,
        section:section!schedule_comment_section_id_fkey(
          id,
          course_code,
          section_no,
          activity,
          course:course!section_course_code_fkey(
            title
          )
        )
      `
      )
      .single();

    if (insertError) {
      console.error("Error inserting feedback:", insertError);
      return { success: false, error: "Failed to submit feedback" };
    }

    // Transform response
    const sectionData = Array.isArray(newComment.section)
      ? newComment.section[0]
      : newComment.section;

    const feedback: StudentFeedback = {
      id: newComment.id,
      section_id: newComment.section_id,
      schedule_id: newComment.schedule_id,
      comment_text: newComment.comment_text,
      rating: newComment.rating,
      is_resolved: newComment.is_resolved || false,
      resolved_at: null,
      resolved_by: null,
      created_at: newComment.created_at,
      updated_at: newComment.updated_at,
      section: sectionData
        ? {
          id: sectionData.id,
          course_code: sectionData.course_code,
          section_no: sectionData.section_no,
          activity: sectionData.activity,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          course_title: Array.isArray((sectionData as any).course)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sectionData as any).course[0]?.title
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sectionData as any).course?.title,
        }
        : null,
    };

    revalidatePath("/dashboard/student");
    return { success: true, data: feedback };
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete own feedback
 */
export async function deleteFeedback(feedbackId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if feedback exists and belongs to user
    const { data: existingComment, error: fetchError } = await supabase
      .from("schedule_comment")
      .select("id, author_id, is_resolved")
      .eq("id", feedbackId)
      .single();

    if (fetchError || !existingComment) {
      return { success: false, error: "Feedback not found" };
    }

    if (existingComment.author_id !== user.id) {
      return { success: false, error: "You can only delete your own feedback" };
    }

    if (existingComment.is_resolved) {
      return { success: false, error: "Cannot delete resolved feedback" };
    }

    // Delete feedback
    const { error: deleteError } = await supabase
      .from("schedule_comment")
      .delete()
      .eq("id", feedbackId)
      .eq("author_id", user.id);

    if (deleteError) {
      console.error("Error deleting feedback:", deleteError);
      return { success: false, error: "Failed to delete feedback" };
    }

    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFeedback:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
