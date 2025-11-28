/**
 * Time Grid Configuration Endpoint
 * 
 * GET /api/v1/time-grid-config - Get current time grid configuration
 * PUT /api/v1/time-grid-config - Update time grid configuration
 * 
 * All authenticated users can view configuration.
 * Only scheduling role can update configuration.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view config)
    await authenticateRequest(request);

    const supabase = await createClient();

    // Get the most recent configuration
    const { data, error } = await supabase
      .from("time_grid_config")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no config exists, return defaults
      if (error.code === "PGRST116") {
        return createSuccessResponse({
          id: null,
          teaching_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          daily_start_time: '08:00:00',
          daily_end_time: '17:00:00',
          slot_duration_minutes: 60,
          break_start_time: '12:00:00',
          break_end_time: '13:00:00',
          exam_days: ['Saturday'],
          exam_start_time: '09:00:00',
          exam_end_time: '17:00:00',
          typical_lab_duration_minutes: 120,
        }, 200);
      }
      throw error;
    }

    return createSuccessResponse(data, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const {
      id,
      teaching_days,
      daily_start_time,
      daily_end_time,
      slot_duration_minutes,
      break_start_time,
      break_end_time,
      exam_days,
      exam_start_time,
      exam_end_time,
      typical_lab_duration_minutes,
    } = body;

    // Validate required fields
    if (!teaching_days || !Array.isArray(teaching_days)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "teaching_days must be an array"
      );
    }

    if (!daily_start_time || !daily_end_time) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "daily_start_time and daily_end_time are required"
      );
    }

    if (!slot_duration_minutes || slot_duration_minutes < 15 || slot_duration_minutes > 180) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "slot_duration_minutes must be between 15 and 180"
      );
    }

    if (!break_start_time || !break_end_time) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "break_start_time and break_end_time are required"
      );
    }

    if (!exam_days || !Array.isArray(exam_days)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "exam_days must be an array"
      );
    }

    if (!exam_start_time || !exam_end_time) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "exam_start_time and exam_end_time are required"
      );
    }

    if (!typical_lab_duration_minutes || typical_lab_duration_minutes < 60 || typical_lab_duration_minutes > 300) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "typical_lab_duration_minutes must be between 60 and 300"
      );
    }

    const supabase = await createClient();

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      teaching_days,
      daily_start_time,
      daily_end_time,
      slot_duration_minutes: parseInt(slot_duration_minutes),
      break_start_time,
      break_end_time,
      exam_days,
      exam_start_time,
      exam_end_time,
      typical_lab_duration_minutes: parseInt(typical_lab_duration_minutes),
      updated_by: user.id,
    };

    let result;

    // If id exists, update existing config, otherwise create new one
    if (id) {
      // Check if config exists
      const { data: existing, error: checkError } = await supabase
        .from("time_grid_config")
        .select("id")
        .eq("id", id)
        .single();

      if (checkError || !existing) {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Time grid configuration with id '${id}' not found`
        );
      }

      // Update existing config
      const { data, error } = await supabase
        .from("time_grid_config")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    } else {
      // Create new config
      const { data, error } = await supabase
        .from("time_grid_config")
        .insert(updateData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      result = data;
    }

    return createSuccessResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

