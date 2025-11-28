/**
 * Section Detail Endpoint
 * 
 * GET /api/v1/sections/:id - Get section details
 * PUT /api/v1/sections/:id - Update section
 * DELETE /api/v1/sections/:id - Delete section
 * 
 * All authenticated users can view section details.
 * Only scheduling and teaching_load roles can update/delete sections.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { revalidateSections, revalidateSchedules } from "@/lib/cache/revalidation";

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

    // Fix: Explicitly select 'activity' field to ensure it's available in response
    const { data, error } = await supabase
      .from("section")
      .select(`
        *,
        activity,
        course:course!section_course_code_fkey (
          code,
          title,
          credits
        ),
        instructor:faculty_profile!section_instructor_id_fkey (
          user_id,
          name,
          email
        ),
        room:room!section_room_code_fkey (
          code,
          type
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Section with id '${id}' not found`
        );
      }
      throw error;
    }

    // Map database fields to API response format
    const section = {
      id: data.id,
      course_code: data.course_code,
      section_no: data.section_no,
      section_type: data.activity || "lecture",
      instructor_id: data.instructor_id,
      instructor: data.instructor
        ? {
            id: data.instructor.user_id,
            name: data.instructor.name || "",
            email: data.instructor.email || "",
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
      current_enrollment: 0,
      meeting_pattern: data.meeting_pattern,
      group_level: data.group_level,
      state: data.state,
      created_at: data.created_at,
    };

    return createSuccessResponse(section, 200);
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
    const {
      instructor_id,
      room_code,
      capacity,
      group_level,
      meeting_days,
      meeting_start,
      meeting_duration,
      activity,
      state,
    } = body;

    const supabase = await createClient();

    // Check if section exists
    const { data: existing, error: checkError } = await supabase
      .from("section")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Section with id '${id}' not found`
      );
    }

    // Prepare update data
    interface UpdateData {
      instructor_id?: string | null;
      room_code?: string | null;
      capacity?: number;
      group_level?: number;
      activity?: string;
    }
    const updateData: UpdateData = {};
    if (instructor_id !== undefined) updateData.instructor_id = instructor_id || null;
    if (room_code !== undefined) updateData.room_code = room_code || null;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (group_level !== undefined) updateData.group_level = parseInt(group_level);
    if (activity !== undefined) updateData.activity = activity;
    if (state !== undefined) updateData.state = state;

    // Update meeting_pattern if provided
    if (meeting_days || meeting_start || meeting_duration) {
      // Get current meeting_pattern
      const { data: current } = await supabase
        .from("section")
        .select("meeting_pattern")
        .eq("id", id)
        .single();

      const currentPattern = current?.meeting_pattern || {};
      updateData.meeting_pattern = {
        days: meeting_days || currentPattern.days,
        start: meeting_start || currentPattern.start,
        duration: meeting_duration ? parseInt(meeting_duration) : currentPattern.duration,
      };
    }

    // Update section
    const { data, error } = await supabase
      .from("section")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        activity,
        course:course_code (
          code,
          title,
          credits
        ),
        instructor:faculty_profile!section_instructor_id_fkey (
          user_id,
          name,
          email
        ),
        room:room!section_room_code_fkey (
          code,
          type
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Map to API response format
    const section = {
      id: data.id,
      course_code: data.course_code,
      section_no: data.section_no,
      section_type: data.activity || "lecture",
      instructor_id: data.instructor_id,
      instructor: data.instructor
        ? {
            id: data.instructor.user_id,
            name: data.instructor.name || "",
            email: data.instructor.email || "",
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
      current_enrollment: 0,
      meeting_pattern: data.meeting_pattern,
      group_level: data.group_level,
      state: data.state,
      created_at: data.created_at,
    };

    // Revalidate section and schedule-related caches after successful update
    revalidateSections();
    revalidateSchedules();

    return createSuccessResponse(section, 200);
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

    // Check if section exists
    const { data: existing, error: checkError } = await supabase
      .from("section")
      .select("id, course_code, section_no")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Section with id '${id}' not found`
      );
    }

    // Check if section has enrollments
    const { data: enrollments } = await supabase
      .from("student_enrollment")
      .select("id")
      .eq("section_id", id)
      .limit(1);

    if (enrollments && enrollments.length > 0) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Cannot delete section ${existing.course_code}-${existing.section_no} because it has student enrollments. Remove enrollments first.`
      );
    }

    // Delete from schedule first (if exists)
    await supabase
      .from("schedule")
      .delete()
      .eq("section_id", id);

    // Delete section
    const { error } = await supabase
      .from("section")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    // Revalidate section and schedule-related caches after successful deletion
    revalidateSections();
    revalidateSchedules();

    return createSuccessResponse(
      { message: `Section ${existing.course_code}-${existing.section_no} deleted successfully` },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
