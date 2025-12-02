/**
 * Exam Conflicts Endpoint
 *
 * GET /api/v1/exams/[id]/conflicts - Check for conflicts for a specific exam
 * POST /api/v1/exams/conflicts - Check conflicts for proposed exam data (before creating)
 *
 * All authenticated users can check exam conflicts.
 *
 * Conflict Types:
 * 1. Room conflicts - Same room, same date/time
 * 2. Student level conflicts - Same level courses at same date/time
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface ConflictResult {
  room_conflicts: Array<{
    exam_id: string;
    course_code: string;
    conflicting_rooms: string[];
    date: string;
    start_time: string;
  }>;
  student_conflicts: Array<{
    exam_id: string;
    course_code: string;
    level: number;
    date: string;
    start_time: string;
  }>;
  has_conflicts: boolean;
}

// Helper to check if two time ranges overlap
function timesOverlap(
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean {
  // Convert time strings to minutes since midnight
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = toMinutes(start1);
  const end1Min = start1Min + duration1;
  const start2Min = toMinutes(start2);
  const end2Min = start2Min + duration2;

  // Check for overlap
  return start1Min < end2Min && start2Min < end1Min;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await authenticateRequest(request);

    const { id } = await params;
    const supabase = await createClient();

    // Fetch the exam
    const { data: exam, error: examError } = await supabase
      .from("exam")
      .select("id, course_code, date, start_time, duration_minutes, room_codes")
      .eq("id", id)
      .single();

    if (examError || !exam) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Exam with id '${id}' not found`
      );
    }

    // Get the course to find its level
    const { data: course } = await supabase
      .from("course")
      .select("recommended_level")
      .eq("code", exam.course_code)
      .single();

    const examLevel = course?.recommended_level;

    // Fetch all other exams on the same date
    const { data: otherExams, error: otherExamsError } = await supabase
      .from("exam")
      .select("id, course_code, date, start_time, duration_minutes, room_codes")
      .eq("date", exam.date)
      .neq("id", id);

    if (otherExamsError) {
      throw otherExamsError;
    }

    const result: ConflictResult = {
      room_conflicts: [],
      student_conflicts: [],
      has_conflicts: false,
    };

    if (!otherExams || otherExams.length === 0) {
      return createSuccessResponse(result, 200);
    }

    // Check for conflicts
    for (const otherExam of otherExams) {
      // Check if times overlap
      const overlap = timesOverlap(
        exam.start_time,
        exam.duration_minutes,
        otherExam.start_time,
        otherExam.duration_minutes
      );

      if (!overlap) continue;

      // Check room conflicts
      const examRooms = new Set(exam.room_codes || []);
      const otherRooms = otherExam.room_codes || [];
      const conflictingRooms = otherRooms.filter((room: string) =>
        examRooms.has(room)
      );

      if (conflictingRooms.length > 0) {
        result.room_conflicts.push({
          exam_id: otherExam.id,
          course_code: otherExam.course_code,
          conflicting_rooms: conflictingRooms,
          date: otherExam.date,
          start_time: otherExam.start_time,
        });
        result.has_conflicts = true;
      }

      // Check student level conflicts (same level courses)
      if (examLevel) {
        const { data: otherCourse } = await supabase
          .from("course")
          .select("recommended_level")
          .eq("code", otherExam.course_code)
          .single();

        if (otherCourse?.recommended_level === examLevel) {
          result.student_conflicts.push({
            exam_id: otherExam.id,
            course_code: otherExam.course_code,
            level: examLevel,
            date: otherExam.date,
            start_time: otherExam.start_time,
          });
          result.has_conflicts = true;
        }
      }
    }

    return createSuccessResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
