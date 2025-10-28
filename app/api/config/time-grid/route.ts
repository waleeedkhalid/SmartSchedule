import { NextResponse } from "next/server";
import { updateTimeGridConfig } from "@/lib/db/config";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Config ID is required" },
        { status: 400 }
      );
    }

    const updatedConfig = await updateTimeGridConfig(id, updates);

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating time grid config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}

