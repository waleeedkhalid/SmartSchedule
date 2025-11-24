/**
 * Section Detail Endpoint
 * 
 * GET /api/v1/sections/:id
 * 
 * Returns details for a specific section.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: {
    id: string;
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
      .from("section")
      .select(`
        *,
        course:course_code (
          code,
          title,
          credits
        ),
        instructor:instructor_id (
          id,
          name,
          email
        ),
        room:room_code (
          code,
          type
        )
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Section with id '${params.id}' not found`
        );
      }
      throw error;
    }

    // Map database fields to API response format
    const section = {
      id: data.id,
      course_code: data.course_code,
      section_no: data.section_no,
      section_type: data.meeting_pattern?.type || "lecture",
      instructor_id: data.instructor_id,
      instructor: data.instructor
        ? {
            id: data.instructor.id,
            name: data.instructor.name,
            email: data.instructor.email,
          }
        : null,
      room_code: data.room_code,
      room: data.room
        ? {
            code: data.room.code,
            type: data.room.type,
          }
        : null,
      capacity: data.capacity,
      current_enrollment: data.current_enrollment || 0,
      meeting_pattern: data.meeting_pattern,
      group_level: data.group_level,
      state: data.state,
      academic_semester_id: data.academic_semester_id,
      created_at: data.created_at,
    };

    return createSuccessResponse(section, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

