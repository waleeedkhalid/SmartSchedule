/**
 * Enrollments Endpoint
 * 
 * GET /api/v1/enrollments - Get user's enrollments
 * POST /api/v1/enrollments - Register for a section
 * 
 * Handles student enrollment operations.
 * Students can only view and manage their own enrollments.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { getMockEnrollmentsWithDetails, mockSections, mockCourses } from "@/lib/demo-data";

// GET - List user's enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can view enrollments (or they can view their own)
    if (user.role !== "student") {
      requireRole(user, ["student"]);
    }

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      const enrollments = await getMockEnrollmentsWithDetails(user.id);
      
      // Map to API response format
      const mappedEnrollments = enrollments.map((enrollment) => ({
        id: enrollment.id,
        student_id: enrollment.student_id,
        section_id: enrollment.section_id,
        course_code: enrollment.section?.course?.code || null,
        academic_semester_id: "demo-semester",
        enrollment_type: enrollment.section?.course?.is_elective ? "elective" : "required",
        status: enrollment.status === "registered" ? "enrolled" : "dropped",
        enrolled_at: enrollment.enrolled_at,
        dropped_at: enrollment.dropped_at,
        course: enrollment.section?.course
          ? {
              code: enrollment.section.course.code,
              name: enrollment.section.course.title,
              credits: enrollment.section.course.credits,
            }
          : null,
        section: enrollment.section
          ? {
              id: enrollment.section.id,
              section_no: enrollment.section.section_no,
              meeting_pattern: enrollment.section.meeting_pattern,
            }
          : null,
      }));

      return createSuccessResponse(mappedEnrollments, 200);
    }

    // Handle real Supabase mode
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get("semester_id");

    // Build query for student enrollments
    let query = supabase
      .from("student_enrollment")
      .select(`
        *,
        section:section_id (
          *,
          course:course_code (
            code,
            title,
            credits
          )
        )
      `)
      .eq("student_id", user.id);

    // Filter by semester if provided
    if (semesterId) {
      query = query.eq("academic_semester_id", semesterId);
    } else {
      // Default to current semester
      const { data: currentSemester } = await supabase
        .from("academic_semesters")
        .select("id")
        .eq("is_current", true)
        .single();

      if (currentSemester) {
        query = query.eq("academic_semester_id", currentSemester.id);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Map to API response format
    const enrollments = (data || []).map((enrollment: any) => ({
      id: enrollment.id,
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      course_code: enrollment.section?.course_code,
      academic_semester_id: enrollment.academic_semester_id,
      enrollment_type: enrollment.enrollment_type,
      status: enrollment.status,
      enrolled_at: enrollment.enrolled_at,
      dropped_at: enrollment.dropped_at,
      course: enrollment.section?.course
        ? {
            code: enrollment.section.course.code,
            name: enrollment.section.course.title,
            credits: enrollment.section.course.credits,
          }
        : null,
      section: enrollment.section
        ? {
            id: enrollment.section.id,
            section_no: enrollment.section.section_no,
            meeting_pattern: enrollment.section.meeting_pattern,
          }
        : null,
    }));

    return createSuccessResponse(enrollments, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Register for a section
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can enroll
    requireRole(user, ["student"]);

    const body = await request.json();
    const { section_id, semester_id } = body;

    if (!section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "section_id is required"
      );
    }

    // Check if this is a demo token
    const token = extractAuthToken(request);
    const isDemo = token?.startsWith("demo:") === true;

    // Handle demo mode
    if (isDemo === true) {
      // In demo mode, simulate enrollment creation
      // Check if section exists in mock data
      const section = mockSections.find(s => s.id === section_id);
      if (!section) {
        return createErrorResponse(
          404,
          ErrorCodes.NOT_FOUND,
          "Section not found"
        );
      }

      // Check if already enrolled
      const existingEnrollments = await getMockEnrollmentsWithDetails(user.id);
      const alreadyEnrolled = existingEnrollments.some(e => e.section_id === section_id && e.status === "registered");
      
      if (alreadyEnrolled) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Already enrolled in this section"
        );
      }

      // Create mock enrollment
      const course = mockCourses.find(c => c.code === section.course_code);
      const newEnrollment = {
        id: `enrollment-${Date.now()}`,
        student_id: user.id,
        section_id: section_id,
        course_code: section.course_code,
        academic_semester_id: semester_id || "demo-semester",
        enrollment_type: course?.is_elective ? "elective" : "required",
        status: "enrolled",
        enrolled_at: new Date().toISOString(),
        dropped_at: null,
        course: course ? {
          code: course.code,
          name: course.title,
          credits: course.credits,
        } : null,
        section: {
          id: section.id,
          section_no: section.section_no,
          meeting_pattern: section.meeting_pattern,
        },
      };

      return createSuccessResponse(newEnrollment, 201);
    }

    // Handle real Supabase mode
    const supabase = await createClient();

    // Determine semester_id (use provided or current)
    let finalSemesterId = semester_id;
    if (!finalSemesterId) {
      const { data: currentSemester } = await supabase
        .from("academic_semesters")
        .select("id")
        .eq("is_current", true)
        .single();

      if (!currentSemester) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "No current semester found. Please specify semester_id."
        );
      }
      finalSemesterId = currentSemester.id;
    }

    // Check if section exists and get course info
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select("course_code, is_elective")
      .eq("id", section_id)
      .single();

    if (sectionError || !section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Section not found"
      );
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("student_enrollment")
      .select("id")
      .eq("student_id", user.id)
      .eq("section_id", section_id)
      .eq("status", "enrolled")
      .single();

    if (existing) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Already enrolled in this section"
      );
    }

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("student_enrollment")
      .insert({
        student_id: user.id,
        section_id: section_id,
        academic_semester_id: finalSemesterId,
        enrollment_type: section.is_elective ? "elective" : "required",
        status: "enrolled",
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      throw enrollError;
    }

    return createSuccessResponse(enrollment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

