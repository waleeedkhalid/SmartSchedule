/**
 * API Route for Archiving Semester
 * 
 * REFACTORED: New endpoint
 * POST /api/semesters/[id]/archive - Archive semester (scheduling/registrar only)
 * Calls archive_semester(semester_id) database function
 */
import { NextResponse } from "next/server";
import { archiveSemester } from "@/lib/db/semesters";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const semester = await archiveSemester(id);
    return NextResponse.json(semester);
  } catch (error) {
    console.error("Error archiving semester:", error);
    return NextResponse.json(
      { error: "Failed to archive semester" },
      { status: 500 }
    );
  }
}


