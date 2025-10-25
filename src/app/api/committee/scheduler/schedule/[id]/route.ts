/**
 * Scheduler Schedule by ID API
 * View and update specific schedules
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
 * GET /api/committee/scheduler/schedule/[id]
 * Get a specific schedule with conflicts
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    // Get schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select(`
        *,
        student:users!schedules_student_id_fkey(id, full_name, email),
        term:academic_term(code, name, type, start_date, end_date)
      `)
      .eq("id", id)
      .single();

    if (scheduleError || !schedule) {
      return errorResponse("Schedule not found", 404);
    }

    // Get conflicts for this schedule
    const { data: conflicts, error: conflictsError } = await supabase
      .from("schedule_conflicts")
      .select("*")
      .eq("schedule_id", id)
      .order("severity", { ascending: true });

    if (conflictsError) {
      console.error("Error fetching conflicts:", conflictsError);
    }

    return successResponse({
      schedule,
      conflicts: conflicts || [],
      conflict_count: {
        total: conflicts?.length || 0,
        critical: conflicts?.filter((c) => c.severity === "critical").length || 0,
        error: conflicts?.filter((c) => c.severity === "error").length || 0,
        warning: conflicts?.filter((c) => c.severity === "warning").length || 0,
        info: conflicts?.filter((c) => c.severity === "info").length || 0,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/committee/scheduler/schedule/[id]:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * PATCH /api/committee/scheduler/schedule/[id]
 * Update a specific schedule
 * Body: {
 *   data?: ScheduleData;
 *   is_published?: boolean;
 *   version?: number;
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    const body = await request.json();
    const { data: scheduleData, is_published, version } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (scheduleData !== undefined) updateData.data = scheduleData;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (version !== undefined) updateData.version = version;

    if (Object.keys(updateData).length === 0) {
      return validationErrorResponse({ message: "No fields to update" });
    }

    // Update schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        student:users!schedules_student_id_fkey(id, full_name, email),
        term:academic_term(code, name, type, start_date, end_date)
      `)
      .single();

    if (scheduleError) {
      return errorResponse(scheduleError.message);
    }

    // Get conflicts for this schedule
    const { data: conflicts } = await supabase
      .from("schedule_conflicts")
      .select("*")
      .eq("schedule_id", id)
      .order("severity", { ascending: true });

    return successResponse(
      {
        schedule,
        conflicts: conflicts || [],
      },
      "Schedule updated successfully"
    );
  } catch (error) {
    console.error("Error in PATCH /api/committee/scheduler/schedule/[id]:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * DELETE /api/committee/scheduler/schedule/[id]
 * Delete a specific schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    // Check if schedule is published
    const { data: schedule, error: fetchError } = await supabase
      .from("schedules")
      .select("is_published")
      .eq("id", id)
      .single();

    if (fetchError || !schedule) {
      return errorResponse("Schedule not found", 404);
    }

    if (schedule.is_published) {
      return errorResponse(
        "Cannot delete published schedule. Unpublish it first.",
        400
      );
    }

    // Delete schedule (cascades to conflicts)
    const { error: deleteError } = await supabase
      .from("schedules")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return errorResponse(deleteError.message);
    }

    return successResponse({ schedule_id: id }, "Schedule deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/committee/scheduler/schedule/[id]:", error);
    return errorResponse("Internal server error");
  }
}

