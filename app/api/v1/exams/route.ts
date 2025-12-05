/**
 * Exams List Endpoint
 *
 * GET /api/v1/exams - List all exams
 * POST /api/v1/exams - Create a new exam
 *
 * All authenticated users can view exams.
 * Only scheduling role can create exams.
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
import { revalidateExams } from "@/lib/cache/revalidation";

// OPTIMIZATION: Cache API route responses for 15 minutes (900 seconds)
// Exam data changes during exam scheduling periods
export const revalidate = 900; // 15 minutes

// Valid exam types
const VALID_EXAM_TYPES = ["mid1", "mid2", "final"] as const;
type ExamType = (typeof VALID_EXAM_TYPES)[number];

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view exams)
    await authenticateRequest(request);
    const supabase = await createClient();

    // Get optional query parameters
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get("course_code");
    const examType = searchParams.get("exam_type") as ExamType | null;

    // Build query
    let query = supabase
      .from("exam")
      .select(
        "id, course_code, exam_type, date, start_time, duration_minutes, room_codes, created_at, updated_at"
      )
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    // Apply filters if provided
    if (courseCode) {
      query = query.eq("course_code", courseCode);
    }
    if (examType && VALID_EXAM_TYPES.includes(examType)) {
      query = query.eq("exam_type", examType);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const response = createSuccessResponse(data || [], 200);
    // OPTIMIZATION: Add cache headers for browser/CDN caching
    // s-maxage: Cache for 15 minutes on CDN
    // stale-while-revalidate: Serve stale content for up to 2 hours while revalidating
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=7200"
    );
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check role (only scheduling can create exams)
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const {
      course_code,
      exam_type,
      date,
      start_time,
      duration_minutes,
      room_codes,
    } = body;

    // Validate required fields
    if (!course_code || !date || !start_time || !duration_minutes) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: course_code, date, start_time, duration_minutes"
      );
    }

    // Validate exam_type if provided
    const finalExamType: ExamType = exam_type || "final";
    if (!VALID_EXAM_TYPES.includes(finalExamType)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        `Invalid exam_type. Must be one of: ${VALID_EXAM_TYPES.join(", ")}`
      );
    }

    // Validate duration
    const durationNum = parseInt(duration_minutes);
    if (isNaN(durationNum) || durationNum < 30 || durationNum > 300) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Duration must be between 30 and 300 minutes"
      );
    }

    const supabase = await createClient();

    // Check if course exists
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

    // Check if exam already exists for this course and exam type
    const { data: existingExam } = await supabase
      .from("exam")
      .select("id")
      .eq("course_code", course_code)
      .eq("exam_type", finalExamType)
      .single();

    if (existingExam) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `An exam of type '${finalExamType}' already exists for course '${course_code}'. Use PUT to update it.`
      );
    }

    // Validate rooms if provided
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

    // Insert new exam
    const { data, error } = await supabase
      .from("exam")
      .insert({
        course_code,
        exam_type: finalExamType,
        date,
        start_time,
        duration_minutes: durationNum,
        room_codes: finalRoomCodes,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate exam-related caches after successful creation
    revalidateExams();

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate and check role (only scheduling can delete all exams)
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const supabase = await createClient();

    // Delete all exam rows (use a benign filter to satisfy Supabase requirement)
    const { error } = await supabase
      .from("exam")
      .delete()
      .gt("created_at", "0001-01-01");

    if (error) {
      throw error;
    }

    await revalidateExams();

    return createSuccessResponse(
      { message: "All exams deleted successfully" },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
