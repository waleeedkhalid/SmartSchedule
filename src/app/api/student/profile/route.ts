// GET /api/student/profile - Fetch student profile data
// PRD: Student Profile API

import { NextRequest, NextResponse } from "next/server";
import { getStudentProfile, getStudentByEmail } from "@/lib/supabase-admin";

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

    // Try to get student by email (userId is email in most cases)
    let student;
    try {
      student = await getStudentByEmail(userId);
    } catch {
      // If not found by email, try by user_id (UUID)
      try {
        student = await getStudentProfile(userId);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Student profile not found. Please ensure your profile is set up in the system.",
            details: "No student record found for this user.",
          },
          { status: 404 }
        );
      }
    }

    // Format the response
    const studentData = {
      userId: student.user_id,
      studentId: student.student_id,
      name: student.name,
      email: student.email,
      level: student.level,
      major: student.major,
      gpa: parseFloat(student.gpa) || 0,
      completedCredits: student.completed_credits,
      totalCredits: student.total_credits,
      completedCourses: student.completed_courses || [],
    };

    return NextResponse.json({
      success: true,
      student: studentData,
    });
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
