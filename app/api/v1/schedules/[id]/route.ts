/**
 * Schedule Detail Endpoint
 * 
 * DELETE /api/v1/schedules/:id - Remove section from schedule
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
    requireRole(user, ["scheduling"]);

    const supabase = await createClient();

    // Check if schedule exists
    const { data: existing } = await supabase
      .from("schedule")
      .select("id")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Schedule with id '${params.id}' not found`
      );
    }

    // Delete schedule entry
    const { error } = await supabase
      .from("schedule")
      .delete()
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return createSuccessResponse(
      { message: "Section removed from schedule successfully" },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

