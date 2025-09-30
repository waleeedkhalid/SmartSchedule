// POST /api/meetings - Create meeting
// DELETE /api/meetings/[id] - Delete meeting

import { NextResponse } from "next/server";
import {
  meetingService,
  sectionService,
  timeSlotService,
} from "@/lib/data-store";
import { checkAllConflicts } from "@/lib/rules-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, timeSlotId, kind } = body;

    // Validation
    if (!sectionId || !timeSlotId || !kind) {
      return NextResponse.json(
        { error: "Missing required fields: sectionId, timeSlotId, kind" },
        { status: 400 }
      );
    }

    // Check if section exists
    const section = sectionService.findById(sectionId);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    // Check if time slot exists
    const timeSlot = timeSlotService.findById(timeSlotId);
    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    // Create meeting
    const newMeeting = meetingService.create({
      sectionId,
      timeSlotId,
      kind,
    });

    // Check for conflicts
    const conflictCheck = checkAllConflicts();

    console.log("Meeting created:", newMeeting);
    if (conflictCheck.conflicts.length > 0) {
      console.warn("Conflicts detected:", conflictCheck.conflicts);
    }

    return NextResponse.json(
      {
        meeting: newMeeting,
        conflicts: conflictCheck.conflicts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
