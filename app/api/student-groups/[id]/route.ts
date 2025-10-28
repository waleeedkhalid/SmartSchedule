import { NextResponse } from "next/server";
import { getStudentGroupById, updateStudentGroup, deleteStudentGroup } from "@/lib/db/student-groups";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const group = await getStudentGroupById(id);
    return NextResponse.json(group);
  } catch (error) {
    console.error("Error fetching student group:", error);
    return NextResponse.json(
      { error: "Student group not found" },
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
    const group = await updateStudentGroup(id, body);
    return NextResponse.json(group);
  } catch (error) {
    console.error("Error updating student group:", error);
    return NextResponse.json(
      { error: "Failed to update student group" },
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
    await deleteStudentGroup(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student group:", error);
    return NextResponse.json(
      { error: "Failed to delete student group" },
      { status: 500 }
    );
  }
}

