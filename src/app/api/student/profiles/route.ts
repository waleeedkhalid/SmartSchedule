// Student Profile Management API
// CRUD operations for student profiles using the new system

import { NextRequest, NextResponse } from "next/server";
import { 
  getAllStudentsWithProfiles, 
  createStudentProfile, 
  updateStudentProfile,
  deleteStudentProfile,
  getStudentsByLevel,
  getStudentsByStatus,
  searchStudents,
  getStudentStatistics
} from "@/lib/supabase/student-profiles";
import type { CreateStudentProfileInput, UpdateStudentProfileInput } from "@/lib/types";

// GET /api/student/profiles - List all students with profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const stats = searchParams.get("stats");

    // Return statistics if requested
    if (stats === "true") {
      const statistics = await getStudentStatistics();
      return NextResponse.json({ success: true, statistics });
    }

    let students;

    if (search) {
      students = await searchStudents(search);
    } else if (level) {
      students = await getStudentsByLevel(parseInt(level));
    } else if (status) {
      students = await getStudentsByStatus(status);
    } else {
      students = await getAllStudentsWithProfiles();
    }

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/student/profiles - Create new student profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profileData: CreateStudentProfileInput = body;

    // Validate required fields
    if (!profileData.user_id || !profileData.student_number) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and student number are required",
        },
        { status: 400 }
      );
    }

    const profileId = await createStudentProfile(profileData);
    
    return NextResponse.json(
      { 
        success: true, 
        profileId,
        message: "Student profile created successfully" 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create student profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/student/profiles - Update student profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updates: UpdateStudentProfileInput = body;

    await updateStudentProfile(userId, updates);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Student profile updated successfully" 
      }
    );
  } catch (error) {
    console.error("Error updating student profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update student profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/student/profiles - Delete student profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    await deleteStudentProfile(userId);
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Student profile deleted successfully" 
      }
    );
  } catch (error) {
    console.error("Error deleting student profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete student profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
