/**
 * Feedback API Route
 * GET: Fetch student's feedback submissions
 * POST: Submit new feedback
 */

import { NextRequest } from "next/server";
import { 
  getAuthenticatedUser, 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  validationErrorResponse,
  feedbackSchema 
} from "@/lib/api";
import type { Feedback } from "@/types";

export async function GET() {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const { data: feedbacks, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse({ feedbacks: (feedbacks || []) as Feedback[] });
}

export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const validated = feedbackSchema.safeParse(body);

  if (!validated.success) {
    return validationErrorResponse(validated.error);
  }

  // Backend validation: Check if student has a schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedules")
    .select("id")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (scheduleError) {
    return errorResponse("Failed to verify schedule status");
  }

  if (!schedule) {
    return errorResponse("Cannot submit feedback without an assigned schedule", 403);
  }

  // Backend validation: Check if feedback is open
  const { data: activeTerm, error: termError } = await supabase
    .from("academic_term")
    .select("feedback_open")
    .eq("is_active", true)
    .maybeSingle();

  if (termError) {
    return errorResponse("Failed to verify feedback availability");
  }

  if (!activeTerm?.feedback_open) {
    return errorResponse("Feedback submission is currently closed", 403);
  }

  // Backend validation: Check if student has already submitted feedback for this schedule
  const { data: existingFeedback, error: existingError } = await supabase
    .from("feedback")
    .select("id")
    .eq("student_id", user.id)
    .eq("schedule_id", schedule.id)
    .maybeSingle();

  if (existingError) {
    return errorResponse("Failed to check existing feedback");
  }

  if (existingFeedback) {
    return errorResponse("You have already submitted feedback for this schedule", 409);
  }

  // All validations passed - insert feedback
  const { data, error } = await supabase
    .from("feedback")
    .insert({
      student_id: user.id,
      schedule_id: validated.data.scheduleId || schedule.id,
      feedback_text: validated.data.feedbackText,
      rating: validated.data.rating,
    })
    .select()
    .single();

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse({ feedback: data as Feedback });
}
