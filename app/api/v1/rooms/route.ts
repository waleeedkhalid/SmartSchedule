/**
 * Rooms List Endpoint
 * 
 * GET /api/v1/rooms - List all rooms
 * POST /api/v1/rooms - Create a new room
 * 
 * All authenticated users can view rooms.
 * Only scheduling role can create rooms.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";
import { revalidateRooms } from "@/lib/cache/revalidation";

type RoomRow = Database["public"]["Tables"]["room"]["Row"];

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view rooms)
    await authenticateRequest(request);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      throw error;
    }

    return createSuccessResponse(data || [], 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { code, type, capacity } = body;

    // Validate required fields
    if (!code || !type) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: code, type"
      );
    }

    // Validate type
    if (type !== 'Lecture' && type !== 'Lab') {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Type must be either 'Lecture' or 'Lab'"
      );
    }

    const supabase = await createClient();

    // Check if room already exists
    const { data: existing } = await supabase
      .from("room")
      .select("code")
      .eq("code", code)
      .single();

    if (existing) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Room with code '${code}' already exists`
      );
    }

    // Insert new room
    const { data, error } = await supabase
      .from("room")
      .insert({
        code,
        type: type as 'Lecture' | 'Lab',
        capacity: capacity ? parseInt(capacity) : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate room-related caches after successful creation
    revalidateRooms();

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

