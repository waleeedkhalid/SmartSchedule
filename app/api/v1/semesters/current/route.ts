/**
 * Current Semester Endpoint
 * 
 * GET /api/v1/semesters/current
 * 
 * Returns the currently active semester.
 * This is a convenience endpoint for clients to quickly get the active semester.
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

    // Get current semester using database function or query
    const { data, error } = await supabase
      .from("academic_semesters")
      .select("*")
      .eq("is_current", true)
      .single();

    if (error) {
      // If no current semester found, return 404
      if (error.code === "PGRST116") {
        return createSuccessResponse(null, 404);
      }
      throw error;
    }

    // Map database fields to API response format
    const semester = data
      ? {
          id: data.id,
          name: data.name,
          code: data.code,
          start_date: data.start_date,
          end_date: data.end_date,
          registration_start_date: data.registration_start_date,
          registration_end_date: data.registration_end_date,
          add_drop_deadline: data.add_drop_deadline,
          status: data.status,
          is_current: data.is_current,
          created_at: data.created_at,
        }
      : null;

    return createSuccessResponse(semester, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

