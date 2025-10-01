/**
 * POST /api/schedule/validate
 * 
 * Validates a schedule and returns detected conflicts.
 * Useful for re-checking schedules or validating manual edits.
 */

import { NextRequest, NextResponse } from "next/server";
import { ConflictChecker } from "@/lib/schedule/ConflictChecker";
import { LevelSchedule } from "@/lib/types";

interface ValidateRequest {
  schedules: LevelSchedule[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as ValidateRequest;

    // Validate required fields
    if (!body.schedules || !Array.isArray(body.schedules)) {
      return NextResponse.json(
        { error: "Missing required field: schedules (must be an array)" },
        { status: 400 }
      );
    }

    if (body.schedules.length === 0) {
      return NextResponse.json(
        { error: "schedules array cannot be empty" },
        { status: 400 }
      );
    }

    console.log("=".repeat(60));
    console.log("API: Schedule Validation Request");
    console.log("=".repeat(60));
    console.log("Number of level schedules to validate:", body.schedules.length);
    console.log();

    // Run conflict detection
    const conflictChecker = new ConflictChecker();
    const conflicts = conflictChecker.checkScheduleConflicts(body.schedules);

    // Categorize conflicts by severity
    const critical = conflicts.filter(c => c.severity === "critical");
    const high = conflicts.filter(c => c.severity === "high");
    const medium = conflicts.filter(c => c.severity === "medium");
    const low = conflicts.filter(c => c.severity === "low");

    console.log("Validation Results:");
    console.log(`  Critical: ${critical.length}`);
    console.log(`  High: ${high.length}`);
    console.log(`  Medium: ${medium.length}`);
    console.log(`  Low: ${low.length}`);
    console.log(`  Total: ${conflicts.length}`);
    console.log();

    // Return validation results
    return NextResponse.json({
      valid: conflicts.length === 0,
      totalConflicts: conflicts.length,
      conflicts: {
        critical,
        high,
        medium,
        low,
      },
      summary: {
        criticalCount: critical.length,
        highCount: high.length,
        mediumCount: medium.length,
        lowCount: low.length,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Schedule validation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to validate schedule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
