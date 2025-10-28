import { NextResponse } from "next/server";
import { getInstructorById, updateInstructor, deleteInstructor } from "@/lib/db/instructors";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const instructor = await getInstructorById(id);
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return NextResponse.json(
      { error: "Instructor not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const instructor = await updateInstructor(id, body);
    return NextResponse.json(instructor);
  } catch (error) {
    console.error("Error updating instructor:", error);
    return NextResponse.json(
      { error: "Failed to update instructor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await deleteInstructor(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting instructor:", error);
    return NextResponse.json(
      { error: "Failed to delete instructor" },
      { status: 500 }
    );
  }
}

