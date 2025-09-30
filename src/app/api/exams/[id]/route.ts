// PATCH /api/exams/[id] - Update exam
// DELETE /api/exams/[id] - Delete exam

import { NextResponse } from "next/server";
import { examService } from "@/lib/data-store";
import { checkAllConflicts } from "@/lib/rules-engine";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const exam = examService.findById(id);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Update exam
    const updatedExam = examService.update(id, body);

    // Check for conflicts
    const conflictCheck = checkAllConflicts();

    console.log("Exam updated:", updatedExam);
    if (conflictCheck.conflicts.length > 0) {
      console.warn("Conflicts detected:", conflictCheck.conflicts);
    }

    return NextResponse.json({
      exam: updatedExam,
      conflicts: conflictCheck.conflicts,
    });
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { error: "Failed to update exam" },
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

    const exam = examService.findById(id);
    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    examService.delete(id);

    console.log("Exam deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
