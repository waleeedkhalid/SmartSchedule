// Demo accounts API endpoint
// Returns demo account credentials for testing

import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS } from "@/lib/seed-demo-accounts";

export async function GET() {
  try {
    // Return demo accounts (read-only, no auth required)
    const accounts = DEMO_ACCOUNTS.map((account) => ({
      email: account.email,
      password: account.password,
      role: account.role,
      name: account.name,
    }));

    return NextResponse.json({
      success: true,
      accounts,
      message: "Demo accounts retrieved successfully",
    });
  } catch (error) {
    console.error("Demo accounts API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve demo accounts",
      },
      { status: 500 }
    );
  }
}
