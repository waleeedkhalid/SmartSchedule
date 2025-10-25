/**
 * Scheduler Conflicts API
 * Detect and manage schedule conflicts
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";
import type { ScheduleConflict } from "@/types";

/**
 * GET /api/committee/scheduler/conflicts
 * Get conflicts for schedules or sections
 * Query params:
 * - term_code: string (optional)
 * - schedule_id: string (optional)
 * - section_id: string (optional)
 * - severity: 'critical' | 'error' | 'warning' | 'info' (optional)
 * - resolved: boolean (optional)
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
  const scheduleId = searchParams.get("schedule_id");
  const sectionId = searchParams.get("section_id");
  const severity = searchParams.get("severity");
  const resolvedParam = searchParams.get("resolved");

  try {
    let query = supabase
      .from("schedule_conflicts")
      .select(`
        *,
        schedule:schedules(id, student_id, term_code),
        resolver:users!schedule_conflicts_resolved_by_fkey(id, full_name)
      `)
      .order("created_at", { ascending: false });

    if (scheduleId) {
      query = query.eq("schedule_id", scheduleId);
    }

    if (severity) {
      query = query.eq("severity", severity);
    }

    if (resolvedParam !== null) {
      query = query.eq("resolved", resolvedParam === "true");
    }

    const { data: conflicts, error: conflictsError } = await query;

    if (conflictsError) {
      return errorResponse(conflictsError.message);
    }

    // Filter by term_code if provided (from schedule relationship)
    let filteredConflicts = conflicts;
    if (termCode) {
      filteredConflicts = conflicts.filter(
        (c) => c.schedule && (c.schedule as {term_code?: string}).term_code === termCode
      );
    }

    // Filter by section_id if provided (check affected_entities)
    if (sectionId) {
      filteredConflicts = filteredConflicts.filter((c) => {
        const entities = c.affected_entities as Array<{type: string; id: string}>;
        return entities.some((e) => e.type === "section" && e.id === sectionId);
      });
    }

    // Get section conflicts for a specific section
    if (sectionId && !scheduleId) {
      const { data: sectionConflicts } = await supabase.rpc(
        "detect_section_time_conflicts",
        { p_section_id: sectionId }
      );

      // Convert to conflict format
      const formattedSectionConflicts = (sectionConflicts || []).map((c) => ({
        type: c.conflict_type === "ROOM_CONFLICT" ? "room_conflict" : "faculty_conflict",
        severity: "error" as const,
        title: `${c.conflict_type === "ROOM_CONFLICT" ? "Room" : "Faculty"} Conflict`,
        description: `Conflict with section ${c.conflicting_section_id} on ${c.conflict_day} from ${c.conflict_start_time} to ${c.conflict_end_time}`,
        affected_entities: [
          { type: "section", id: sectionId },
          { type: "section", id: c.conflicting_section_id },
        ],
        resolution_suggestions: [
          "Change time slot",
          "Change room",
          "Assign different instructor",
        ],
        auto_resolvable: false,
        detected_at: new Date().toISOString(),
      }));

      return successResponse({
        conflicts: [...filteredConflicts, ...formattedSectionConflicts],
        count: filteredConflicts.length + formattedSectionConflicts.length,
      });
    }

    return successResponse({
      conflicts: filteredConflicts,
      count: filteredConflicts.length,
    });
  } catch (error) {
    console.error("Error in GET /api/committee/scheduler/conflicts:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * POST /api/committee/scheduler/conflicts
 * Create a new conflict record
 * Body: Omit<ScheduleConflict, 'id' | 'detected_at'>
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
    const body = await request.json() as Partial<ScheduleConflict>;
    const {
      schedule_id,
      conflict_type,
      severity,
      title,
      description,
      affected_entities,
      resolution_suggestions = [],
      auto_resolvable = false,
    } = body;

    // Validate required fields
    if (
      !conflict_type ||
      !severity ||
      !title ||
      !description ||
      !affected_entities
    ) {
      return validationErrorResponse({
        message:
          "Missing required fields: conflict_type, severity, title, description, affected_entities",
      });
    }

    // Create conflict
    const { data: conflict, error: conflictError } = await supabase
      .from("schedule_conflicts")
      .insert({
        schedule_id,
        conflict_type,
        severity,
        title,
        description,
        affected_entities,
        resolution_suggestions,
        auto_resolvable,
      })
      .select(`
        *,
        schedule:schedules(id, student_id, term_code),
        resolver:users!schedule_conflicts_resolved_by_fkey(id, full_name)
      `)
      .single();

    if (conflictError) {
      return errorResponse(conflictError.message);
    }

    return successResponse(conflict, "Conflict created successfully");
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/conflicts:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * PATCH /api/committee/scheduler/conflicts
 * Resolve a conflict
 * Body: {
 *   conflict_id: string;
 *   resolved: boolean;
 *   resolution_notes?: string;
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
    const { conflict_id, resolved } = body;

    if (!conflict_id) {
      return validationErrorResponse({ message: "conflict_id is required" });
    }

    if (typeof resolved !== "boolean") {
      return validationErrorResponse({ message: "resolved must be a boolean" });
    }

    // Update conflict
    const updateData: Record<string, unknown> = {
      resolved,
    };

    if (resolved) {
      updateData.resolved_by = user.id;
      updateData.resolved_at = new Date().toISOString();
    } else {
      updateData.resolved_by = null;
      updateData.resolved_at = null;
    }

    const { data: conflict, error: conflictError } = await supabase
      .from("schedule_conflicts")
      .update(updateData)
      .eq("id", conflict_id)
      .select(`
        *,
        schedule:schedules(id, student_id, term_code),
        resolver:users!schedule_conflicts_resolved_by_fkey(id, full_name)
      `)
      .single();

    if (conflictError) {
      return errorResponse(conflictError.message);
    }

    return successResponse(
      conflict,
      resolved ? "Conflict marked as resolved" : "Conflict marked as unresolved"
    );
  } catch (error) {
    console.error("Error in PATCH /api/committee/scheduler/conflicts:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * DELETE /api/committee/scheduler/conflicts
 * Delete a conflict record
 * Query params:
 * - conflict_id: string (required)
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
  const conflictId = searchParams.get("conflict_id");

  if (!conflictId) {
    return validationErrorResponse({ message: "conflict_id is required" });
  }

  try {
    const { error: deleteError } = await supabase
      .from("schedule_conflicts")
      .delete()
      .eq("id", conflictId);

    if (deleteError) {
      return errorResponse(deleteError.message);
    }

    return successResponse({ conflict_id: conflictId }, "Conflict deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/committee/scheduler/conflicts:", error);
    return errorResponse("Internal server error");
  }
}

