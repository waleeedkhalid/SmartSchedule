/**
 * Registrar Students API
 * 
 * GET /api/registrar/students - List all students (for selection)
 * Query params:
 * - search: Optional search term to filter students
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { getAllStudents } from "@/lib/db/registrar-data";

/**
 * GET - List all students
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, "registrar");

    const students = await getAllStudents();

    // Optional search filtering on server side
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search");

    let filteredStudents = students;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredStudents = students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.user_id.toLowerCase().includes(term) ||
          (s.level !== null && s.level.toString().includes(term))
      );
    }

    return createSuccessResponse(filteredStudents, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

