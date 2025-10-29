/**
 * API Route for Opening Survey
 * 
 * REFACTORED: New endpoint
 * POST /api/survey-periods/[id]/open - Open survey (scheduling only)
 * Calls open_survey(survey_period_id) database function
 */
import { NextResponse } from "next/server";
import { openSurvey } from "@/lib/db/survey-periods";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const survey = await openSurvey(id);
    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error opening survey:", error);
    return NextResponse.json(
      { error: "Failed to open survey" },
      { status: 500 }
    );
  }
}

