/**
 * API Routes for Individual Student Profile
 * 
 * REFACTORED: New endpoint
 * GET /api/student-profiles/[id] - Get student profile
 * PATCH /api/student-profiles/[id] - Update student profile
 */
import { NextResponse } from "next/server";
import { getStudentProfile, updateStudentProfile, getStudentWithProfile } from "@/lib/db/student-profiles";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params; // id is user_id
    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get('with_user');
    
    // If with_user=true, return profile with user data
    if (withUser === 'true') {
      const student = await getStudentWithProfile(id);
      if (!student) {
        return NextResponse.json(
          { error: "Student profile not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(student);
    }
    
    // Otherwise, return just profile
    const profile = await getStudentProfile(id);
    
    if (!profile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params; // id is user_id
    const body = await request.json();
    
    const profile = await updateStudentProfile(id, body);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json(
      { error: "Failed to update student profile" },
      { status: 500 }
    );
  }
}

