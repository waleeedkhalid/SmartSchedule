/**
 * Instructor Detail Endpoint
 * 
 * GET /api/v1/instructors/:id - Get instructor details
 * PUT /api/v1/instructors/:id - Update instructor
 * DELETE /api/v1/instructors/:id - Delete instructor
 * 
 * All authenticated users can view instructor details.
 * Only scheduling and teaching_load roles can update/delete instructors.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("faculty_profile")
      .select("*")
      .eq("user_id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Faculty profile with id '${id}' not found`
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
    requireRole(user, ["scheduling", "teaching_load"]);

    const { id } = await params;
    const body = await request.json();
    const { name, email, max_load_per_week, preferred_times, unavailable_times } = body;

    const supabase = await createClient();

    // Check if faculty profile exists
    const { data: existing, error: checkError } = await supabase
      .from("faculty_profile")
      .select("user_id, email")
      .eq("user_id", id)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Faculty profile with id '${id}' not found`
      );
    }

    // Validate email format if provided
    if (email !== undefined && email !== null && email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid email format"
      );
    }

    // Validate max_load_per_week if provided
    if (max_load_per_week !== undefined && (max_load_per_week < 1 || max_load_per_week > 40)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "max_load_per_week must be between 1 and 40"
      );
    }

    // Check if email already exists (if changed)
    if (email && email !== existing.email) {
      const { data: emailExists } = await supabase
        .from("faculty_profile")
        .select("user_id")
        .eq("email", email)
        .single();

      if (emailExists) {
        return createErrorResponse(
          409,
          ErrorCodes.VALIDATION_ERROR,
          `Faculty profile with email '${email}' already exists`
        );
      }
    }

    // Prepare update data
    interface UpdateData {
      name?: string;
      email?: string | null;
      max_load_per_week?: number;
    }
    const updateData: UpdateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (max_load_per_week !== undefined) updateData.max_load_per_week = parseInt(max_load_per_week);
    if (preferred_times !== undefined) updateData.preferred_times = preferred_times;
    if (unavailable_times !== undefined) updateData.unavailable_times = unavailable_times;

    // Update faculty profile
    const { data, error } = await supabase
      .from("faculty_profile")
      .update(updateData)
      .eq("user_id", id)
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
    requireRole(user, ["scheduling", "teaching_load"]);

    const { id } = await params;
    const supabase = await createClient();

    // Check if faculty profile exists
    const { data: existing, error: checkError } = await supabase
      .from("faculty_profile")
      .select("user_id")
      .eq("user_id", id)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Faculty profile with id '${id}' not found`
      );
    }

    // Check if faculty has sections
    const { data: sections } = await supabase
      .from("section")
      .select("id")
      .eq("instructor_id", id)
      .limit(1);

    if (sections && sections.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Cannot delete faculty profile because they have sections assigned. Remove sections first.`
      );
    }

    // Delete faculty profile
    const { error } = await supabase
      .from("faculty_profile")
      .delete()
      .eq("user_id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ message: `Faculty profile deleted successfully` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

