import { NextResponse } from "next/server";
import { getCourseByCode, updateCourse, deleteCourse } from "@/lib/db/courses";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    const course = await getCourseByCode(code);
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const course = await updateCourse(code, body);
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    await deleteCourse(code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

