// GET /api/student/profile - Fetch student profile data
// PRD: Student Profile API (Updated for new student profile system)

import { NextRequest, NextResponse } from "next/server";
import { getStudentProfile, getStudentByEmail } from "@/lib/supabase-admin";
import type { DBStudentWithProfile } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Try to get student by email; fallback to user_id UUID
    const byEmail = await getStudentByEmail(userId).catch(() => null);
    const studentData = byEmail ?? (await getStudentProfile(userId).catch(() => null));
    
    if (!studentData) {
      return NextResponse.json(
        {
          success: false,
          error: "Student profile not found. Please ensure your profile is set up in the system.",
          details: "No student record found for this user.",
        },
        { status: 404 }
      );
    }

    // Transform the data to match expected API response format
    // Use type assertion to handle the complex union type from Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studentDataTyped = studentData as any;
    const student: DBStudentWithProfile = {
      user_id: studentDataTyped.user_id || studentDataTyped.id || '',
      name: studentDataTyped.name || '',
      email: studentDataTyped.email || '',
      role: studentDataTyped.role || '',
      user_created_at: studentDataTyped.user_created_at || studentDataTyped.created_at || '',
      profile_id: studentDataTyped.profile_id,
      student_number: studentDataTyped.student_number,
      level: studentDataTyped.level,
      major: studentDataTyped.major,
      gpa: studentDataTyped.gpa,
      completed_credits: studentDataTyped.completed_credits,
      total_credits: studentDataTyped.total_credits,
      academic_status: studentDataTyped.academic_status,
      enrollment_date: studentDataTyped.enrollment_date,
      expected_graduation_date: studentDataTyped.expected_graduation_date,
      advisor_id: studentDataTyped.advisor_id,
      profile_created_at: studentDataTyped.profile_created_at,
      profile_updated_at: studentDataTyped.profile_updated_at,
    };

    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch student profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
