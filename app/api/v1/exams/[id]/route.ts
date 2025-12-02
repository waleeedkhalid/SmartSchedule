/**
 * Single Exam Endpoint
 *
 * GET /api/v1/exams/[id] - Get a single exam by ID
 * PUT /api/v1/exams/[id] - Update an exam
 * DELETE /api/v1/exams/[id] - Delete an exam
 *
 * All authenticated users can view exams.
 * Only scheduling role can update/delete exams.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// Valid exam types
const VALID_EXAM_TYPES = ["mid1", "mid2", "final"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user (all authenticated users can view exams)
    await authenticateRequest(request);

    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam")
      .select(
        "id, course_code, exam_type, date, start_time, duration_minutes, room_codes, created_at, updated_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Exam with id '${id}' not found`
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check role (only scheduling can update exams)
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const { id } = await params;
    const body = await request.json();
    const {
      course_code,
      exam_type,
      date,
      start_time,
      duration_minutes,
      room_codes,
    } = body;

    const supabase = await createClient();

    // Check if exam exists
    const { data: existingExam, error: fetchError } = await supabase
      .from("exam")
      .select("id, course_code, exam_type")
      .eq("id", id)
      .single();

    if (fetchError || !existingExam) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Exam with id '${id}' not found`
      );
    }

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};

    // Validate and add course_code if provided
    if (course_code !== undefined) {
      const { data: course, error: courseError } = await supabase
        .from("course")
        .select("code")
        .eq("code", course_code)
        .single();

      if (courseError || !course) {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Course with code '${course_code}' not found`
        );
      }
      updates.course_code = course_code;
    }

    // Validate exam_type if provided
    if (exam_type !== undefined) {
      if (!VALID_EXAM_TYPES.includes(exam_type)) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `Invalid exam_type. Must be one of: ${VALID_EXAM_TYPES.join(", ")}`
        );
      }

      // Check if another exam already has this type for the same course
      const targetCourseCode = course_code || existingExam.course_code;
      if (
        exam_type !== existingExam.exam_type ||
        course_code !== existingExam.course_code
      ) {
        const { data: duplicateExam } = await supabase
          .from("exam")
          .select("id")
          .eq("course_code", targetCourseCode)
          .eq("exam_type", exam_type)
          .neq("id", id)
          .single();

        if (duplicateExam) {
          return createErrorResponse(
            409,
            ErrorCodes.VALIDATION_ERROR,
            `An exam of type '${exam_type}' already exists for course '${targetCourseCode}'`
          );
        }
      }
      updates.exam_type = exam_type;
    }

    // Validate and add date if provided
    if (date !== undefined) {
      updates.date = date;
    }

    // Validate and add start_time if provided
    if (start_time !== undefined) {
      updates.start_time = start_time;
    }

    // Validate and add duration_minutes if provided
    if (duration_minutes !== undefined) {
      const durationNum = parseInt(duration_minutes);
      if (isNaN(durationNum) || durationNum < 30 || durationNum > 300) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Duration must be between 30 and 300 minutes"
        );
      }
      updates.duration_minutes = durationNum;
    }

    // Validate and add room_codes if provided
    if (room_codes !== undefined) {
      const finalRoomCodes: string[] = Array.isArray(room_codes)
        ? room_codes
        : [];

      if (finalRoomCodes.length > 0) {
        const { data: rooms, error: roomError } = await supabase
          .from("room")
          .select("code")
          .in("code", finalRoomCodes);

        if (roomError) {
          throw roomError;
        }

        const validRoomCodes = new Set((rooms || []).map((r) => r.code));
        const invalidRooms = finalRoomCodes.filter(
          (code) => !validRoomCodes.has(code)
        );

        if (invalidRooms.length > 0) {
          return createErrorResponse(
            400,
            ErrorCodes.VALIDATION_ERROR,
            `Invalid room codes: ${invalidRooms.join(", ")}`
          );
        }
      }
      updates.room_codes = finalRoomCodes;
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "No valid fields provided for update"
      );
    }

    // Perform update
    const { data, error } = await supabase
      .from("exam")
      .update(updates)
      .eq("id", id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and check role (only scheduling can delete exams)
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const { id } = await params;
    const supabase = await createClient();

    // Check if exam exists
    const { data: existingExam, error: fetchError } = await supabase
      .from("exam")
      .select("id, course_code, exam_type")
      .eq("id", id)
      .single();

    if (fetchError || !existingExam) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Exam with id '${id}' not found`
      );
    }

    // Delete the exam
    const { error } = await supabase.from("exam").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse(
      {
        message: `Exam for ${existingExam.course_code} (${existingExam.exam_type}) deleted successfully`,
        deleted_id: id,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
