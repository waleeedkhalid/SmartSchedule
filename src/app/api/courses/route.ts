// GET /api/courses - Get all courses
// Query params: ?type=ELECTIVE|REQUIRED, ?level=200|300|400

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const level = searchParams.get("level");

    let courses = courseOfferingService.findAll();

    // Filter by type
    if (type && (type === "ELECTIVE" || type === "REQUIRED")) {
      courses = courseOfferingService.findByType(
        type as "ELECTIVE" | "REQUIRED"
      );
    }

    // Filter by level
    if (level) {
      const levelNum = parseInt(level);
      courses = courses.filter((c) => c.level === levelNum);
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Creating course:", body);

    const newCourse = courseOfferingService.create(body);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
