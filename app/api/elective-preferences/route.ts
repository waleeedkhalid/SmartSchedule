/**
 * Elective Preferences API Route
 * 
 * GET /api/elective-preferences - Get preferences and available electives for current user
 * POST /api/elective-preferences - Bulk update preferences for current user
 * 
 * Handles student elective preference operations.
 * Students can only manage their own preferences.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// GET - Get preferences and available electives
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can view preferences
    requireRole(user, ["student"]);

    const supabase = await createClient();

    // Get student's current preferences
    const { data: preferences, error: prefError } = await supabase
      .from('elective_preference')
      .select(`
        id,
        course_code,
        rank,
        course:course!elective_preference_course_code_fkey(code, title, recommended_level, credits, is_elective)
      `)
      .eq('student_id', user.id)
      .order('rank', { ascending: true });

    if (prefError) {
      throw prefError;
    }

    // Get all available elective courses
    const { data: electiveCourses, error: coursesError } = await supabase
      .from('course')
      .select('code, title, recommended_level, credits, is_elective, weekly_hours')
      .eq('is_elective', true)
      .order('recommended_level', { ascending: true, nullsFirst: false })
      .order('code', { ascending: true });

    if (coursesError) {
      throw coursesError;
    }

    return createSuccessResponse(
      {
        preferences: preferences || [],
        availableElectives: electiveCourses || [],
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Bulk update preferences
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can manage preferences
    requireRole(user, ["student"]);

    const body = await request.json();
    const { preferences } = body;

    if (!Array.isArray(preferences)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "preferences must be an array"
      );
    }

    // Validate preferences structure
    for (const pref of preferences) {
      if (!pref.course_code || typeof pref.course_code !== 'string') {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Each preference must have a course_code"
        );
      }
      if (typeof pref.rank !== 'number' || pref.rank < 1) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Each preference must have a valid rank (number >= 1)"
        );
      }
    }

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode - just return success (demo users don't persist data)
    if (isDemo === true) {
      return createSuccessResponse(
        {
          message: "Preferences saved (demo mode - changes not persisted)",
          preferences: preferences.map((p: any) => ({
            course_code: p.course_code,
            rank: p.rank,
          })),
        },
        200
      );
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    // Delete existing preferences for this student
    const { error: deleteError } = await supabase
      .from("elective_preference")
      .delete()
      .eq("student_id", user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Insert new preferences
    if (preferences.length > 0) {
      const preferencesToInsert = preferences.map((p: any) => ({
        student_id: user.id,
        course_code: p.course_code,
        rank: p.rank,
      }));

      const { data: insertedPreferences, error: insertError } = await supabase
        .from("elective_preference")
        .insert(preferencesToInsert)
        .select(`
          id,
          course_code,
          rank,
          course:course!elective_preference_course_code_fkey(code, title, recommended_level, credits, is_elective)
        `);

      if (insertError) {
        throw insertError;
      }

      return createSuccessResponse(
        {
          message: "Preferences saved successfully",
          preferences: insertedPreferences,
        },
        200
      );
    }

    // No preferences to save
    return createSuccessResponse(
      {
        message: "Preferences cleared",
        preferences: [],
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

