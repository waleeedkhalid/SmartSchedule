/**
 * Registration Status Endpoint
 * 
 * GET /api/v1/registration-status - Check if registration is currently open
 * 
 * Returns the registration status for the active semester.
 * All authenticated users can check registration status.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { getRegistrationStatus } from "@/lib/db/student-data";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);

    const status = await getRegistrationStatus();

    return createSuccessResponse(status, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
