import { NextResponse } from "next/server";
import { getExamById, updateExam, deleteExam } from "@/lib/db/exams";
import { notifyExamUpdate, notifyExamDelete } from "@/lib/db/notification-triggers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await getExamById(params.id);
    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Get exam details before update for notification
    const oldExam = await getExamById(params.id);
    
    // Update exam
    const exam = await updateExam(params.id, body);
    
    // Send notification about the update
    await notifyExamUpdate(
      params.id,
      exam.course_code,
      'Exam schedule has been updated'
    );
    
    return NextResponse.json(exam);
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
  { params }: { params: { id: string } }
) {
  try {
    // Get exam details before deletion for notification
    const exam = await getExamById(params.id);
    
    // Delete exam
    await deleteExam(params.id);
    
    // Send notification about the deletion
    await notifyExamDelete(exam.course_code);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { error: "Failed to delete exam" },
      { status: 500 }
    );
  }
}

