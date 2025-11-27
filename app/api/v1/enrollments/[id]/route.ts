/**
 * Enrollment Detail Endpoint
 * 
 * DELETE /api/v1/enrollments/:id - Drop an enrollment
 * 
 * Allows students to drop their enrollments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await authenticateRequest(request);

    // Only students can drop enrollments
    requireRole(user, ["student"]);

    // Real Supabase mode only - no demo support
    const supabase = await createClient();

    // Verify enrollment belongs to user
    const { data: enrollment, error: fetchError } = await supabase
      .from("student_enrollment")
      .select("*")
      .eq("id", params.id)
      .eq("student_id", user.id)
      .single();

    if (fetchError || !enrollment) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Enrollment not found or access denied"
      );
    }

    // Update enrollment status to dropped
    const { data: updated, error: updateError } = await supabase
      .from("student_enrollment")
      .update({
        status: "dropped",
        dropped_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse(
      { success: true, enrollment: updated },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

