/**
 * API Routes for Individual Survey Period
 * 
 * REFACTORED: New endpoint
 * GET /api/survey-periods/[id] - Get survey details
 * PATCH /api/survey-periods/[id] - Update survey (scheduling only)
 * DELETE /api/survey-periods/[id] - Delete survey (scheduling only)
 */
import { NextResponse } from "next/server";
import { getSurveyPeriod, updateSurveyPeriod, deleteSurveyPeriod } from "@/lib/db/survey-periods";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const survey = await getSurveyPeriod(id);
    
    if (!survey) {
      return NextResponse.json(
        { error: "Survey period not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error fetching survey period:", error);
    return NextResponse.json(
      { error: "Failed to fetch survey period" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const survey = await updateSurveyPeriod(id, body);
    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error updating survey period:", error);
    return NextResponse.json(
      { error: "Failed to update survey period" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteSurveyPeriod(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting survey period:", error);
    return NextResponse.json(
      { error: "Failed to delete survey period" },
      { status: 500 }
    );
  }
}


