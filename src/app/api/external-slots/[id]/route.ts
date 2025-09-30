// DELETE /api/external-slots/[id]

import { NextResponse } from "next/server";
import { externalSlotService } from "@/lib/data-store";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const slot = externalSlotService.findById(id);
    if (!slot) {
      return NextResponse.json(
        { error: "External slot not found" },
        { status: 404 }
      );
    }

    externalSlotService.delete(id);

    console.log("External slot deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting external slot:", error);
    return NextResponse.json(
      { error: "Failed to delete external slot" },
      { status: 500 }
    );
  }
}
