/**
 * Semesters List Endpoint
 * 
 * GET /api/v1/semesters
 * 
 * Returns list of all semesters, ordered by start_date (most recent first).
 * Supports filtering by current semester.
 * 
 * Why platform-agnostic: Returns pure JSON that any client can parse.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view semesters)
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const currentOnly = searchParams.get("current") === "true";

    let query = supabase
      .from("academic_semesters")
      .select("*")
      .order("start_date", { ascending: false });

    // Filter by current semester if requested
    if (currentOnly) {
      query = query.eq("is_current", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map database fields to API response format
    const semesters = (data || []).map((semester: any) => ({
      id: semester.id,
      name: semester.name,
      code: semester.code,
      start_date: semester.start_date,
      end_date: semester.end_date,
      registration_start_date: semester.registration_start_date,
      registration_end_date: semester.registration_end_date,
      add_drop_deadline: semester.add_drop_deadline,
      status: semester.status,
      is_current: semester.is_current,
      created_at: semester.created_at,
    }));

    return createSuccessResponse(semesters, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

