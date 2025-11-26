/**
 * Schedule Generation Endpoint
 * 
 * POST /api/v1/schedules/generate - Generate schedule for a term
 * 
 * Only scheduling role can generate schedules.
 * This endpoint creates schedule entries for all draft sections in a term.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { term_id } = body;

    if (!term_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: term_id"
      );
    }

    const supabase = await createClient();

    // Check if term exists
    const { data: term } = await supabase
      .from("academic_term")
      .select("id, code, name")
      .eq("id", term_id)
      .single();

    if (!term) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Academic term with id '${term_id}' not found`
      );
    }

    // Get all draft sections
    const { data: draftSections, error: sectionsError } = await supabase
      .from("section")
      .select("id")
      .eq("state", "draft");

    if (sectionsError) {
      throw sectionsError;
    }

    if (!draftSections || draftSections.length === 0) {
    return createSuccessResponse(
      {
        message: "No draft sections found to schedule",
        stats: {
          total_sections: 0,
          added: 0,
          already_scheduled: 0,
          unassigned: 0,
        },
      },
      200
    );
    }

    // Get sections already in schedule for this term
    const { data: existingSchedules } = await supabase
      .from("schedule")
      .select("section_id")
      .eq("term_id", term_id);

    const existingSectionIds = new Set(
      (existingSchedules || []).map((s: any) => s.section_id)
    );

    // Filter out sections already in schedule
    const sectionsToAdd = draftSections.filter(
      (s) => !existingSectionIds.has(s.id)
    );

    if (sectionsToAdd.length === 0) {
      return createSuccessResponse(
        {
          message: "All draft sections are already in the schedule",
          stats: {
            total_sections: draftSections.length,
            added: 0,
            already_scheduled: draftSections.length,
            unassigned: 0,
          },
        },
        200
      );
    }

    // Add sections to schedule
    const scheduleEntries = sectionsToAdd.map((section) => ({
      term_id,
      section_id: section.id,
    }));

    const { error: insertError } = await supabase
      .from("schedule")
      .insert(scheduleEntries);

    if (insertError) {
      throw insertError;
    }

    // Calculate unassigned sections (sections that couldn't be added)
    // In this implementation, unassigned = 0 because we add all draft sections
    // that aren't already scheduled. In a more sophisticated implementation,
    // this would represent sections that failed validation or had conflicts.
    const unassigned = 0;

    return createSuccessResponse(
      {
        message: `Successfully added ${sectionsToAdd.length} sections to schedule`,
        stats: {
          total_sections: draftSections.length,
          added: sectionsToAdd.length,
          already_scheduled: existingSectionIds.size,
          unassigned: unassigned,
        },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

