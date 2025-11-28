/**
 * Schedule Status Endpoint
 * 
 * GET /api/v1/schedules/status - Get schedule generation status
 * 
 * Returns the current status of schedule assignments (draft sections, assigned, unassigned, released)
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { getScheduleStatus } from "@/lib/db/scheduling-stats";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);

    const status = await getScheduleStatus();

    return createSuccessResponse(status, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

