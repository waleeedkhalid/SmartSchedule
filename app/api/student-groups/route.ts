import { NextResponse } from "next/server";
import { getStudentGroups, createStudentGroup } from "@/lib/db/student-groups";

export async function GET() {
  try {
    const groups = await getStudentGroups();
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching student groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch student groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const group = await createStudentGroup(body);
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating student group:", error);
    return NextResponse.json(
      { error: "Failed to create student group" },
      { status: 500 }
    );
  }
}

