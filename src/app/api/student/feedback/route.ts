/**
 * Feedback API Route (Optimized)
 * GET: Fetch student's feedback for current term
 * POST: Submit or update feedback for current term
 * 
 * Performance Optimizations:
 * - Uses cached auth functions
 * - Parallel data fetching with Promise.all()
 * - Select only required columns
 * - Removed force-dynamic for better caching
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/cached-auth";

/**
 * GET /api/student/feedback
 * Fetch student's feedback for the current term
 */
export async function GET(request: NextRequest) {
  try {
    // Use cached auth function
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerClient();

    // Parallel fetching: Get active term and feedback simultaneously
    const [activeTermResult, feedbackResult] = await Promise.all([
      supabase
        .from("academic_term")
        .select("code, is_feedback_open")
        .eq("is_active", true)
        .maybeSingle(),
      // Get all feedback for the user (will filter by term code after)
      supabase
        .from("feedback")
        .select("id, rating, comments, submitted_at, term_code")
        .eq("student_id", user.id)
        .limit(10), // Reasonable limit
    ]);

    const { data: activeTerm } = activeTermResult;
    const { data: allFeedback } = feedbackResult;

    if (!activeTerm) {
      return NextResponse.json(
        { error: "No active academic term" },
        { status: 404 }
      );
    }

    // Filter feedback for current term (done in memory to allow parallel fetch)
    const feedback = allFeedback?.find((f) => f.term_code === activeTerm.code) || null;

    return NextResponse.json({
      success: true,
      feedback,
      is_feedback_open: activeTerm.is_feedback_open,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/feedback (Optimized)
 * Submit or update feedback for the current term
 */
export async function POST(request: NextRequest) {
  try {
    // Use cached auth function
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { rating, comments } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get active term (only needed columns)
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("code, is_feedback_open")
      .eq("is_active", true)
      .maybeSingle();

    if (!activeTerm) {
      return NextResponse.json(
        { error: "No active academic term" },
        { status: 404 }
      );
    }

    // Check if feedback is open
    if (!activeTerm.is_feedback_open) {
      return NextResponse.json(
        { error: "Feedback is not currently open for this term" },
        { status: 403 }
      );
    }

    // Upsert feedback (insert or update)
    const { data: feedback, error } = await supabase
      .from("feedback")
      .upsert(
        {
          student_id: user.id,
          term_code: activeTerm.code,
          rating,
          comments: comments || null,
          submitted_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id,term_code",
        }
      )
      .select("id, rating, comments, submitted_at, term_code")
      .single();

    if (error) {
      console.error("Error submitting feedback:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
