// GET /api/faculty/assignments - Get faculty member's assignments

import { NextResponse } from "next/server";
import { 
  sectionService, 
  courseService, 
  roomService, 
  meetingService, 
  timeSlotService 
} from "@/lib/data-store";

// Mock faculty user ID
const MOCK_FACULTY_ID = "instructor-1";

export async function GET() {
  try {
    // Get sections assigned to this instructor
    const sections = sectionService.findByInstructor(MOCK_FACULTY_ID);
    
    const enrichedSections = sections.map(section => {
      const course = courseService.findById(section.courseId);
      const room = section.roomId ? roomService.findById(section.roomId) : null;
      const meetings = meetingService.findBySection(section.id).map(meeting => ({
        ...meeting,
        timeSlot: timeSlotService.findById(meeting.timeSlotId),
      }));

      return {
        ...section,
        course,
        room,
        meetings,
      };
    });

    return NextResponse.json(enrichedSections);
  } catch (error) {
    console.error("Error fetching faculty assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
