/**
 * API Routes for Academic Semesters
 * 
 * REFACTORED: New endpoint for semester management
 * GET /api/semesters - List all semesters
 * POST /api/semesters - Create new semester (scheduling only)
 */
import { NextResponse, NextRequest } from "next/server";
import { getSemesters, createSemester, getCurrentSemester } from "@/lib/db/semesters";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current');
    
    // If current=true, return only current semester
    if (current === 'true') {
      const semester = await getCurrentSemester();
      if (!semester) {
        return NextResponse.json(
          { error: "No current semester found" },
          { status: 404 }
        );
      }
      return NextResponse.json(semester);
    }
    
    // Otherwise, return all semesters
    const semesters = await getSemesters();
    return NextResponse.json(semesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return NextResponse.json(
      { error: "Failed to fetch semesters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.code || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Missing required fields: name, code, start_date, end_date" },
        { status: 400 }
      );
    }
    
    const semester = await createSemester(body);
    return NextResponse.json(semester, { status: 201 });
  } catch (error) {
    console.error("Error creating semester:", error);
    return NextResponse.json(
      { error: "Failed to create semester" },
      { status: 500 }
    );
  }
}


