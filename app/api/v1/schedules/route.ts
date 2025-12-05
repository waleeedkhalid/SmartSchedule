/**
 * Schedules Endpoint
 *
 * GET /api/v1/schedules?term_id=xxx - List schedules for a term
 * POST /api/v1/schedules - Create schedule (add section to term)
 *
 * All authenticated users can view schedules.
 * Only scheduling role can create schedules.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { revalidateSchedules } from "@/lib/cache/revalidation";

// OPTIMIZATION: Cache API route responses for 5 minutes (300 seconds)
// Schedule data needs relatively fresh data but can tolerate short cache
export const revalidate = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const termId = searchParams.get("term_id");

    if (!termId) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "term_id parameter is required"
      );
    }

    // Uses idx_schedule_term_id index for filtering by term_id
    const { data, error } = await supabase
      .from("schedule")
      .select(
        `
        *,
        term:term_id (
          id,
          code,
          name,
          status
        ),
        section:section_id (
          *,
          course:course_code (
            code,
            title
          )
        )
      `
      )
      .eq("term_id", termId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const response = createSuccessResponse(data || [], 200);
    // OPTIMIZATION: Add cache headers for browser/CDN caching
    // s-maxage: Cache for 5 minutes on CDN
    // stale-while-revalidate: Serve stale content for up to 1 hour while revalidating
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=3600"
    );
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { term_id, section_id } = body;

    if (!term_id || !section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: term_id, section_id"
      );
    }

    const supabase = await createClient();

    // Check if term exists
    const { data: term } = await supabase
      .from("academic_term")
      .select("id")
      .eq("id", term_id)
      .single();

    if (!term) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Academic term with id '${term_id}' not found`
      );
    }

    // Check if section exists
    const { data: section } = await supabase
      .from("section")
      .select("id")
      .eq("id", section_id)
      .single();

    if (!section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Section with id '${section_id}' not found`
      );
    }

    // Check if schedule already exists
    // Uses idx_schedule_term_id and idx_schedule_section_id indexes
    const { data: existing } = await supabase
      .from("schedule")
      .select("id")
      .eq("term_id", term_id)
      .eq("section_id", section_id)
      .single();

    if (existing) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        "Section is already in this schedule"
      );
    }

    // Create schedule entry
    const { data, error } = await supabase
      .from("schedule")
      .insert({
        term_id,
        section_id,
      })
      .select(
        `
        *,
        term:term_id (
          id,
          code,
          name,
          status
        ),
        section:section_id (
          *,
          course:course_code (
            code,
            title
          )
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    // Revalidate schedule-related caches after successful creation
    revalidateSchedules();

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
