// GET /api/sections/[id] - Get a specific section
// PUT /api/sections/[id] - Update a section
// DELETE /api/sections/[id] - Delete a section

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;

    // Find the section by searching through all courses
    const allCourses = courseOfferingService.findAll();

    for (const course of allCourses) {
      const section = course.sections?.find((s) => s.id === sectionId);
      if (section) {
        return NextResponse.json({
          ...section,
          courseName: course.name,
          courseCode: course.code,
        });
      }
    }

    return NextResponse.json(
      { error: `Section ${sectionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;
    const updates = await request.json();

    console.log("Updating section:", sectionId, updates);

    // Find the course containing this section
    const allCourses = courseOfferingService.findAll();

    for (const course of allCourses) {
      const sectionIndex = course.sections?.findIndex(
        (s) => s.id === sectionId
      );

      if (sectionIndex !== undefined && sectionIndex >= 0) {
        // Update the section
        const updatedSections = [...(course.sections || [])];
        updatedSections[sectionIndex] = {
          ...updatedSections[sectionIndex],
          ...updates,
          id: sectionId, // Prevent ID from being changed
        };

        // Update the course
        const updatedCourse = courseOfferingService.update(course.code, {
          sections: updatedSections,
        });

        if (updatedCourse) {
          return NextResponse.json(updatedSections[sectionIndex]);
        }
      }
    }

    return NextResponse.json(
      { error: `Section ${sectionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;

    console.log("Deleting section:", sectionId);

    // Find the course containing this section
    const allCourses = courseOfferingService.findAll();

    for (const course of allCourses) {
      const sectionIndex = course.sections?.findIndex(
        (s) => s.id === sectionId
      );

      if (sectionIndex !== undefined && sectionIndex >= 0) {
        // Remove the section
        const updatedSections = [...(course.sections || [])];
        updatedSections.splice(sectionIndex, 1);

        // Update the course
        const updatedCourse = courseOfferingService.update(course.code, {
          sections: updatedSections,
        });

        if (updatedCourse) {
          return NextResponse.json({ success: true, deletedId: sectionId });
        }
      }
    }

    return NextResponse.json(
      { error: `Section ${sectionId} not found` },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
