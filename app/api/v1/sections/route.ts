/**
 * Sections List Endpoint
 *
 * GET /api/v1/sections - List sections (optionally filtered by term)
 * POST /api/v1/sections - Create a new section
 *
 * All authenticated users can view sections.
 * Only scheduling and teaching_load roles can create sections.
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
import type { Database } from "@/lib/types/database";
import {
  revalidateSections,
  revalidateSchedules,
} from "@/lib/cache/revalidation";

// Type for section query result with relations
type SectionWithRelations = Database["public"]["Tables"]["section"]["Row"] & {
  course: {
    code: string;
    title: string;
    credits: number;
    is_elective: boolean;
  } | null;
  instructor: {
    id: string | null;
    user_id: string | null;
    name: string | null;
    email: string | null;
  } | null;
  room: {
    code: string;
    type: string;
  } | null;
};

// Type for schedule section_id query result
type ScheduleSection = {
  section_id: string;
};

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get term_id (optional - support both term_id and semester_id for backward compatibility)
    let termId = searchParams.get("term_id") || searchParams.get("semester_id");

    // If no term_id provided, get current active term (status = 'draft' or 'released')
    if (!termId) {
      const { data: currentTerm } = await supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (currentTerm) {
        termId = currentTerm.id;
      }
    }

    // If term_id is provided, get section IDs from schedule first
    let sectionIds: string[] | null = null;
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      sectionIds = (scheduleSections || []).map(
        (s: ScheduleSection) => s.section_id
      );
    }

    // Build query with filters
    // Fix: Explicitly select 'activity' field to ensure it's available in response
    let query = supabase.from("section").select(`
        *,
        activity,
        course:course_code (
          code,
          title,
          credits,
          is_elective
        ),
        instructor:faculty_profile!section_instructor_id_fkey (
          id,
          user_id,
          name,
          email
        ),
        room:room_code (
          code,
          type
        )
      `);

    // If term_id is provided and we have section IDs, filter by them
    if (termId && sectionIds && sectionIds.length > 0) {
      query = query.in("id", sectionIds);
    } else if (termId && sectionIds && sectionIds.length === 0) {
      // Term exists but has no sections
      return createSuccessResponse([], 200);
    }

    // Apply optional filters - these use indexes:
    // - idx_section_group_level for level filter
    // - idx_section_state for state filter
    // - idx_section_course_code for courseCode filter
    // - idx_section_instructor_id for instructorId filter
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

    // Order by course_code to use idx_section_course_code index
    // If filtering by course_code, this ensures index usage
    const { data, error } = await query.order("course_code", {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    // Map database fields to API response format
    const sections = (data || []).map((section: SectionWithRelations) => ({
      id: section.id,
      course_code: section.course_code,
      section_no: section.section_no,
      section_type: section.activity || "lecture",
      instructor_id: section.instructor_id,
      instructor:
        section.instructor &&
        (section.instructor.id || section.instructor.user_id)
          ? {
              id: section.instructor.id || section.instructor.user_id,
              name: section.instructor.name || "",
              email: section.instructor.email || "",
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
      current_enrollment: 0, // Will be calculated from student_enrollment
      meeting_pattern: section.meeting_pattern,
      group_level: section.group_level,
      state: section.state,
      created_at: section.created_at,
      course: section.course
        ? {
            code: section.course.code,
            title: section.course.title,
            credits: section.course.credits,
            is_elective: section.course.is_elective || false,
          }
        : null,
    }));

    return createSuccessResponse(sections, 200);
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
    const {
      course_code,
      section_no,
      instructor_id,
      room_code,
      capacity,
      group_level,
      meeting_days,
      meeting_start,
      meeting_duration,
      activity,
      state,
      term_id,
    } = body;

    // Validate required fields
    if (!course_code || !section_no || !capacity || !group_level) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: course_code, section_no, capacity, group_level"
      );
    }

    if (
      !meeting_days ||
      !Array.isArray(meeting_days) ||
      meeting_days.length === 0
    ) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "meeting_days must be a non-empty array"
      );
    }

    if (!meeting_start || !meeting_duration) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: meeting_start, meeting_duration"
      );
    }

    const supabase = await createClient();

    // Check if course exists
    const { data: course } = await supabase
      .from("course")
      .select("code")
      .eq("code", course_code)
      .single();

    if (!course) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Course with code '${course_code}' not found`
      );
    }

    // Check if section already exists
    const { data: existing } = await supabase
      .from("section")
      .select("id")
      .eq("course_code", course_code)
      .eq("section_no", section_no)
      .single();

    if (existing) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Section ${course_code}-${section_no} already exists`
      );
    }

    // Build meeting_pattern JSONB
    const meeting_pattern = {
      days: meeting_days,
      start: meeting_start,
      duration: parseInt(meeting_duration),
    };

    // Insert new section
    const { data, error } = await supabase
      .from("section")
      .insert({
        course_code,
        section_no,
        instructor_id: instructor_id || null,
        room_code: room_code || null,
        capacity: parseInt(capacity),
        group_level: parseInt(group_level),
        meeting_pattern,
        activity: activity || "lecture",
        state: state || "draft",
        created_by: user.id,
      })
      .select(
        `
        *,
        course:course_code (
          code,
          title,
          credits,
          is_elective
        ),
        instructor:faculty_profile!section_instructor_id_fkey (
          id,
          user_id,
          name,
          email
        ),
        room:room_code (
          code,
          type
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    // If term_id is provided, add section to schedule
    if (term_id) {
      const { error: scheduleError } = await supabase.from("schedule").insert({
        term_id,
        section_id: data.id,
      });

      if (scheduleError) {
        // Log error but don't fail the request
        // The section was created successfully, schedule association can be retried
        // TODO: Consider adding proper error logging service (e.g., Sentry)
        // For now, we silently continue as schedule association is non-critical
      }
    }

    // Map to API response format
    const section = {
      id: data.id,
      course_code: data.course_code,
      section_no: data.section_no,
      section_type: data.activity || "lecture",
      instructor_id: data.instructor_id,
      instructor:
        data.instructor && (data.instructor.id || data.instructor.user_id)
          ? {
              id: data.instructor.id || data.instructor.user_id,
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

    // Revalidate section and schedule-related caches after successful creation
    revalidateSections();
    if (term_id) {
      revalidateSchedules();
    }

    return createSuccessResponse(section, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
