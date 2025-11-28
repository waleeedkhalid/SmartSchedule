/**
 * Academic Plan Endpoint
 * 
 * GET /api/v1/academic-plan - Get academic plan data for authenticated student
 * 
 * Returns courses organized by level with completion status.
 * Only students can access their own academic plan.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// OPTIMIZATION: Cache API route responses for 1 hour (3600 seconds)
// Academic plan data is relatively static and doesn't change frequently
export const revalidate = 3600; // 1 hour

interface Course {
  code: string;
  name: string;
  credits: number;
  level: number;
  course_type: "required" | "elective";
  created_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request);
    
    // Only students can access academic plan
    requireRole(user, "student");
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
    const courses: Course[] = (data || []).map((course) => ({
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

