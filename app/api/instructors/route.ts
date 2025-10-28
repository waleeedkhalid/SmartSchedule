import { NextResponse } from "next/server";
import { getInstructors, createInstructor } from "@/lib/db/instructors";

export async function GET() {
  try {
    const instructors = await getInstructors();
    return NextResponse.json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: "Failed to fetch instructors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const instructor = await createInstructor(body);
    return NextResponse.json(instructor, { status: 201 });
  } catch (error) {
    console.error("Error creating instructor:", error);
    return NextResponse.json(
      { error: "Failed to create instructor" },
      { status: 500 }
    );
  }
}

