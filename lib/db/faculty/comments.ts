/**
 * Faculty Comments/Feedback Operations
 *
 * Functions for managing faculty comments and feedback on sections/schedules
 */

import { createClient } from "@/supabase/server";
import type { FacultyComment } from "./types";

/**
 * Get comments submitted by a faculty member
 */
export async function getFacultyComments(
  userId: string
): Promise<FacultyComment[]> {
  const supabase = await createClient();

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
      section:section!schedule_comment_section_id_fkey(course_code, section_no)
    `
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (comments || []).map((comment: any) => {
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
      created_at: comment.created_at || new Date().toISOString(),
      section: sectionData,
    };
  });
}

/**
 * Submit a new comment/feedback on a section or schedule
 */
export async function submitFacultyComment(
  userId: string,
  sectionId: string | null,
  scheduleId: string | null,
  commentText: string,
  rating?: number
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schedule_comment")
    .insert({
      author_id: userId,
      section_id: sectionId,
      schedule_id: scheduleId,
      comment_text: commentText,
      rating: rating || null,
      is_resolved: false,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Update an existing comment
 */
export async function updateFacultyComment(
  commentId: string,
  userId: string,
  commentText: string,
  rating?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_comment")
    .update({
      comment_text: commentText,
      rating: rating || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .eq("author_id", userId); // Ensure user owns the comment

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a comment
 */
export async function deleteFacultyComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_comment")
    .delete()
    .eq("id", commentId)
    .eq("author_id", userId); // Ensure user owns the comment

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
