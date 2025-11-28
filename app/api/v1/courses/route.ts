/**
 * Courses List Endpoint
 * 
 * GET /api/v1/courses - List all courses
 * POST /api/v1/courses - Create a new course
 * 
 * All authenticated users can view courses.
 * Only scheduling and teaching_load roles can create courses.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { revalidateCourses } from "@/lib/cache/revalidation";

// OPTIMIZATION: Cache API route responses for 1 hour (3600 seconds)
// Courses data is relatively static and doesn't change frequently
export const revalidate = 3600; // 1 hour

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view courses)
    await authenticateRequest(request);
    const supabase = await createClient();

    // OPTIMIZATION: Select only required columns instead of select("*")
    // This reduces data transfer and improves query performance
    const { data, error } = await supabase
      .from("course")
      .select("code, title, credits, recommended_level, is_elective, created_at")
      .order("code", { ascending: true });

    if (error) {
      throw error;
    }

    // Map database fields to API response format
    // For electives, recommended_level is NULL, so we use 0 for grouping
    const courses = (data || []).map((course) => ({
      code: course.code,
      name: course.title,
      credits: course.credits,
      level: (course.recommended_level ?? 0) as number, // Use 0 for electives (NULL recommended_level)
      course_type: course.is_elective ? "elective" : "required",
      created_at: course.created_at,
    }));

    const response = createSuccessResponse(courses, 200);
    // OPTIMIZATION: Add cache headers for browser/CDN caching
    // s-maxage: Cache for 1 hour on CDN
    // stale-while-revalidate: Serve stale content for up to 24 hours while revalidating
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
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
    const { code, name, credits, level, course_type, weekly_hours } = body;

    // Validate required fields
    // Note: level is optional for elective courses (will be NULL)
    if (!code || !name || credits === undefined) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: code, name, credits"
      );
    }

    // Validate level: required for core courses, optional (NULL) for electives
    const isElective = course_type === "elective";
    if (!isElective && (level === undefined || level === null)) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: level (required for core courses)"
      );
    }

    const supabase = await createClient();

    // Check if course already exists
    const { data: existing } = await supabase
      .from("course")
      .select("code")
      .eq("code", code)
      .single();

    if (existing) {
      return createErrorResponse(
        409,
        ErrorCodes.VALIDATION_ERROR,
        `Course with code '${code}' already exists`
      );
    }

    // Calculate weekly_hours: credits + 1, except if credits = 2 then weekly_hours = 2
    const creditsNum = parseInt(credits);
    const calculatedWeeklyHours = creditsNum === 2 ? 2 : creditsNum + 1;
    const finalWeeklyHours = weekly_hours ? parseInt(weekly_hours) : calculatedWeeklyHours;

    // Insert new course
    // recommended_level: NULL for electives, set value for core courses
    const { data, error } = await supabase
      .from("course")
      .insert({
        code,
        title: name,
        credits: creditsNum,
        recommended_level: isElective ? null : parseInt(level),
        weekly_hours: finalWeeklyHours,
        is_elective: isElective,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map to API response format
    // Use 0 for electives (NULL recommended_level) for backward compatibility
    const course = {
      code: data.code,
      name: data.title,
      credits: data.credits,
      level: data.recommended_level ?? 0, // Use 0 for electives (NULL recommended_level)
      course_type: data.is_elective ? "elective" : "required",
      created_at: data.created_at,
    };

    // Revalidate course-related caches after successful creation
    revalidateCourses();

    return createSuccessResponse(course, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
