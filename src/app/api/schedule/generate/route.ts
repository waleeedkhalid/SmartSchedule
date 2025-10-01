/**
 * POST /api/schedule/generate
 *
 * Generates a new course schedule based on the provided parameters.
 * Uses ScheduleGenerator to create conflict-aware schedules.
 */

import { NextRequest, NextResponse } from "next/server";
import { ScheduleGenerator } from "@/lib/schedule/ScheduleGenerator";
import { ScheduleGenerationRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as ScheduleGenerationRequest;

    // Validate required fields
    if (!body.semester) {
      return NextResponse.json(
        { error: "Missing required field: semester" },
        { status: 400 }
      );
    }

    if (!body.levels || body.levels.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: levels (must be non-empty array)" },
        { status: 400 }
      );
    }

    // Validate level values (must be 4-8)
    const invalidLevels = body.levels.filter((level) => level < 4 || level > 8);
    if (invalidLevels.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid level values: ${invalidLevels.join(
            ", "
          )}. Levels must be between 4 and 8.`,
        },
        { status: 400 }
      );
    }

    console.log("=".repeat(60));
    console.log("API: Schedule Generation Request");
    console.log("=".repeat(60));
    console.log("Semester:", body.semester);
    console.log("Levels:", body.levels);
    console.log(
      "Consider Irregular Students:",
      body.considerIrregularStudents ?? false
    );
    console.log("Optimization Goals:", body.optimizationGoals ?? []);
    console.log();

    // Generate schedule
    const generator = new ScheduleGenerator();
    const generatedSchedule = await generator.generate(body);

    console.log("Generated Schedule ID:", generatedSchedule.id);
    console.log("Total Sections:", generatedSchedule.metadata.totalSections);
    console.log("Total Exams:", generatedSchedule.metadata.totalExams);
    console.log("Conflicts Found:", generatedSchedule.conflicts.length);
    console.log(
      "Faculty Utilization:",
      `${generatedSchedule.metadata.facultyUtilization.toFixed(1)}%`
    );
    console.log(
      "Room Utilization:",
      `${generatedSchedule.metadata.roomUtilization.toFixed(1)}%`
    );
    console.log();

    // Return generated schedule
    return NextResponse.json(generatedSchedule, { status: 200 });
  } catch (error) {
    console.error("Schedule generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate schedule",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
