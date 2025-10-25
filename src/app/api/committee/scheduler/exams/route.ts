/**
 * Scheduler Exams API
 * Manage exam schedules for courses
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";

/**
 * GET /api/committee/scheduler/exams
 * Get exam schedules for a term
 * Query params:
 * - term_code: string (required)
 * - exam_type: 'MIDTERM' | 'MIDTERM2' | 'FINAL' (optional)
 * - course_code: string (optional)
 */
export async function GET(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is committee member
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee) {
    return errorResponse("Unauthorized: Must be committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const termCode = searchParams.get("term_code");
  const examType = searchParams.get("exam_type");
  const courseCode = searchParams.get("course_code");

  if (!termCode) {
    return validationErrorResponse({ message: "term_code is required" });
  }

  try {
    let query = supabase
      .from("exam")
      .select(`
        *,
        course:course(code, name, credits),
        room:room(number, building, capacity, type)
      `)
      .eq("term_code", termCode)
      .order("exam_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (examType) {
      query = query.eq("exam_type", examType);
    }

    if (courseCode) {
      query = query.eq("course_code", courseCode);
    }

    const { data: exams, error: examsError } = await query;

    if (examsError) {
      return errorResponse(examsError.message);
    }

    return successResponse({
      term_code: termCode,
      exams,
      count: exams.length,
    });
  } catch (error) {
    console.error("Error in GET /api/committee/scheduler/exams:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * POST /api/committee/scheduler/exams
 * Create a new exam schedule
 * Body: {
 *   course_code: string;
 *   term_code: string;
 *   exam_type: 'MIDTERM' | 'MIDTERM2' | 'FINAL';
 *   exam_date: string (YYYY-MM-DD);
 *   start_time: string (HH:MM);
 *   duration: number (minutes);
 *   room_number?: string;
 * }
 */
export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  try {
    const body = await request.json();
    const { course_code, term_code, exam_type, exam_date, start_time, duration, room_number } = body;

    // Validate required fields
    if (!course_code || !term_code || !exam_type || !exam_date || !start_time || !duration) {
      return validationErrorResponse({
        message: "Missing required fields: course_code, term_code, exam_type, exam_date, start_time, duration",
      });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from("course")
      .select("code, name")
      .eq("code", course_code)
      .maybeSingle();

    if (courseError || !course) {
      return errorResponse("Course not found", 404);
    }

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("code")
      .eq("code", term_code)
      .maybeSingle();

    if (termError || !term) {
      return errorResponse("Academic term not found", 404);
    }

    // Check for conflicts - same room and time
    if (room_number) {
      const { data: roomConflicts, error: conflictError } = await supabase
        .from("exam")
        .select("id, course_code")
        .eq("term_code", term_code)
        .eq("room_number", room_number)
        .eq("exam_date", exam_date)
        .eq("start_time", start_time);

      if (conflictError) {
        console.error("Error checking conflicts:", conflictError);
      }

      if (roomConflicts && roomConflicts.length > 0) {
        return errorResponse(
          `Room ${room_number} is already booked for an exam at this time`,
          409
        );
      }
    }

    // Create exam
    const { data: exam, error: examError } = await supabase
      .from("exam")
      .insert({
        course_code,
        term_code,
        exam_type,
        exam_date,
        start_time,
        duration,
        room_number,
      })
      .select(`
        *,
        course:course(code, name, credits),
        room:room(number, building, capacity, type)
      `)
      .single();

    if (examError) {
      return errorResponse(examError.message);
    }

    return successResponse(exam, "Exam schedule created successfully");
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/exams:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * PATCH /api/committee/scheduler/exams
 * Update an existing exam schedule
 * Body: {
 *   exam_id: string;
 *   exam_date?: string;
 *   start_time?: string;
 *   duration?: number;
 *   room_number?: string;
 * }
 */
export async function PATCH(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  try {
    const body = await request.json();
    const { exam_id, exam_date, start_time, duration, room_number } = body;

    if (!exam_id) {
      return validationErrorResponse({ message: "exam_id is required" });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (exam_date !== undefined) updateData.exam_date = exam_date;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (duration !== undefined) updateData.duration = duration;
    if (room_number !== undefined) updateData.room_number = room_number;

    if (Object.keys(updateData).length === 0) {
      return validationErrorResponse({ message: "No fields to update" });
    }

    // Check for conflicts if room, date, or time changed
    if (room_number && (exam_date || start_time)) {
      const { data: existingExam } = await supabase
        .from("exam")
        .select("exam_date, start_time, term_code")
        .eq("id", exam_id)
        .single();

      const checkDate = exam_date || existingExam?.exam_date;
      const checkTime = start_time || existingExam?.start_time;
      const termCode = existingExam?.term_code;

      if (termCode && checkDate && checkTime) {
        const { data: roomConflicts } = await supabase
          .from("exam")
          .select("id, course_code")
          .eq("term_code", termCode)
          .eq("room_number", room_number)
          .eq("exam_date", checkDate)
          .eq("start_time", checkTime)
          .neq("id", exam_id);

        if (roomConflicts && roomConflicts.length > 0) {
          return errorResponse(
            `Room ${room_number} is already booked for an exam at this time`,
            409
          );
        }
      }
    }

    // Update exam
    const { data: exam, error: examError } = await supabase
      .from("exam")
      .update(updateData)
      .eq("id", exam_id)
      .select(`
        *,
        course:course(code, name, credits),
        room:room(number, building, capacity, type)
      `)
      .single();

    if (examError) {
      return errorResponse(examError.message);
    }

    return successResponse(exam, "Exam schedule updated successfully");
  } catch (error) {
    console.error("Error in PATCH /api/committee/scheduler/exams:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * DELETE /api/committee/scheduler/exams
 * Delete an exam schedule
 * Query params:
 * - exam_id: string (required)
 */
export async function DELETE(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const examId = searchParams.get("exam_id");

  if (!examId) {
    return validationErrorResponse({ message: "exam_id is required" });
  }

  try {
    const { error: deleteError } = await supabase
      .from("exam")
      .delete()
      .eq("id", examId);

    if (deleteError) {
      return errorResponse(deleteError.message);
    }

    return successResponse({ exam_id: examId }, "Exam schedule deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/committee/scheduler/exams:", error);
    return errorResponse("Internal server error");
  }
}

