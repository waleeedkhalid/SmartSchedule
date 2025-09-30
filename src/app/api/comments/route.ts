// GET /api/comments - Get comments by target
// POST /api/comments - Create comment

import { NextResponse } from "next/server";
import { commentService } from "@/lib/data-store";
import { UserRole, CommentTargetType } from "@/lib/types";

// Mock current user
const MOCK_USER_ID = "user-1";
const MOCK_USER_NAME = "John Doe";
const MOCK_USER_ROLE: UserRole = "SCHEDULING_COMMITTEE";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "Missing query params: targetType, targetId" },
        { status: 400 }
      );
    }

    const comments = commentService.findByTarget(
      targetType as CommentTargetType,
      targetId
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, text } = body;

    // Validation
    if (!targetType || !targetId || !text) {
      return NextResponse.json(
        { error: "Missing required fields: targetType, targetId, text" },
        { status: 400 }
      );
    }

    // Create comment
    const newComment = commentService.create({
      authorId: MOCK_USER_ID,
      authorName: MOCK_USER_NAME,
      authorRole: MOCK_USER_ROLE,
      targetType: targetType as CommentTargetType,
      targetId,
      text,
      resolved: false,
    });

    console.log("Comment created:", newComment);

    // TODO: Create notifications for relevant users
    // For now, just log it
    console.log("TODO: Send notifications for new comment");

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
