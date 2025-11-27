/**
 * Elective Comments API Route
 * 
 * POST /api/elective-preferences/comments - Create a new comment
 * PATCH /api/elective-preferences/comments/[id] - Update a comment
 * DELETE /api/elective-preferences/comments/[id] - Delete a comment
 * 
 * Handles student elective comment operations.
 * Students can only manage their own comments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can create comments
    requireRole(user, ["student"]);

    const body = await request.json();
    const { course_code, comment } = body;

    if (!course_code || typeof course_code !== 'string') {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "course_code is required"
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "comment must be at least 10 characters"
      );
    }

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode - return mock comment
    if (isDemo === true) {
      return createSuccessResponse(
        {
          id: `comment-${Date.now()}`,
          student_id: user.id,
          course_code,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        201
      );
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    // Verify course exists and is elective
    const { data: course, error: courseError } = await supabase
      .from("course")
      .select("code, is_elective")
      .eq("code", course_code)
      .single();

    if (courseError || !course) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Course not found"
      );
    }

    if (!course.is_elective) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Comments can only be added for elective courses"
      );
    }

    // Create comment
    const { data: newComment, error: insertError } = await supabase
      .from("elective_comment")
      .insert({
        student_id: user.id,
        course_code,
        comment: comment.trim(),
      })
      .select(`
        *,
        course:course!elective_comment_course_code_fkey(code, title, level, credits)
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    return createSuccessResponse(newComment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

