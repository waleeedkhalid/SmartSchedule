// GET /api/notifications - Get user notifications
// PATCH /api/notifications/[id] - Mark as read
// POST /api/notifications/mark-all-read - Mark all as read

import { NextResponse } from "next/server";
import { notificationService } from "@/lib/data-store";

// Mock current user
const MOCK_USER_ID = "user-1";

export async function GET() {
  try {
    const notifications = notificationService.findByUser(MOCK_USER_ID);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
