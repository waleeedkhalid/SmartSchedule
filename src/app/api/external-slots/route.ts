// GET /api/external-slots - Get external slots
// POST /api/external-slots - Create external slot

import { NextResponse } from "next/server";
import { externalSlotService } from "@/lib/data-store";

export async function GET() {
  try {
    const slots = externalSlotService.findAll();
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching external slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch external slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sourceDepartment,
      courseCode,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      sectionCount,
      capacity,
    } = body;

    // Validation
    if (
      !sourceDepartment ||
      !courseCode ||
      !courseName ||
      !dayOfWeek ||
      !startTime ||
      !endTime ||
      !sectionCount ||
      !capacity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create external slot
    const newSlot = externalSlotService.create({
      sourceDepartment,
      courseCode,
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      sectionCount,
      capacity,
    });

    console.log("External slot created:", newSlot);

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error("Error creating external slot:", error);
    return NextResponse.json(
      { error: "Failed to create external slot" },
      { status: 500 }
    );
  }
}
