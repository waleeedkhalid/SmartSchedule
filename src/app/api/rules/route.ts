// GET /api/rules - Get all scheduling rules (metadata)
// Used by: Committee rules management

import { NextResponse } from "next/server";
import { RULES } from "@/lib/rules-engine";
import { configService } from "@/lib/data-store";

export async function GET() {
  try {
    const config = configService.get();

    // Return rule metadata with current config values
    const rulesWithConfig = RULES.map((rule) => ({
      ...rule,
      config: {
        breakTimeStart: config.breakTimeStart,
        breakTimeEnd: config.breakTimeEnd,
        midtermDays: config.midtermDays,
        midtermTimeStart: config.midtermTimeStart,
        midtermTimeEnd: config.midtermTimeEnd,
        maxElectivePreferences: config.maxElectivePreferences,
      },
    }));

    return NextResponse.json(rulesWithConfig);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json();

    console.log("Updating rules config:", updates);

    // Update config
    const updatedConfig = configService.update(updates);

    return NextResponse.json(updatedConfig, { status: 200 });
  } catch (error) {
    console.error("Error updating rules config:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
}
