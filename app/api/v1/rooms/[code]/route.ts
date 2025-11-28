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
import { revalidateRooms } from "@/lib/cache/revalidation";

interface RouteParams {
  params: Promise<{
    code: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const { code } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Room with code '${code}' not found`
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

    const { code } = await params;
    const body = await request.json();
    const { type, capacity } = body;

    const supabase = await createClient();

    // Check if room exists
    const { data: existing, error: checkError } = await supabase
      .from("room")
      .select("code")
      .eq("code", code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Room with code '${code}' not found`
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
    interface UpdateData {
      type?: string;
      capacity?: number | null;
    }
    const updateData: UpdateData = {};
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity) : null;

    // Update room
    const { data, error } = await supabase
      .from("room")
      .update(updateData)
      .eq("code", code)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate room-related caches after successful update
    revalidateRooms();

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

    const { code } = await params;
    const supabase = await createClient();

    // Check if room exists
    const { data: existing, error: checkError } = await supabase
      .from("room")
      .select("code")
      .eq("code", code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Room with code '${code}' not found`
      );
    }

    // Check if room has sections
    const { data: sections } = await supabase
      .from("section")
      .select("id")
      .eq("room_code", code)
      .limit(1);

    if (sections && sections.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Cannot delete room '${code}' because it has sections assigned. Remove sections first.`
      );
    }

    // Delete room
    const { error } = await supabase
      .from("room")
      .delete()
      .eq("code", code);

    if (error) {
      throw error;
    }

    // Revalidate room-related caches after successful deletion
    revalidateRooms();

    return createSuccessResponse({ message: `Room '${code}' deleted successfully` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

