// DELETE /api/meetings/[id]

import { NextResponse } from "next/server";
import { meetingService } from "@/lib/data-store";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meeting = meetingService.findById(id);
    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    meetingService.delete(id);

    console.log("Meeting deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
