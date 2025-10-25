/**
 * Scheduler Schedule Generation API
 * Generate course sections and schedules using the ScheduleGenerator
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";
import { ScheduleGenerator } from "@/lib/schedule/ScheduleGenerator";

/**
 * POST /api/committee/scheduler/schedule/generate
 * Generate course sections for specified levels
 * Body: { term_code: string, target_levels: number[] }
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

  const startTime = Date.now();

  try {
    const body = await request.json() as { term_code: string; target_levels?: number[] };
    const { term_code, target_levels = [4, 5, 6, 7, 8] } = body;

    // Validate required fields
    if (!term_code) {
      return validationErrorResponse({ message: "term_code is required" });
    }

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("*")
      .eq("code", term_code)
      .maybeSingle();

    if (termError || !term) {
      return errorResponse("Academic term not found", 404);
    }

    // Use the ScheduleGenerator to generate sections
    const generator = new ScheduleGenerator();
    const result = await generator.generate({
      term_code,
      target_levels,
    });

    const executionTime = Date.now() - startTime;

    if (!result.success) {
      return errorResponse(result.message, 400);
    }

    return successResponse(
      {
        ...result.data,
        execution_time_ms: executionTime,
      },
      result.message
    );
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/schedule/generate:", error);
    return errorResponse(
      error instanceof Error ? error.message : "Internal server error"
    );
  }
}

