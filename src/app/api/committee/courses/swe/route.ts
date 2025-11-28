/**
 * API Route: Get SWE Courses
 * Returns all SWE-managed courses
 * 
 * ✅ EXTRACTED from /api/committee/scheduler/swe-courses
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Get all SWE-managed courses
    const { data: courses, error: coursesError } = await supabase
      .from("course")
      .select("code, name, credits, level, type, is_active")
      .eq("is_swe_managed", true)
      .order("type", { ascending: true })
      .order("level", { ascending: true })
      .order("code", { ascending: true });

    if (coursesError) throw coursesError;

    return NextResponse.json({
      data: courses || [],
    });
  } catch (error) {
    console.error("GET /api/committee/courses/swe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

