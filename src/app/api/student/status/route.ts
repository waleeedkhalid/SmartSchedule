/**
 * Student Status API Route
 * GET: Check if student has a schedule and if feedback/electives are open
 * Uses timeline-based checks for dynamic feature gating
 */

import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from "@/lib/api";

export async function GET() {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  try {
    // Check if student has a schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("schedules")
      .select("id, created_at")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (scheduleError) {
      return errorResponse(scheduleError.message);
    }

    // Get active academic term
    const { data: activeTerm, error: termError } = await supabase
      .from("academic_term")
      .select("code, name, schedule_published")
      .eq("is_active", true)
      .maybeSingle();

    if (termError) {
      return errorResponse(termError.message);
    }

    // Timeline-based feature gates: Check for active events
    const now = new Date().toISOString();
    
    // Check if feedback period is active
    const { data: feedbackEvents } = await supabase
      .from("term_events")
      .select("id, title, start_date, end_date")
      .eq("event_type", "feedback_period")
      .lte("start_date", now)
      .gte("end_date", now)
      .maybeSingle();

    // Check if elective survey is active
    const { data: electiveEvents } = await supabase
      .from("term_events")
      .select("id, title, start_date, end_date")
      .eq("event_type", "elective_survey")
      .lte("start_date", now)
      .gte("end_date", now)
      .maybeSingle();

    // Timeline-based feature gating
    const feedbackOpen = !!feedbackEvents;
    const electiveSurveyOpen = !!electiveEvents;

    // Check if student has submitted elective preferences
    const { data: preferences, error: prefError } = await supabase
      .from("elective_preference")
      .select("id, status")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (prefError) {
      return errorResponse(prefError.message);
    }

    // Check if student has already submitted feedback for current schedule
    let hasSubmittedFeedback = false;
    if (schedule?.id) {
      const { data: existingFeedback } = await supabase
        .from("feedback")
        .select("id")
        .eq("student_id", user.id)
        .eq("schedule_id", schedule.id)
        .maybeSingle();

      hasSubmittedFeedback = !!existingFeedback;
    }

    // Determine feature availability based on timeline and state
    const canSubmitFeedback = !!schedule && feedbackOpen && !hasSubmittedFeedback;
    const canSubmitElectives = electiveSurveyOpen && (preferences?.[0]?.status !== "SUBMITTED");
    const hasSubmittedPreferences = preferences?.[0]?.status === "SUBMITTED";

    return successResponse({
      // Schedule status
      hasSchedule: !!schedule,
      scheduleId: schedule?.id || null,
      schedulePublished: activeTerm?.schedule_published || false,
      
      // Feedback status (timeline-based)
      feedbackOpen,
      canSubmitFeedback,
      hasSubmittedFeedback,
      feedbackEvent: feedbackEvents ? {
        title: feedbackEvents.title,
        startDate: feedbackEvents.start_date,
        endDate: feedbackEvents.end_date,
      } : null,
      
      // Elective survey status (timeline-based)
      electiveSurveyOpen,
      canSubmitElectives,
      hasSubmittedPreferences,
      electiveEvent: electiveEvents ? {
        title: electiveEvents.title,
        startDate: electiveEvents.start_date,
        endDate: electiveEvents.end_date,
      } : null,
      
      // Term info
      activeTerm: activeTerm?.name || null,
      activeTermCode: activeTerm?.code || null,
    });
  } catch (error) {
    console.error("Error fetching student status:", error);
    return errorResponse("Failed to fetch student status");
  }
}

