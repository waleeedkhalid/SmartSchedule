/**
 * Course Detail Endpoint
 * 
 * GET /api/v1/courses/:code - Get course details
 * PUT /api/v1/courses/:code - Update course
 * DELETE /api/v1/courses/:code - Delete course
 * 
 * All authenticated users can view course details.
 * Only scheduling and teaching_load roles can update/delete courses.
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

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    const body = await request.json();
    const { name, credits, level, course_type, weekly_hours } = body;

    const supabase = await createClient();

    // Check if course exists
    const { data: existing, error: checkError } = await supabase
      .from("course")
      .select("code")
      .eq("code", params.code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Course with code '${params.code}' not found`
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.title = name;
    if (credits !== undefined) {
      const creditsNum = parseInt(credits);
      updateData.credits = creditsNum;
      // Auto-calculate weekly_hours if not explicitly provided: credits + 1, except if credits = 2 then weekly_hours = 2
      if (weekly_hours === undefined) {
        updateData.weekly_hours = creditsNum === 2 ? 2 : creditsNum + 1;
      }
    }
    if (level !== undefined) updateData.level = parseInt(level);
    if (weekly_hours !== undefined) updateData.weekly_hours = parseInt(weekly_hours);
    if (course_type !== undefined) updateData.is_elective = course_type === "elective";

    // Update course
    const { data, error } = await supabase
      .from("course")
      .update(updateData)
      .eq("code", params.code)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map to API response format
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

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    const supabase = await createClient();

    // Check if course exists
    const { data: existing, error: checkError } = await supabase
      .from("course")
      .select("code")
      .eq("code", params.code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Course with code '${params.code}' not found`
      );
    }

    // Check if course has sections
    const { data: sections } = await supabase
      .from("section")
      .select("id")
      .eq("course_code", params.code)
      .limit(1);

    if (sections && sections.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Cannot delete course '${params.code}' because it has sections. Delete sections first.`
      );
    }

    // Delete course
    const { error } = await supabase
      .from("course")
      .delete()
      .eq("code", params.code);

    if (error) {
      throw error;
    }

    return createSuccessResponse({ message: `Course '${params.code}' deleted successfully` }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
