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
    const termId = searchParams.get("semester_id") || searchParams.get("term_id"); // Support both for backward compatibility

    // Get section IDs for the term (if term_id provided)
    let sectionIds: string[] | null = null;
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      sectionIds = (scheduleSections || []).map((s: any) => s.section_id);
    } else {
      // Default to current active term
      const { data: currentTerm } = await supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (currentTerm) {
        const { data: scheduleSections } = await supabase
          .from("schedule")
          .select("section_id")
          .eq("term_id", currentTerm.id);

        sectionIds = (scheduleSections || []).map((s: any) => s.section_id);
      }
    }

    // Build query for student enrollments
    // Uses indexes: idx_student_enrollment_student_id, idx_student_enrollment_status
    let query = supabase
      .from("student_enrollment")
      .select(`
        *,
        section:section_id (
          *,
          course:course_code (
            code,
            title,
            credits,
            is_elective
          )
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "registered");

    // Filter by term if section IDs are available
    // Uses idx_student_enrollment_section_id index
    if (sectionIds && sectionIds.length > 0) {
      query = query.in("section_id", sectionIds);
    } else if (sectionIds !== null && sectionIds.length === 0) {
      // Term exists but has no sections
      return createSuccessResponse([], 200);
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
      course_code: enrollment.section?.course?.code || null, // Fix: course_code comes from section.course.code, not section.course_code
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

    // Check if section exists and get course info
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select(`
        course_code,
        course:course_code (
          is_elective
        )
      `)
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
    // Uses indexes: idx_student_enrollment_student_id, idx_student_enrollment_section_id, idx_student_enrollment_status
    const { data: existing } = await supabase
      .from("student_enrollment")
      .select("id")
      .eq("student_id", user.id)
      .eq("section_id", section_id)
      .eq("status", "registered")
      .single();

    if (existing) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Already enrolled in this section"
      );
    }

    // Determine if course is elective
    // Fix: course is an array from the query, get first element
    const course = Array.isArray(section.course) ? section.course[0] : section.course;
    const isElective = course?.is_elective || false;

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("student_enrollment")
      .insert({
        student_id: user.id,
        section_id: section_id,
        status: "registered",
      })
      .select(`
        *,
        section:section_id (
          *,
          course:course_code (
            code,
            title,
            credits,
            is_elective
          )
        )
      `)
      .single();

    if (enrollError) {
      throw enrollError;
    }

    // Map to API response format
    const mappedEnrollment = {
      id: enrollment.id,
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      course_code: enrollment.section?.course?.code || null, // Fix: course_code comes from section.course.code, not section.course_code
      enrollment_type: isElective ? "elective" : "required",
      status: "enrolled",
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
    };

    return createSuccessResponse(mappedEnrollment, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

