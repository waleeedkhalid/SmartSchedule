/**
 * Faculty Comments/Feedback API
 * 
 * GET - Get faculty's submitted comments
 * POST - Submit a new comment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { z } from "zod";
import { 
  getFacultyComments, 
  submitFacultyComment 
} from "@/lib/db/faculty-data";

// Validation schema for new comment
const createCommentSchema = z.object({
  section_id: z.string().uuid().nullable().optional(),
  schedule_id: z.string().uuid().nullable().optional(),
  comment_text: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
});

/**
 * GET /api/v1/faculty/comments
 * Get all comments submitted by the authenticated faculty member
 */
export async function GET() {
  try {
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

    const comments = await getFacultyComments(user.id);

    return NextResponse.json({
      comments,
      total: comments.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/faculty/comments
 * Submit a new comment/feedback
 */
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { section_id, schedule_id, comment_text, rating } = validationResult.data;

    // At least one of section_id or schedule_id must be provided
    if (!section_id && !schedule_id) {
      return NextResponse.json(
        { error: "Either section_id or schedule_id must be provided" },
        { status: 400 }
      );
    }

    const result = await submitFacultyComment(
      user.id,
      section_id || null,
      schedule_id || null,
      comment_text,
      rating
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Comment submitted successfully", id: result.id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

