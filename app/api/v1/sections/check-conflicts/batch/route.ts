/**
 * Batch Section Conflict Check Endpoint
 *
 * POST /api/v1/sections/check-conflicts/batch - Check conflicts for multiple sections at once
 *
 * Performance optimization: Instead of making N separate API calls for N sections,
 * this endpoint checks all conflicts in a single request with a single DB query.
 *
 * All authenticated users can check conflicts.
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
import type { Database } from "@/lib/types/database";

type SectionRow = Database["public"]["Tables"]["section"]["Row"];

// Type for Supabase join result
interface ScheduleEntryWithSection {
  section_id: string;
  section: SectionRow | null;
}

interface SectionToCheck {
  section_id: string;
  room_code: string | null;
  instructor_id: string | null;
  meeting_days: string[];
  meeting_start: string;
  meeting_duration: number;
}

interface BatchConflictCheckRequest {
  sections: SectionToCheck[];
  term_id?: string;
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

interface SectionConflictResult {
  has_conflicts: boolean;
  room_conflicts: ConflictSection[];
  instructor_conflicts: ConflictSection[];
}

interface BatchConflictResponse {
  [sectionId: string]: SectionConflictResult;
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

    const body: BatchConflictCheckRequest = await request.json();
    const { sections: sectionsToCheck, term_id } = body;

    // Validate request
    if (!sectionsToCheck || !Array.isArray(sectionsToCheck)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "sections must be an array"
      );
    }

    if (sectionsToCheck.length === 0) {
      return createSuccessResponse({} as BatchConflictResponse, 200);
    }

    // Limit batch size to prevent abuse
    if (sectionsToCheck.length > 100) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Maximum 100 sections per batch request"
      );
    }

    // Validate each section
    for (const section of sectionsToCheck) {
      if (!section.section_id) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Each section must have a section_id"
        );
      }
      if (
        !section.meeting_days ||
        !Array.isArray(section.meeting_days) ||
        section.meeting_days.length === 0
      ) {
        continue; // Skip sections without meeting days (they won't have conflicts)
      }
      if (section.meeting_start && !isValidTimeFormat(section.meeting_start)) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          `Invalid meeting_start format for section ${section.section_id}. Must be HH:MM format.`
        );
      }
    }

    const supabase = await createClient();

    // Determine term_id
    let activeTermId: string | null = term_id || null;

    if (!activeTermId) {
      // Get current active term
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

    if (!activeTermId) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "No active term found. Please provide term_id in the request body."
      );
    }

    // Get all sections in the term with a single query
    const sectionIdsToExclude = sectionsToCheck.map((s) => s.section_id);

    const { data: scheduleEntries, error } = await supabase
      .from("schedule")
      .select(
        `
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
      `
      )
      .eq("term_id", activeTermId)
      .not("section.meeting_pattern", "is", null);

    if (error) {
      throw error;
    }

    // Extract sections from schedule entries
    const allSections: SectionRow[] = [];
    for (const entry of scheduleEntries || []) {
      const entryTyped = entry as unknown as ScheduleEntryWithSection;
      const section = Array.isArray(entryTyped.section)
        ? entryTyped.section[0]
        : entryTyped.section;

      if (section && typeof section === "object" && "id" in section) {
        // Exclude sections we're checking (don't check against themselves)
        if (!sectionIdsToExclude.includes(section.id)) {
          allSections.push(section as SectionRow);
        }
      }
    }

    // Build conflict map for each section to check
    const results: BatchConflictResponse = {};

    for (const sectionToCheck of sectionsToCheck) {
      const sectionConflicts: SectionConflictResult = {
        has_conflicts: false,
        room_conflicts: [],
        instructor_conflicts: [],
      };

      // Skip if no valid meeting pattern
      if (
        !sectionToCheck.meeting_days ||
        !sectionToCheck.meeting_start ||
        !sectionToCheck.meeting_duration
      ) {
        results[sectionToCheck.section_id] = sectionConflicts;
        continue;
      }

      // Check against all other sections
      for (const otherSection of allSections) {
        // Also exclude the current section being checked
        if (otherSection.id === sectionToCheck.section_id) {
          continue;
        }

        const pattern = otherSection.meeting_pattern as {
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
          !pattern.duration ||
          !isValidTimeFormat(pattern.start)
        ) {
          continue;
        }

        // Check if time slots overlap
        const overlaps = doTimeSlotsOverlap(
          sectionToCheck.meeting_days,
          sectionToCheck.meeting_start,
          sectionToCheck.meeting_duration,
          pattern.days,
          pattern.start,
          pattern.duration
        );

        if (!overlaps) {
          continue;
        }

        const conflictSection: ConflictSection = {
          section_id: otherSection.id,
          course_code: otherSection.course_code,
          section_no: otherSection.section_no,
          room_code: otherSection.room_code,
          instructor_id: otherSection.instructor_id,
          group_level: otherSection.group_level,
          meeting_pattern: {
            days: pattern.days,
            start: pattern.start,
            duration: pattern.duration,
          },
        };

        // Check room conflict
        if (
          sectionToCheck.room_code &&
          otherSection.room_code === sectionToCheck.room_code
        ) {
          sectionConflicts.room_conflicts.push(conflictSection);
          sectionConflicts.has_conflicts = true;
        }

        // Check instructor conflict
        if (
          sectionToCheck.instructor_id &&
          otherSection.instructor_id === sectionToCheck.instructor_id
        ) {
          sectionConflicts.instructor_conflicts.push(conflictSection);
          sectionConflicts.has_conflicts = true;
        }
      }

      results[sectionToCheck.section_id] = sectionConflicts;
    }

    return createSuccessResponse(results, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
