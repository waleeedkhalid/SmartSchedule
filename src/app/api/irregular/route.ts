// GET /api/irregular - Get irregular students
// POST /api/irregular - Create irregular student

import { NextResponse } from "next/server";
import { irregularStudentService, courseService } from "@/lib/data-store";

// Mock registrar user ID
const MOCK_REGISTRAR_ID = "registrar-1";

export async function GET() {
  try {
    const students = irregularStudentService.findAll();

    // Enrich with course data
    const enrichedStudents = students.map((student) => ({
      ...student,
      remainingCoursesDetails: student.remainingCourses
        .map((courseId) => courseService.findById(courseId))
        .filter(Boolean),
    }));

    return NextResponse.json(enrichedStudents);
  } catch (error) {
    console.error("Error fetching irregular students:", error);
    return NextResponse.json(
      { error: "Failed to fetch irregular students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentName, studentEmail, remainingCourses, notes } = body;

    // Validation
    if (
      !studentName ||
      !Array.isArray(remainingCourses) ||
      remainingCourses.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields: studentName, remainingCourses" },
        { status: 400 }
      );
    }

    // Validate all courses exist
    for (const courseId of remainingCourses) {
      const course = courseService.findById(courseId);
      if (!course) {
        return NextResponse.json(
          { error: `Course not found: ${courseId}` },
          { status: 404 }
        );
      }
    }

    // Create irregular student
    const newStudent = irregularStudentService.create({
      registrarUserId: MOCK_REGISTRAR_ID,
      studentName,
      studentEmail,
      remainingCourses,
      notes,
    });

    console.log("Irregular student created:", newStudent);

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating irregular student:", error);
    return NextResponse.json(
      { error: "Failed to create irregular student" },
      { status: 500 }
    );
  }
}
