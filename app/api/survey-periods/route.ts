/**
 * API Routes for Survey Periods
 * 
 * REFACTORED: New endpoint for survey period management
 * GET /api/survey-periods?semester_id=xxx - List surveys
 * POST /api/survey-periods - Create survey period (scheduling only)
 */
import { NextResponse, NextRequest } from "next/server";
import { getSurveyPeriods, createSurveyPeriod } from "@/lib/db/survey-periods";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester_id');
    
    const surveys = await getSurveyPeriods(semesterId || undefined);
    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching survey periods:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey periods" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.academic_semester_id || !body.survey_type) {
      return NextResponse.json(
        { error: "Missing required fields: academic_semester_id, survey_type" },
        { status: 400 }
      );
    }
    
    // Validate survey_type
    if (!['elective_survey', 'availability_survey'].includes(body.survey_type)) {
      return NextResponse.json(
        { error: "Invalid survey_type. Must be 'elective_survey' or 'availability_survey'" },
        { status: 400 }
      );
    }
    
    const survey = await createSurveyPeriod(body);
    return NextResponse.json(survey, { status: 201 });
  } catch (error) {
    console.error("Error creating survey period:", error);
    return NextResponse.json(
      { error: "Failed to create survey period" },
      { status: 500 }
    );
  }
}

