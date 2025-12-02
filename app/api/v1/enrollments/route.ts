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
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { extractJoinedRelation } from "@/lib/utils";

/**
 * Check if two time slots overlap
 * @deprecated Logic moved to database function register_student
 */
// Helper functions removed as they are now handled by the database

// GET - List user's enrollments
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only students can view enrollments
    requireRole(user, ["student"]);

    // Real Supabase mode only - no demo support
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const termId =
      searchParams.get("semester_id") || searchParams.get("term_id"); // Support both for backward compatibility

    // Get section IDs for the term (if term_id provided)
    let sectionIds: string[] | null = null;
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      sectionIds = (scheduleSections || []).map(
        (s: { section_id: string }) => s.section_id
      );
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

        sectionIds = (scheduleSections || []).map(
          (s: { section_id: string }) => s.section_id
        );
      }
    }

    // Build query for student enrollments
    // Uses indexes: idx_student_enrollment_student_id, idx_student_enrollment_status
    let query = supabase
      .from("student_enrollment")
      .select(
        `
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
      `
      )
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
    interface EnrollmentWithSection {
      id: string;
      student_id: string;
      section_id: string;
      status: string;
      enrolled_at: string;
      dropped_at: string | null;
      section?: {
        id: string;
        section_no: number;
        meeting_pattern: string;
        course?:
          | {
              code: string;
              title?: string;
              credits?: number;
              is_elective?: boolean;
            }
          | Array<{
              code: string;
              title?: string;
              credits?: number;
              is_elective?: boolean;
            }>;
        course_code?: string;
      };
    }
    const enrollments = (data || []).map(
      (enrollment: EnrollmentWithSection) => {
        const course = extractJoinedRelation(enrollment.section?.course);
        return {
          id: enrollment.id,
          student_id: enrollment.student_id,
          section_id: enrollment.section_id,
          course_code: course?.code || null, // Fix: course_code comes from section.course.code, not section.course_code
          enrollment_type: course?.is_elective ? "elective" : "required",
          status: enrollment.status === "registered" ? "enrolled" : "dropped",
          enrolled_at: enrollment.enrolled_at,
          dropped_at: enrollment.dropped_at,
          course: course
            ? {
                code: course.code,
                name: course.title || "",
                credits: course.credits || 0,
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
      }
    );

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
    const { section_id } = body;

    if (!section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "section_id is required"
      );
    }

    // Real Supabase mode only - no demo support
    const supabase = await createClient();

    // STEP 1: Check if registration is open
    const { data: registrationStatus, error: regError } = await supabase.rpc(
      "is_registration_open"
    );

    if (regError) {
      // Continue if function doesn't exist (backward compatibility)
      // Registration status check is optional - if RPC doesn't exist, allow registration
    } else if (!registrationStatus) {
      return createErrorResponse(
        403,
        ErrorCodes.VALIDATION_ERROR,
        "Registration is not currently open. Please check the academic timeline for registration dates."
      );
    }

    // Call the database function to handle registration with conflict checks
    const { data: result, error: rpcError } = await supabase.rpc(
      "register_student",
      {
        p_student_id: user.id,
        p_section_id: section_id,
      }
    );

    if (rpcError) {
      throw rpcError;
    }

    // Handle failure from DB function
    if (!result.success) {
      const msg = result.message || "Registration failed";
      let status = 400;

      if (msg.includes("Section not found")) status = 404;
      else if (
        msg.includes("Time conflict") ||
        msg.includes("Exam conflict") ||
        msg.includes("Section is full")
      )
        status = 409;
      else if (msg.includes("Credit limit")) status = 400;
      else if (msg.includes("Already enrolled")) status = 400;
      else if (msg.includes("Section is not released")) status = 403;

      return createErrorResponse(status, ErrorCodes.VALIDATION_ERROR, msg);
    }

    // Fetch the created enrollment to return it in the expected format
    const { data: enrollment, error: fetchError } = await supabase
      .from("student_enrollment")
      .select(
        `
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
      `
      )
      .eq("student_id", user.id)
      .eq("section_id", section_id)
      .eq("status", "registered")
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Map to API response format
    const enrollmentCourse = extractJoinedRelation(enrollment.section?.course);
    const isElective = enrollmentCourse?.is_elective || false;

    const mappedEnrollment = {
      id: enrollment.id,
      student_id: enrollment.student_id,
      section_id: enrollment.section_id,
      course_code: enrollmentCourse?.code || null,
      enrollment_type: isElective ? "elective" : "required",
      status: "enrolled",
      enrolled_at: enrollment.enrolled_at,
      dropped_at: enrollment.dropped_at,
      course: enrollmentCourse
        ? {
            code: enrollmentCourse.code,
            name: enrollmentCourse.title || "",
            credits: enrollmentCourse.credits || 0,
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
