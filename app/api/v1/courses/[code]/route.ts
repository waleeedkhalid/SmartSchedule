/**
 * Course Detail Endpoint
 * 
 * GET /api/v1/courses/:code
 * 
 * Returns details for a specific course by code.
 * All authenticated users can view course details.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
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
      .from("course")
      .select("*")
      .eq("code", params.code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Course with code '${params.code}' not found`
        );
      }
      throw error;
    }

    // Map database fields to API response format
    const course = {
      code: data.code,
      name: data.title,
      credits: data.credits,
      level: data.level,
      course_type: data.is_elective ? "elective" : "required",
      created_at: data.created_at,
    };

    return createSuccessResponse(course, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

