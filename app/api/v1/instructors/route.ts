/**
 * Instructors List Endpoint
 * 
 * GET /api/v1/instructors - List all instructors
 * POST /api/v1/instructors - Create a new instructor
 * 
 * All authenticated users can view instructors.
 * Only scheduling and teaching_load roles can create instructors.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";

type InstructorRow = Database["public"]["Tables"]["instructor"]["Row"];

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view instructors)
    await authenticateRequest(request);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("instructor")
      .select("*")
      .order("name", { ascending: true });

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
    requireRole(user, ["scheduling", "teaching_load"]);

    const body = await request.json();
    const { name, email, max_load_per_week } = body;

    // Validate required fields
    if (!name) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: name"
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid email format"
      );
    }

    // Validate max_load_per_week
    if (max_load_per_week !== undefined && (max_load_per_week < 1 || max_load_per_week > 40)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "max_load_per_week must be between 1 and 40"
      );
    }

    const supabase = await createClient();

    // Check if email already exists (if provided)
    if (email) {
      const { data: existing } = await supabase
        .from("instructor")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        return createErrorResponse(
          409,
          ErrorCodes.VALIDATION_ERROR,
          `Instructor with email '${email}' already exists`
        );
      }
    }

    // Insert new instructor
    const { data, error } = await supabase
      .from("instructor")
      .insert({
        name,
        email: email || null,
        max_load_per_week: max_load_per_week ? parseInt(max_load_per_week) : 12,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

