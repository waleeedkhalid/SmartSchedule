/**
 * API Route: Toggle SWE Course Status
 * Activates or deactivates a course
 * 
 * ✅ EXTRACTED from /api/committee/scheduler/swe-courses/toggle
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is scheduling committee
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "scheduling_committee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { course_code, is_active } = body;

    if (!course_code || typeof is_active !== "boolean") {
      return NextResponse.json(
        { error: "course_code and is_active (boolean) are required" },
        { status: 400 }
      );
    }

    // Update the course's active status
    const { error: updateError } = await supabase
      .from("course")
      .update({ is_active })
      .eq("code", course_code)
      .eq("is_swe_managed", true); // Only allow updating SWE-managed courses

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: `Course ${course_code} ${is_active ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("POST /api/committee/courses/swe/toggle error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

