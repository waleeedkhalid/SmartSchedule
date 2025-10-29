/**
 * API Routes for Individual Academic Semester
 * 
 * REFACTORED: New endpoint for semester management
 * GET /api/semesters/[id] - Get semester details
 * PATCH /api/semesters/[id] - Update semester (scheduling only)
 * DELETE /api/semesters/[id] - Delete semester (scheduling only)
 */
import { NextResponse } from "next/server";
import { getSemester, updateSemester, deleteSemester } from "@/lib/db/semesters";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const semester = await getSemester(id);
    
    if (!semester) {
      return NextResponse.json(
        { error: "Semester not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(semester);
  } catch (error) {
    console.error("Error fetching semester:", error);
    return NextResponse.json(
      { error: "Failed to fetch semester" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const semester = await updateSemester(id, body);
    return NextResponse.json(semester);
  } catch (error) {
    console.error("Error updating semester:", error);
    return NextResponse.json(
      { error: "Failed to update semester" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteSemester(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting semester:", error);
    return NextResponse.json(
      { error: "Failed to delete semester" },
      { status: 500 }
    );
  }
}

