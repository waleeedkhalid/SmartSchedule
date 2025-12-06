/**
 * Electives List API
 *
 * GET /api/v1/electives - Get list of available electives
 *
 * Returns all available elective courses with details.
 * All authenticated users can view electives.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

/**
 * GET - List all available elective courses
 * Optional query params:
 * - level: Filter by student level (1-8)
 * - search: Search by course code or title
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const level = searchParams.get("level");
    const search = searchParams.get("search");

    // Build query for electives
    let query = supabase
      .from("course")
      .select(
        `
        code,
        title,
        credits,
        weekly_hours,
        is_elective,
        recommended_level,
        created_at
      `
      )
      .eq("is_elective", true);

    // Filter by level if provided
    if (level && !isNaN(parseInt(level))) {
      const levelNum = parseInt(level);
      query = query.or(
        `recommended_level.is.null,recommended_level.gte.${levelNum}`
      );
    }

    // Search by code or title if provided
    if (search) {
      const searchStr = search.toUpperCase();
      query = query.or(`code.ilike.%${search}%,title.ilike.%${search}%`);
    }

    // Order by code
    query = query.order("code", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Get student's current preferences if they have any
    let studentPreferences: any[] = [];
    if (user.role === "student") {
      const { data: prefData } = await supabase
        .from("elective_preference")
        .select("course_code, rank")
        .eq("student_id", user.id)
        .order("rank", { ascending: true });

      studentPreferences = prefData || [];
    }

    // Enrich electives with preference info
    const enrichedElectives = (data || []).map((elective: any) => ({
      ...elective,
      ...(studentPreferences.length > 0 && {
        student_preference:
          studentPreferences.find((p) => p.course_code === elective.code) ||
          null,
      }),
    }));

    return createSuccessResponse(
      {
        data: enrichedElectives,
        meta: {
          total: enrichedElectives.length,
          level_filter: level || null,
          search_filter: search || null,
        },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
