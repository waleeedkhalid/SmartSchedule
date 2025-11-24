/**
 * Courses List Endpoint
 * 
 * GET /api/v1/courses
 * 
 * Returns list of all courses.
 * All authenticated users can view courses.
 * 
 * Why platform-agnostic: Returns JSON array that any HTTP client can consume.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { getMockCourses } from "@/lib/demo-data";

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

