// GET /api/sections - Get all sections (flattened from course offerings)
// POST /api/sections - Add a section to a course
// Used by: Committee schedule grid

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";
import { Section } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseCode = searchParams.get("course");

    const allCourses = courseOfferingService.findAll();

    // Flatten all sections from all courses
    const allSections: Array<
      Section & { courseName: string; courseCode: string }
    > = [];

    for (const course of allCourses) {
      for (const section of course.sections || []) {
        allSections.push({
          ...section,
          courseName: course.name,
          courseCode: course.code,
        });
      }
    }

    // Filter by course if specified
    if (courseCode) {
      const filtered = allSections.filter((s) => s.courseCode === courseCode);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(allSections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseCode, section } = body;

    console.log("Adding section to course:", { courseCode, section });

    // Validation
    if (!courseCode || !section) {
      return NextResponse.json(
        { error: "Missing required fields: courseCode, section" },
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

    // Check if section with same ID already exists
    const existingSection = course.sections?.find((s) => s.id === section.id);
    if (existingSection) {
      return NextResponse.json(
        {
          error: `Section ${section.id} already exists for course ${courseCode}`,
        },
        { status: 409 }
      );
    }

    // Add section to course
    const updatedCourse = courseOfferingService.update(courseCode, {
      sections: [...(course.sections || []), section],
    });

    if (!updatedCourse) {
      return NextResponse.json(
        { error: "Failed to update course" },
        { status: 500 }
      );
    }

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: "Failed to create section" },
      { status: 500 }
    );
  }
}
