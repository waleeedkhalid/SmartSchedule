/**
 * Instructors List Endpoint
 *
 * GET /api/v1/instructors - List all instructors
 * POST /api/v1/instructors - Create a new instructor
 *
 * All authenticated users can view instructors.
 * Only scheduling and teaching_load roles can create instructors.
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
import { revalidateInstructors } from "@/lib/cache/revalidation";

// OPTIMIZATION: Cache API route responses for 30 minutes (1800 seconds)
// Instructor data changes less frequently than sections
export const revalidate = 1800; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view instructors)
    await authenticateRequest(request);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("faculty_profile")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    const response = createSuccessResponse(data || [], 200);
    // OPTIMIZATION: Add cache headers for browser/CDN caching
    // s-maxage: Cache for 30 minutes on CDN
    // stale-while-revalidate: Serve stale content for up to 6 hours while revalidating
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=1800, stale-while-revalidate=21600"
    );
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    const body = await request.json();
    const { name, email, max_load_per_week } = body;

    // Validate required fields
    if (!name) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: name"
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid email format"
      );
    }

    // Validate max_load_per_week
    if (
      max_load_per_week !== undefined &&
      (max_load_per_week < 1 || max_load_per_week > 40)
    ) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "max_load_per_week must be between 1 and 40"
      );
    }

    const supabase = await createClient();

    // Check if email already exists (if provided)
    if (email) {
      const { data: existing } = await supabase
        .from("faculty_profile")
        .select("id")
        .eq("email", email)
        .single();

      if (existing) {
        return createErrorResponse(
          409,
          ErrorCodes.VALIDATION_ERROR,
          `Faculty profile with email '${email}' already exists`
        );
      }
    }

    // Insert new faculty profile without requiring an auth-backed user_id
    const { data, error } = await supabase
      .from("faculty_profile")
      .insert({
        name,
        email: email || null,
        max_load_per_week: max_load_per_week || 12,
        preferred_times: [],
        unavailable_times: [],
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate instructor-related caches after successful creation
    revalidateInstructors();

    return createSuccessResponse(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
