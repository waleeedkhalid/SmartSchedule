/**
 * API Route for Closing Survey
 * 
 * REFACTORED: New endpoint
 * POST /api/survey-periods/[id]/close - Close survey (scheduling only)
 * Calls close_survey(survey_period_id) database function
 */
import { NextResponse } from "next/server";
import { closeSurvey } from "@/lib/db/survey-periods";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const survey = await closeSurvey(id);
    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error closing survey:", error);
    return NextResponse.json(
      { error: "Failed to close survey" },
      { status: 500 }
    );
  }
}


