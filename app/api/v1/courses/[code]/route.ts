/**
 * Course Detail Endpoint
 * 
 * GET /api/v1/courses/:code - Get course details
 * PUT /api/v1/courses/:code - Update course
 * DELETE /api/v1/courses/:code - Delete course
 * 
 * All authenticated users can view course details.
 * Only scheduling and teaching_load roles can update/delete courses.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { revalidateCourses } from "@/lib/cache/revalidation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // Authenticate user
    await authenticateRequest(request);

    const { code } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          `Course with code '${code}' not found`
        );
      }
      throw error;
    }

    // Map database fields to API response format
    const course = {
      code: data.code,
      name: data.title,
      credits: data.credits,
      level: data.recommended_level ?? 0, // Use 0 for electives (NULL recommended_level)
      course_type: data.is_elective ? "elective" : "required",
      created_at: data.created_at,
    };

    return createSuccessResponse(course, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    const { code } = await params;
    const body = await request.json();
    const { name, credits, level, course_type, weekly_hours } = body;

    const supabase = await createClient();

    // Check if course exists
    const { data: existing, error: checkError } = await supabase
      .from("course")
      .select("code")
      .eq("code", code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Course with code '${code}' not found`
      );
    }

    // Get existing course data for reference
    const { data: existingCourse } = await supabase
      .from("course")
      .select("*")
      .eq("code", code)
      .single();

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.title = name;
    if (credits !== undefined) {
      const creditsNum = parseInt(credits);
      updateData.credits = creditsNum;
      // Auto-calculate weekly_hours if not explicitly provided: credits + 1, except if credits = 2 then weekly_hours = 2
      if (weekly_hours === undefined) {
        updateData.weekly_hours = creditsNum === 2 ? 2 : creditsNum + 1;
      }
    }
    if (level !== undefined) {
      const isElective = course_type === "elective" || (course_type === undefined && existingCourse?.is_elective);
      updateData.recommended_level = isElective ? null : parseInt(level);
    }
    if (weekly_hours !== undefined) updateData.weekly_hours = parseInt(weekly_hours);
    if (course_type !== undefined) {
      updateData.is_elective = course_type === "elective";
      // If changing to elective, set recommended_level to NULL
      if (course_type === "elective" && level === undefined) {
        updateData.recommended_level = null;
      }
    }

    // Update course
    const { data, error } = await supabase
      .from("course")
      .update(updateData)
      .eq("code", code)
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
      level: data.recommended_level ?? 0, // Use 0 for electives (NULL recommended_level)
      course_type: data.is_elective ? "elective" : "required",
      created_at: data.created_at,
    };

    // Revalidate course-related caches after successful update
    revalidateCourses();

    return createSuccessResponse(course, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // Authenticate and check role
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling", "teaching_load"]);

    const { code } = await params;
    const supabase = await createClient();

    // Check if course exists
    const { data: existing, error: checkError } = await supabase
      .from("course")
      .select("code")
      .eq("code", code)
      .single();

    if (checkError || !existing) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        `Course with code '${code}' not found`
      );
    }

    // Get all sections for this course
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select("id")
      .eq("course_code", code);

    if (sectionsError) {
      throw sectionsError;
    }

    // If course has sections, delete them first (cascade delete)
    if (sections && sections.length > 0) {
      const sectionIds = sections.map(s => s.id);

      // Check if any sections have enrollments
      const { data: enrollments } = await supabase
        .from("student_enrollment")
        .select("id, section_id")
        .in("section_id", sectionIds)
        .eq("status", "registered")
        .limit(1);

      if (enrollments && enrollments.length > 0) {
        return createErrorResponse(
          409,
          ErrorCodes.VALIDATION_ERROR,
          `Cannot delete course '${code}' because it has sections with student enrollments. Remove enrollments first.`
        );
      }

      // Delete schedules for these sections
      await supabase
        .from("schedule")
        .delete()
        .in("section_id", sectionIds);

      // Delete all sections for this course
      const { error: deleteSectionsError } = await supabase
        .from("section")
        .delete()
        .eq("course_code", code);

      if (deleteSectionsError) {
        throw deleteSectionsError;
      }

      // Revalidate section and schedule caches
      const { revalidateSections, revalidateSchedules } = await import("@/lib/cache/revalidation");
      revalidateSections();
      revalidateSchedules();
    }

    // Delete course
    const { error } = await supabase
      .from("course")
      .delete()
      .eq("code", code);

    if (error) {
      throw error;
    }

    // Revalidate course-related caches after successful deletion
    revalidateCourses();

    const sectionsCount = sections?.length || 0;
    const message = sectionsCount > 0
      ? `Course '${code}' and ${sectionsCount} section${sectionsCount !== 1 ? 's' : ''} deleted successfully`
      : `Course '${code}' deleted successfully`;

    return createSuccessResponse({ message, sectionsDeleted: sectionsCount }, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
