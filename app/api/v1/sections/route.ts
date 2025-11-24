/**
 * Sections List Endpoint
 * 
 * GET /api/v1/sections
 * 
 * Returns list of sections for a semester with optional filtering.
 * Requires semester_id parameter (defaults to current semester).
 * 
 * Why platform-agnostic: Query parameters and JSON responses work identically
 * across all HTTP clients (Fetch, Axios, Retrofit, URLSession).
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get semester_id (required, but defaults to current)
    let semesterId = searchParams.get("semester_id");

    // If no semester_id provided, get current semester
    if (!semesterId) {
      const { data: currentSemester } = await supabase
        .from("academic_semesters")
        .select("id")
        .eq("is_current", true)
        .single();

      if (!currentSemester) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "No current semester found. Please specify semester_id."
        );
      }
      semesterId = currentSemester.id;
    }

    // Build query with filters
    let query = supabase
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
      .eq("academic_semester_id", semesterId);

    // Apply optional filters
    const level = searchParams.get("level");
    if (level) {
      query = query.eq("group_level", parseInt(level));
    }

    const state = searchParams.get("state");
    if (state) {
      query = query.eq("state", state);
    }

    const courseCode = searchParams.get("courseCode");
    if (courseCode) {
      query = query.eq("course_code", courseCode);
    }

    const instructorId = searchParams.get("instructorId");
    if (instructorId) {
      query = query.eq("instructor_id", instructorId);
    }

    const sectionType = searchParams.get("sectionType");
    if (sectionType) {
      // Assuming meeting_pattern contains type information
      // This may need adjustment based on actual schema
      query = query.contains("meeting_pattern", { type: sectionType });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map database fields to API response format
    const sections = (data || []).map((section: any) => ({
      id: section.id,
      course_code: section.course_code,
      section_no: section.section_no,
      section_type: section.meeting_pattern?.type || "lecture",
      instructor_id: section.instructor_id,
      instructor: section.instructor
        ? {
            id: section.instructor.id,
            name: section.instructor.name,
            email: section.instructor.email,
          }
        : null,
      room_code: section.room_code,
      room: section.room
        ? {
            code: section.room.code,
            type: section.room.type,
          }
        : null,
      capacity: section.capacity,
      current_enrollment: section.current_enrollment || 0,
      meeting_pattern: section.meeting_pattern,
      group_level: section.group_level,
      state: section.state,
      academic_semester_id: section.academic_semester_id,
      created_at: section.created_at,
    }));

    return createSuccessResponse(sections, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

