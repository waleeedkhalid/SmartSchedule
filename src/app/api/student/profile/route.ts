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

    // Try to get student by email; fallback to user_id UUID
    const byEmail = await getStudentByEmail(userId).catch(() => null);
    const row = byEmail ?? (await getStudentProfile(userId).catch(() => null));
    if (!row) {
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

    return NextResponse.json({ success: true, student: row });
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
