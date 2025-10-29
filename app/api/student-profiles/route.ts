/**
 * API Routes for Student Profiles
 * 
 * REFACTORED: New endpoint for student profile management
 * GET /api/student-profiles - List student profiles (scheduling/registrar)
 * POST /api/student-profiles - Create student profile (scheduling/registrar)
 */
import { NextResponse } from "next/server";
import { getStudentProfiles, createStudentProfile, getAllStudentsWithProfiles } from "@/lib/db/student-profiles";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withUser = searchParams.get('with_user');
    
    // If with_user=true, return profiles with user data
    if (withUser === 'true') {
      const students = await getAllStudentsWithProfiles();
      return NextResponse.json(students);
    }
    
    // Otherwise, return just profiles
    const profiles = await getStudentProfiles();
    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching student profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch student profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.student_id || !body.current_level || !body.enrollment_year || !body.expected_graduation_year) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, student_id, current_level, enrollment_year, expected_graduation_year" },
        { status: 400 }
      );
    }
    
    const profile = await createStudentProfile(body);
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating student profile:", error);
    return NextResponse.json(
      { error: "Failed to create student profile" },
      { status: 500 }
    );
  }
}

