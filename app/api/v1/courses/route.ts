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
import { getMockCourses } from "@/lib/demo-data";
import { extractAuthToken } from "@/lib/api/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (all authenticated users can view courses)
    await authenticateRequest(request);

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      const mockCourses = await getMockCourses();
      
      // Map to API response format
      const courses = mockCourses.map((course) => ({
        code: course.code,
        name: course.title,
        credits: course.credits,
        level: course.level,
        course_type: course.is_elective ? "elective" : "required",
        created_at: "2024-01-01T00:00:00Z",
      }));

      return createSuccessResponse(courses, 200);
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      throw error;
    }

    // Map database fields to API response format
    const courses = (data || []).map((course: any) => ({
      code: course.code,
      name: course.title,
      credits: course.credits,
      level: course.level,
      course_type: course.is_elective ? "elective" : "required",
      created_at: course.created_at,
    }));

    return createSuccessResponse(courses, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    if (isDemo === true) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Cannot create courses in demo mode"
      );
    }

    const body = await request.json();
    const { code, name, credits, level, course_type, weekly_hours } = body;

    // Validate required fields
    if (!code || !name || credits === undefined || level === undefined) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required fields: code, name, credits, level"
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

    // Insert new course
    const { data, error } = await supabase
      .from("course")
      .insert({
        code,
        title: name,
        credits: parseInt(credits),
        level: parseInt(level),
        weekly_hours: weekly_hours ? parseInt(weekly_hours) : credits * 1, // Default: 1 hour per credit
        is_elective: course_type === "elective",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Map to API response format
    const course = {
      code: data.code,
      name: data.title,
      credits: data.credits,
      level: data.level,
      course_type: data.is_elective ? "elective" : "required",
      created_at: data.created_at,
    };

    return createSuccessResponse(course, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
