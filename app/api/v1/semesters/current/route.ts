/**
 * Current Semester Endpoint (Backward Compatibility)
 * 
 * GET /api/v1/semesters/current
 * 
 * Returns the currently active academic term.
 * 
 * NOTE: This endpoint is kept for backward compatibility.
 * New code should use /api/v1/academic-terms and filter by status.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const supabase = await createClient();

    // Get current term (status = 'draft' or 'released', most recent first)
    const { data, error } = await supabase
      .from("academic_term")
      .select("*")
      .in("status", ["draft", "released"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no current term found, return 404
      if (error.code === "PGRST116") {
        return createSuccessResponse(null, 404);
      }
      throw error;
    }

    // Map database fields to API response format (backward compatible)
    const semester = data
      ? {
          id: data.id,
          name: data.name,
          code: data.code,
          start_date: data.start_date,
          end_date: data.end_date,
          status: data.status,
          is_current: true,
          created_at: data.created_at,
        }
      : null;

    return createSuccessResponse(semester, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
