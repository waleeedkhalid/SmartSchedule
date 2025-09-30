// PATCH /api/rules/[id] - Update rule (toggle active, change values)

import { NextResponse } from "next/server";
import { ruleService } from "@/lib/data-store";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const rule = ruleService.findById(id);
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    // If updating valueJson, ensure it's a string
    const updates = { ...body };
    if (updates.valueJson && typeof updates.valueJson !== "string") {
      updates.valueJson = JSON.stringify(updates.valueJson);
    }

    const updatedRule = ruleService.update(id, updates);

    console.log("Rule updated:", updatedRule);

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error("Error updating rule:", error);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}
