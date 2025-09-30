// GET /api/exams - Get all exams (flattened from course offerings)
// POST /api/exams - Update exam for a course
// Used by: Committee exam scheduler

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";
import { checkAllConflicts } from "@/lib/rules-engine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get("course");

    const allCourses = courseOfferingService.findAll();

    // Flatten all exams from all courses
    const allExams: any[] = [];

    for (const course of allCourses) {
      if (course.exams) {
        if (course.exams.midterm) {
          allExams.push({
            courseCode: course.code,
            courseName: course.name,
            type: "midterm",
            ...course.exams.midterm,
          });
        }
        if (course.exams.midterm2) {
          allExams.push({
            courseCode: course.code,
            courseName: course.name,
            type: "midterm2",
            ...course.exams.midterm2,
          });
        }
        if (course.exams.final) {
          allExams.push({
            courseCode: course.code,
            courseName: course.name,
            type: "final",
            ...course.exams.final,
          });
        }
      }
    }

    // Filter by course if specified
    if (courseCode) {
      const filtered = allExams.filter((e) => e.courseCode === courseCode);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(allExams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseCode, examType, examData } = body;

    console.log("Updating exam:", { courseCode, examType, examData });

    // Validation
    if (!courseCode || !examType || !examData) {
      return NextResponse.json(
        { error: "Missing required fields: courseCode, examType, examData" },
        { status: 400 }
      );
    }

    if (!["midterm", "midterm2", "final"].includes(examType)) {
      return NextResponse.json(
        { error: "examType must be one of: midterm, midterm2, final" },
        { status: 400 }
      );
    }

    // Find the course
    const course = courseOfferingService.findByCode(courseCode);
    if (!course) {
      return NextResponse.json(
        { error: `Course ${courseCode} not found` },
        { status: 404 }
      );
    }

    // Update the exam
    const updatedExams = {
      ...course.exams,
      [examType]: examData,
    };

    const updatedCourse = courseOfferingService.update(courseCode, {
      exams: updatedExams,
    });

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 }
      );
    }

    // Check for conflicts after update
    const conflictCheck = checkAllConflicts();

    return NextResponse.json(
      {
        exam: examData,
        conflicts: conflictCheck.conflicts.filter((c) =>
          c.message.includes(courseCode)
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
      { status: 500 }
    );
  }
}
