/**
 * Academic Terms Endpoint
 *
 * GET /api/v1/academic-terms - List all academic terms
 * POST /api/v1/academic-terms - Create a new academic term
 *
 * All authenticated users can view terms.
 * Only scheduling role can create terms.
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
import { revalidateAcademicTerms } from "@/lib/cache/revalidation";

// OPTIMIZATION: Cache API route responses for 1 hour (3600 seconds)
// Academic terms rarely change and are safe to cache longer
export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const currentOnly = searchParams.get("current") === "true";

    let query = supabase
      .from("academic_term")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by current term if requested (status = 'draft' or 'released')
    if (currentOnly) {
      query = query.in("status", ["draft", "released"]);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // If currentOnly is true, return only the most recent active term
    if (currentOnly && data && data.length > 0) {
      const response = createSuccessResponse([data[0]], 200);
      // OPTIMIZATION: Add cache headers for current term queries
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );
      return response;
    }

    const response = createSuccessResponse(data || [], 200);
    // OPTIMIZATION: Add cache headers for browser/CDN caching
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
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
    const { code, name, start_date, end_date, status } = body;

    if (!code || !name) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: code, name"
      );
    }

    const supabase = await createClient();

    // Check if term already exists
    // Uses idx_academic_term_code index
    const { data: existing } = await supabase
      .from("academic_term")
      .select("code")
      .eq("code", code)
      .single();

    if (existing) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Academic term with code '${code}' already exists`
      );
    }

    const { data, error } = await supabase
      .from("academic_term")
      .insert({
        code,
        name,
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
