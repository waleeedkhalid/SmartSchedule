/**
 * Scheduler Feedback Settings API
 * Allows scheduler committee to control when feedback is open
 */

import { NextRequest } from "next/server";
import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api";

export async function GET() {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduler committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  // Get active term settings
  const { data: activeTerm, error } = await supabase
    .from("academic_term")
    .select("code, name, feedback_open, schedule_published, electives_survey_open")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return errorResponse(error.message);
  }

  if (!activeTerm) {
    return errorResponse("No active academic term found");
  }

  return successResponse(activeTerm);
}

export async function PATCH(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduler committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  const body = await request.json();
  const { feedback_open, schedule_published } = body;

  if (typeof feedback_open !== "boolean" && typeof schedule_published !== "boolean") {
    return errorResponse("Invalid request: Must specify feedback_open or schedule_published");
  }

  // Get active term
  const { data: activeTerm, error: termError } = await supabase
    .from("academic_term")
    .select("code")
    .eq("is_active", true)
    .maybeSingle();

  if (termError) {
    return errorResponse(termError.message);
  }

  if (!activeTerm) {
    return errorResponse("No active academic term found");
  }

  // Update settings
  const updateData: Record<string, boolean> = {};
  if (typeof feedback_open === "boolean") {
    updateData.feedback_open = feedback_open;
  }
  if (typeof schedule_published === "boolean") {
    updateData.schedule_published = schedule_published;
  }

  const { data, error } = await supabase
    .from("academic_term")
    .update(updateData)
    .eq("code", activeTerm.code)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse(data);
}

