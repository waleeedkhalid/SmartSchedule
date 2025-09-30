// PATCH /api/irregular/[id] - Update irregular student
// DELETE /api/irregular/[id] - Delete irregular student

import { NextResponse } from "next/server";
import { irregularStudentService } from "@/lib/data-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const student = irregularStudentService.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: "Irregular student not found" },
        { status: 404 }
      );
    }

    const updatedStudent = irregularStudentService.update(id, body);

    console.log("Irregular student updated:", updatedStudent);

    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error("Error updating irregular student:", error);
    return NextResponse.json(
      { error: "Failed to update irregular student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = irregularStudentService.findById(id);
    if (!student) {
      return NextResponse.json(
        { error: "Irregular student not found" },
        { status: 404 }
      );
    }

    irregularStudentService.delete(id);

    console.log("Irregular student deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting irregular student:", error);
    return NextResponse.json(
      { error: "Failed to delete irregular student" },
      { status: 500 }
    );
  }
}
