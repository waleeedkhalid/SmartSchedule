// GET /api/conflicts - Get all current conflicts

import { NextResponse } from "next/server";
import { checkAllConflicts } from "@/lib/rules-engine";
import { conflictService } from "@/lib/data-store";

export async function GET() {
  try {
    // Run conflict check
    const result = checkAllConflicts();

    // Store conflicts in data store
    conflictService.clear();
    result.conflicts.forEach((conflict) => {
      conflictService.create(conflict);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}
