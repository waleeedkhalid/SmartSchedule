/**
 * Registrar Student Detail API
 * 
 * GET /api/registrar/students/[id] - Get detailed academic progress for a student
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError, createErrorResponse, ErrorCodes } from "@/lib/api/error-handler";
import { getStudentAcademicProgress } from "@/lib/db/registrar-data";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Get student academic progress
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, "registrar");

    const { id } = await params;
    const progress = await getStudentAcademicProgress(id);

    if (!progress) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Student not found"
      );
    }

    return createSuccessResponse(progress, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

