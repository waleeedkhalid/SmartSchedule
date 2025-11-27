/**
 * Elective Comment API Route (Individual Comment)
 * 
 * PATCH /api/elective-preferences/comments/[id] - Update a comment
 * DELETE /api/elective-preferences/comments/[id] - Delete a comment
 * 
 * Handles individual comment operations.
 * Students can only manage their own comments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: {
    id: string;
  };
}

// PATCH - Update a comment
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const body = await request.json();
    const { comment } = body;

    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "comment must be at least 10 characters"
      );
    }

    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      return createSuccessResponse(
        {
          id: params.id,
          student_id: user.id,
          comment: comment.trim(),
          updated_at: new Date().toISOString(),
        },
        200
      );
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    // Verify comment belongs to user
    const { data: existingComment, error: fetchError } = await supabase
      .from("elective_comment")
      .select("id, student_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingComment) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Comment not found"
      );
    }

    if (existingComment.student_id !== user.id) {
      return createErrorResponse(
        403,
        ErrorCodes.FORBIDDEN,
        "You can only update your own comments"
      );
    }

    // Update comment
    const { data: updatedComment, error: updateError } = await supabase
      .from("elective_comment")
      .update({
        comment: comment.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select(`
        *,
        course:course!elective_comment_course_code_fkey(code, title, level, credits)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse(updatedComment, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      return createSuccessResponse(
        { message: "Comment deleted (demo mode)" },
        200
      );
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    // Verify comment belongs to user
    const { data: existingComment, error: fetchError } = await supabase
      .from("elective_comment")
      .select("id, student_id")
      .eq("id", params.id)
      .single();

    if (fetchError || !existingComment) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Comment not found"
      );
    }

    if (existingComment.student_id !== user.id) {
      return createErrorResponse(
        403,
        ErrorCodes.FORBIDDEN,
        "You can only delete your own comments"
      );
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from("elective_comment")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      throw deleteError;
    }

    return createSuccessResponse(
      { message: "Comment deleted successfully" },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

