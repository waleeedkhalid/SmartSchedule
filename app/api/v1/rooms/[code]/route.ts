/**
 * Room Detail Endpoint
 * 
 * GET /api/v1/rooms/:code - Get room details
 * PUT /api/v1/rooms/:code - Update room
 * DELETE /api/v1/rooms/:code - Delete room
 * 
 * All authenticated users can view room details.
 * Only scheduling role can update/delete rooms.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: {
    code: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room")
      .select("*")
      .eq("code", params.code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Room with code '${params.code}' not found`
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
  { params }: RouteParams
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { type, capacity } = body;

    const supabase = await createClient();

    // Check if room exists
    const { data: existing, error: checkError } = await supabase
      .from("room")
      .select("code")
      .eq("code", params.code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Room with code '${params.code}' not found`
      );
    }

    // Validate type if provided
    if (type !== undefined && type !== 'Lecture' && type !== 'Lab') {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Type must be either 'Lecture' or 'Lab'"
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity) : null;

    // Update room
    const { data, error } = await supabase
      .from("room")
      .update(updateData)
      .eq("code", params.code)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const supabase = await createClient();

    // Check if room exists
    const { data: existing, error: checkError } = await supabase
      .from("room")
      .select("code")
      .eq("code", params.code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Room with code '${params.code}' not found`
      );
    }

    // Check if room has sections
    const { data: sections } = await supabase
      .from("section")
      .select("id")
      .eq("room_code", params.code)
      .limit(1);

    if (sections && sections.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Cannot delete room '${params.code}' because it has sections assigned. Remove sections first.`
      );
    }

    // Delete room
    const { error } = await supabase
      .from("room")
      .delete()
      .eq("code", params.code);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ message: `Room '${params.code}' deleted successfully` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

