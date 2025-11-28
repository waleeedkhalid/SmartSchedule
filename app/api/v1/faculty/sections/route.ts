/**
 * Faculty Sections API
 * 
 * GET - Get sections assigned to the authenticated faculty member
 */

import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { getFacultySections } from "@/lib/db/faculty-data";

/**
 * GET /api/v1/faculty/sections
 * Get all sections assigned to the authenticated faculty member
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

    const sections = await getFacultySections(user.id);

    return NextResponse.json({
      sections,
      total: sections.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

