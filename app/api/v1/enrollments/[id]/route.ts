/**
 * Enrollment Detail Endpoint
 * 
 * DELETE /api/v1/enrollments/:id - Drop an enrollment
 * 
 * Allows students to drop their enrollments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { getMockEnrollmentsWithDetails, mockEnrollments } from "@/lib/demo-data";

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

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      const enrollments = await getMockEnrollmentsWithDetails(user.id);
      const enrollment = enrollments.find(e => e.id === params.id);

      if (!enrollment) {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          "Enrollment not found or access denied"
        );
      }

      // In demo mode, we simulate dropping by returning success
      // Note: In a real implementation, you'd update the mock data
      return createSuccessResponse(
        {
          success: true,
          enrollment: {
            id: enrollment.id,
            student_id: enrollment.student_id,
            section_id: enrollment.section_id,
            status: "dropped",
            dropped_at: new Date().toISOString(),
          },
        },
        200
      );
    }

    // Handle real Supabase mode
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

