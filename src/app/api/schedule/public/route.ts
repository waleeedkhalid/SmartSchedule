// GET /api/schedule/public - Get published schedule for students
// Includes SWE sections + external slots

import { NextResponse } from "next/server";
import {
  sectionService,
  courseService,
  instructorService,
  roomService,
  meetingService,
  timeSlotService,
  externalSlotService,
} from "@/lib/data-store";

// Mock current user ID (replace with real auth in Phase 4)
const MOCK_STUDENT_ID = "student-1";

export async function GET() {
  try {
    // Get all SWE sections
    const sections = sectionService.findAll();

    const enrichedSections = sections.map((section) => {
      const course = courseService.findById(section.courseId);
      const instructor = section.instructorId
        ? instructorService.findById(section.instructorId)
        : null;
      const room = section.roomId ? roomService.findById(section.roomId) : null;
      const meetings = meetingService
        .findBySection(section.id)
        .map((meeting) => ({
          ...meeting,
          timeSlot: timeSlotService.findById(meeting.timeSlotId),
        }));

      return {
        ...section,
        course,
        instructor,
        room,
        meetings,
      };
    });

    // Get all external slots
    const externalSlots = externalSlotService.findAll();

    return NextResponse.json({
      sweSections: enrichedSections,
      externalSlots,
      studentId: MOCK_STUDENT_ID,
    });
  } catch (error) {
    console.error("Error fetching public schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
