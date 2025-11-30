/**
 * Student Feedback API Route
 *
 * GET /api/v1/student-feedback - Get user's feedback/comments
 * POST /api/v1/student-feedback - Submit new feedback
 * DELETE /api/v1/student-feedback?id=xxx - Delete own feedback
 *
 * Uses the unified schedule_comment table for all user feedback.
 * Students can submit, view, and delete their own feedback.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { z } from "zod";

// Validation schema for feedback submission
const feedbackSubmitSchema = z.object({
  section_id: z.string().uuid().nullable().optional(),
  schedule_id: z.string().uuid().nullable().optional(),
  comment_text: z
    .string()
    .min(10, "Feedback must be at least 10 characters")
    .max(2000, "Feedback must not exceed 2000 characters"),
  rating: z.number().min(1).max(5).nullable().optional(),
});

/**
 * GET - List user's feedback comments
 *
 * Returns all feedback submitted by the authenticated user,
 * with related section information.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const supabase = await createClient();

    // Fetch user's feedback with section details
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
      return createErrorResponse(
        500,
        ErrorCodes.DATABASE_ERROR,
        "Failed to fetch feedback"
      );
    }

    // Transform data for frontend consumption
    const transformedComments = (comments || []).map((comment) => {
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              course_title: Array.isArray((sectionData as any).course)
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (sectionData as any).course[0]?.title
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (sectionData as any).course?.title,
            }
          : null,
      };
    });

    return createSuccessResponse(transformedComments);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST - Submit new feedback
 *
 * Creates a new feedback comment. Students can provide feedback
 * on specific sections or general schedule feedback.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const body = await request.json();

    // Validate input
    const parseResult = feedbackSubmitSchema.safeParse(body);
    if (!parseResult.success) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid feedback data",
        parseResult.error.flatten().fieldErrors
      );
    }

    const { section_id, schedule_id, comment_text, rating } = parseResult.data;

    // At least one of section_id or schedule_id should be provided for context
    // But we allow general feedback without either
    const supabase = await createClient();

    // If section_id provided, verify it exists
    if (section_id) {
      const { data: section, error: sectionError } = await supabase
        .from("section")
        .select("id")
        .eq("id", section_id)
        .single();

      if (sectionError || !section) {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          "Section not found"
        );
      }
    }

    // Insert feedback
    const { data: newComment, error: insertError } = await supabase
      .from("schedule_comment")
      .insert({
        author_id: user.id,
        section_id: section_id || null,
        schedule_id: schedule_id || null,
        comment_text,
        rating: rating || null,
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
      return createErrorResponse(
        500,
        ErrorCodes.DATABASE_ERROR,
        "Failed to submit feedback"
      );
    }

    // Transform response
    const sectionData = Array.isArray(newComment.section)
      ? newComment.section[0]
      : newComment.section;

    const response = {
      id: newComment.id,
      section_id: newComment.section_id,
      schedule_id: newComment.schedule_id,
      comment_text: newComment.comment_text,
      rating: newComment.rating,
      is_resolved: newComment.is_resolved,
      created_at: newComment.created_at,
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

    return createSuccessResponse(
      response,
      201,
      "Feedback submitted successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE - Delete own feedback
 *
 * Allows students to delete their own unresolved feedback.
 * Resolved feedback cannot be deleted.
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Feedback ID is required"
      );
    }

    const supabase = await createClient();

    // First check if the comment exists and belongs to the user
    const { data: existingComment, error: fetchError } = await supabase
      .from("schedule_comment")
      .select("id, author_id, is_resolved")
      .eq("id", commentId)
      .single();

    if (fetchError || !existingComment) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Feedback not found"
      );
    }

    if (existingComment.author_id !== user.id) {
      return createErrorResponse(
        403,
        ErrorCodes.FORBIDDEN,
        "You can only delete your own feedback"
      );
    }

    if (existingComment.is_resolved) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Cannot delete resolved feedback"
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("schedule_comment")
      .delete()
      .eq("id", commentId)
      .eq("author_id", user.id);

    if (deleteError) {
      console.error("Error deleting feedback:", deleteError);
      return createErrorResponse(
        500,
        ErrorCodes.DATABASE_ERROR,
        "Failed to delete feedback"
      );
    }

    return createSuccessResponse(
      { deleted: true },
      200,
      "Feedback deleted successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
