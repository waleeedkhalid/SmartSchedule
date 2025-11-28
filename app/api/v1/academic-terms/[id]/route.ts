/**
 * Academic Term Detail Endpoint
 * 
 * GET /api/v1/academic-terms/:id - Get term details
 * PUT /api/v1/academic-terms/:id - Update term
 * DELETE /api/v1/academic-terms/:id - Delete term
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticateRequest(request);

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("academic_term")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Academic term with id '${id}' not found`
        );
      }
      throw error;
    }

    return createSuccessResponse(data, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const { id } = await params;
    const body = await request.json();
    const { name, start_date, end_date, status } = body;

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("academic_term")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Academic term with id '${id}' not found`
        );
      }
      throw error;
    }

    return createSuccessResponse(data, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const { id } = await params;
    const supabase = await createClient();

    // Check if term has schedules
    const { data: schedules } = await supabase
      .from("schedule")
      .select("id")
      .eq("term_id", id)
      .limit(1);

    if (schedules && schedules.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        "Cannot delete academic term because it has schedules. Delete schedules first."
      );
    }

    const { error } = await supabase
      .from("academic_term")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse(
      { message: "Academic term deleted successfully" },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

