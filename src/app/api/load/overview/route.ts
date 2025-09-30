// GET /api/load/overview - Get instructor load overview for Teaching Load Committee

import { NextResponse } from "next/server";
import {
  instructorService,
  sectionService,
  courseService,
  meetingService,
  timeSlotService,
} from "@/lib/data-store";

export async function GET() {
  try {
    const instructors = instructorService.findAll();

    const loadOverview = instructors.map((instructor) => {
      const sections = sectionService.findByInstructor(instructor.id);

      // Calculate total teaching hours
      let totalHours = 0;
      sections.forEach((section) => {
        const meetings = meetingService.findBySection(section.id);
        meetings.forEach((meeting) => {
          const timeSlot = timeSlotService.findById(meeting.timeSlotId);
          if (timeSlot) {
            const duration = calculateDuration(
              timeSlot.startTime,
              timeSlot.endTime
            );
            totalHours += duration;
          }
        });
      });

      const enrichedSections = sections.map((section) => ({
        section,
        course: courseService.findById(section.courseId),
      }));

      return {
        instructor,
        sections: enrichedSections,
        totalHours,
        isOverloaded: totalHours > instructor.maxLoadHours,
      };
    });

    return NextResponse.json(loadOverview);
  } catch (error) {
    console.error("Error fetching load overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch load overview" },
      { status: 500 }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60; // Return hours
}
