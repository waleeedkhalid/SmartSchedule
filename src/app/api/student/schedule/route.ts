/**
 * Schedule API Route
 * GET: Fetch student's latest schedule
 */

import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api";
import type { Schedule } from "@/types";

export async function GET() {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const { data: schedule, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse({ schedule: schedule as Schedule | null });
}
