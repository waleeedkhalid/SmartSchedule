/**
 * Semesters List Endpoint (Backward Compatibility)
 * 
 * GET /api/v1/semesters
 * 
 * Returns list of all academic terms, ordered by start_date (most recent first).
 * Supports filtering by current term.
 * 
 * NOTE: This endpoint is kept for backward compatibility.
 * New code should use /api/v1/academic-terms instead.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view terms)
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const currentOnly = searchParams.get("current") === "true";

    let query = supabase
      .from("academic_term")
      .select("*")
      .order("start_date", { ascending: false });

    // Filter by current term if requested (status = 'draft' or 'released')
    if (currentOnly) {
      query = query.in("status", ["draft", "released"]);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map database fields to API response format (backward compatible)
    const semesters = (data || []).map((term: any) => ({
      id: term.id,
      name: term.name,
      code: term.code,
      start_date: term.start_date,
      end_date: term.end_date,
      status: term.status,
      is_current: term.status === "draft" || term.status === "released", // Approximate
      created_at: term.created_at,
    }));

    return createSuccessResponse(semesters, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
