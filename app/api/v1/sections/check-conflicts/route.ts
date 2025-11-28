/**
 * Section Conflict Check Endpoint
 * 
 * POST /api/v1/sections/check-conflicts - Check for scheduling conflicts
 * 
 * Checks for room and instructor conflicts for a given section configuration.
 * All authenticated users can check conflicts.
 * 
 * Note: Student-level conflicts are not checked here as they require checking
 * actual student enrollments, which should be done separately if needed.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";

type SectionRow = Database["public"]["Tables"]["section"]["Row"];

// Type for Supabase join result
interface ScheduleEntryWithSection {
  section_id: string;
  section: SectionRow | null;
}

interface ConflictCheckRequest {
  room_code: string | null;
  instructor_id: string | null;
  meeting_days: string[];
  meeting_start: string;
  meeting_duration: number;
  term_id?: string; // Explicit term_id (recommended)
  exclude_section_id?: string;
}

interface ConflictSection {
  section_id: string;
  course_code: string;
  section_no: string;
  room_code: string | null;
  instructor_id: string | null;
  group_level: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
}

interface ConflictResponse {
  has_conflicts: boolean;
  room_conflicts: ConflictSection[];
  instructor_conflicts: ConflictSection[];
}

/**
 * Validates time string format (HH:MM)
 */
function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Check if two time slots overlap
 */
function doTimeSlotsOverlap(
  days1: string[],
  start1: string,
  duration1: number,
  days2: string[],
  start2: string,
  duration2: number
): boolean {
  // Check if days overlap
  const daysOverlap = days1.some((day) => days2.includes(day));
  if (!daysOverlap) return false;

  // Validate time format before parsing
  if (!isValidTimeFormat(start1) || !isValidTimeFormat(start2)) {
    return false;
  }

  // Check if times overlap
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = start2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = start1Minutes + duration1;
  const start2Minutes = h2 * 60 + m2;
  const end2Minutes = start2Minutes + duration2;

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const body: ConflictCheckRequest = await request.json();
    const {
      room_code,
      instructor_id,
      meeting_days,
      meeting_start,
      meeting_duration,
      term_id,
      exclude_section_id,
    } = body;

    // Validate required fields
    if (!meeting_days || !Array.isArray(meeting_days) || meeting_days.length === 0) {
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
        "meeting_start and meeting_duration are required"
      );
    }

    // Validate time format
    if (!isValidTimeFormat(meeting_start)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "meeting_start must be in HH:MM format (e.g., '08:00', '14:30')"
      );
    }

    // Validate duration
    if (typeof meeting_duration !== "number" || meeting_duration <= 0) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "meeting_duration must be a positive number"
      );
    }

    const supabase = await createClient();

    // Determine term_id: use provided term_id or get current active term
    let activeTermId: string | null = term_id || null;

    if (!activeTermId) {
      // Get current active term (prefer draft over released, most recent first)
      // First try to get a draft term (active scheduling)
      const { data: draftTerm } = await supabase
        .from("academic_term")
        .select("id")
        .eq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (draftTerm) {
        activeTermId = draftTerm.id;
      } else {
        // Fallback to released term if no draft exists
        const { data: releasedTerm } = await supabase
          .from("academic_term")
          .select("id")
          .eq("status", "released")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (releasedTerm) {
          activeTermId = releasedTerm.id;
        }
      }
    }

    // If no term found, return error (we need a term to check conflicts)
    if (!activeTermId) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "No active term found. Please provide term_id in the request body."
      );
    }

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("id, status")
      .eq("id", activeTermId)
      .single();

    if (termError || !term) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Academic term with id '${activeTermId}' not found`
      );
    }

    // Build optimized query: join schedule to filter by term, then get sections
    // This ensures we only check conflicts against sections in the same term
    let query = supabase
      .from("schedule")
      .select(`
        section_id,
        section:section!schedule_section_id_fkey(
          id,
          course_code,
          section_no,
          room_code,
          instructor_id,
          group_level,
          meeting_pattern
        )
      `)
      .eq("term_id", activeTermId)
      .not("section.meeting_pattern", "is", null);

    // Exclude the current section being checked
    if (exclude_section_id) {
      query = query.neq("section_id", exclude_section_id);
    }

    const { data: scheduleEntries, error } = await query;

    if (error) {
      throw error;
    }

    // Extract sections from schedule entries
    // Supabase returns joined data - section may be an array or single object
    const sections: SectionRow[] = [];
    for (const entry of scheduleEntries || []) {
      const entryTyped = entry as unknown as ScheduleEntryWithSection;
      const section = Array.isArray(entryTyped.section) 
        ? entryTyped.section[0] 
        : entryTyped.section;
      
      if (section && typeof section === 'object' && 'id' in section) {
        sections.push(section as SectionRow);
      }
    }

    const conflicts: ConflictResponse = {
      has_conflicts: false,
      room_conflicts: [],
      instructor_conflicts: [],
    };

    // Check each section for conflicts
    for (const section of sections) {
      const pattern = section.meeting_pattern as {
        days?: string[];
        start?: string;
        duration?: number;
      } | null;

      // Skip sections without valid meeting patterns
      if (
        !pattern ||
        !pattern.days ||
        !Array.isArray(pattern.days) ||
        pattern.days.length === 0 ||
        !pattern.start ||
        !pattern.duration
      ) {
        continue;
      }

      // Validate pattern time format
      if (!isValidTimeFormat(pattern.start)) {
        continue; // Skip invalid time formats
      }

      // Check if time slots overlap
      const overlaps = doTimeSlotsOverlap(
        meeting_days,
        meeting_start,
        meeting_duration,
        pattern.days,
        pattern.start,
        pattern.duration
      );

      if (!overlaps) {
        continue;
      }

      const conflictSection: ConflictSection = {
        section_id: section.id,
        course_code: section.course_code,
        section_no: section.section_no,
        room_code: section.room_code,
        instructor_id: section.instructor_id,
        group_level: section.group_level,
        meeting_pattern: {
          days: pattern.days,
          start: pattern.start,
          duration: pattern.duration,
        },
      };

      // Check room conflict
      if (room_code && section.room_code === room_code) {
        conflicts.room_conflicts.push(conflictSection);
        conflicts.has_conflicts = true;
      }

      // Check instructor conflict
      if (instructor_id && section.instructor_id === instructor_id) {
        conflicts.instructor_conflicts.push(conflictSection);
        conflicts.has_conflicts = true;
      }

      // Note: Student-level conflicts removed - checking group_level alone is incorrect.
      // To check student conflicts, query student_enrollment table to find students
      // enrolled in both overlapping sections.
    }

    return createSuccessResponse(conflicts, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

