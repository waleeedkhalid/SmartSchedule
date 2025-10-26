/**
 * Schedule API Route (Optimized)
 * GET: Fetch student's published schedule for current/active term
 * 
 * Performance Optimizations:
 * - Uses cached auth functions (no redundant auth.getUser calls)
 * - Parallel data fetching with Promise.all()
 * - Select only required columns (not *)
 * - Removed force-dynamic for better caching
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/lib/auth/cached-auth";

export async function GET(request: NextRequest) {
  try {
    // Use cached auth function (10-100x faster)
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerClient();

    // Parallel fetching: Get active term and schedule simultaneously
    const [activeTermResult, scheduleResult] = await Promise.all([
      supabase
        .from("academic_term")
        .select("code")
        .eq("is_active", true)
        .maybeSingle(),
      // This will return null if no term is active, handled below
      supabase
        .from("schedules")
        .select("id, term_code, version, data, updated_at, created_at")
        .eq("student_id", user.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const { data: activeTerm } = activeTermResult;
    const { data: schedule } = scheduleResult;

    if (!activeTerm) {
      return NextResponse.json(
        { error: "No active academic term" },
        { status: 404 }
      );
    }

    // Check if schedule matches active term
    if (!schedule || schedule.term_code !== activeTerm.code) {
      return NextResponse.json(
        { error: "No published schedule found for active term" },
        { status: 404 }
      );
    }

    // Format response with metadata
    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        term_code: schedule.term_code,
        version: schedule.version,
        published_at: schedule.updated_at || schedule.created_at,
        sections: schedule.data?.sections || [],
      },
    });
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
