/**
 * Registrar Student Enrollments API
 *
 * GET /api/registrar/student-enrollments - List enrollments with filters
 * POST /api/registrar/student-enrollments - Create enrollment (manual registration)
 * DELETE /api/registrar/student-enrollments - Delete enrollment (drop)
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import {
  getStudentEnrollments,
  createStudentEnrollment,
  deleteStudentEnrollment,
} from "@/lib/db/registrar-data";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  section_id: z.string().uuid("Invalid section ID"),
});

/**
 * GET - List enrollments with filters
 * Query params:
 * - student_id: Filter by student
 * - status: Filter by status (registered | dropped)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, "registrar");

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const status = searchParams.get("status") as
      | "registered"
      | "dropped"
      | null;

    const filters: {
      student_id?: string;
      status?: "registered" | "dropped";
    } = {};

    if (studentId) {
      filters.student_id = studentId;
    }

    if (status && (status === "registered" || status === "dropped")) {
      filters.status = status;
    }

    const enrollments = await getStudentEnrollments(filters);

    return createSuccessResponse(enrollments, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST - Create enrollment (manual registration)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, "registrar");

    const body = await request.json();
    const validated = createEnrollmentSchema.parse(body);

    // Create enrollment (only allows 15-50% over capacity)
    const result = await createStudentEnrollment(
      validated.student_id,
      validated.section_id
    );

    // Invalidate caches
    revalidateTag("default", CACHE_TAGS.ENROLLMENTS);
    revalidateTag("default", CACHE_TAGS.STUDENT_ENROLLMENTS);

    return createSuccessResponse(result, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request data",
        error.errors
      );
    }

    // Handle specific enrollment errors
    if (error instanceof Error) {
      if (
        error.message.includes("capacity") ||
        error.message.includes("already enrolled") ||
        error.message.includes("not found")
      ) {
        return createErrorResponse(
          400,
          ErrorCodes.VALIDATION_ERROR,
          error.message
        );
      }
    }

    return handleApiError(error);
  }
}

/**
 * DELETE - Delete enrollment (drop)
 * Query params:
 * - enrollment_id: ID of enrollment to drop
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, "registrar");

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollment_id");

    if (!enrollmentId) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "enrollment_id query parameter is required"
      );
    }

    await deleteStudentEnrollment(enrollmentId);

    // Invalidate caches
    revalidateTag("default", CACHE_TAGS.ENROLLMENTS);
    revalidateTag("default", CACHE_TAGS.STUDENT_ENROLLMENTS);

    return createSuccessResponse(
      { message: "Enrollment dropped successfully" },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
