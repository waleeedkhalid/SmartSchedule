/**
 * Faculty Comment Detail API
 * 
 * PATCH - Update a comment
 * DELETE - Delete a comment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { z } from "zod";
import { 
  updateFacultyComment, 
  deleteFacultyComment 
} from "@/lib/db/faculty-data";

// Validation schema for comment update
const updateCommentSchema = z.object({
  comment_text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/faculty/comments/[id]
 * Update an existing comment
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: commentId } = await params;
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is faculty
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== 'faculty') {
      return NextResponse.json(
        { error: "Forbidden: Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { comment_text, rating } = validationResult.data;

    const result = await updateFacultyComment(
      commentId,
      user.id,
      comment_text,
      rating
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Comment updated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/faculty/comments/[id]
 * Delete a comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: commentId } = await params;
    
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is faculty
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== 'faculty') {
      return NextResponse.json(
        { error: "Forbidden: Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    const result = await deleteFacultyComment(commentId, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Comment deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

