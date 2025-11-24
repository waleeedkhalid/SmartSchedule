/**
 * Get Current User Endpoint
 * 
 * GET /api/v1/auth/me
 * 
 * Returns the current authenticated user's profile and role.
 * This is used by clients to check authentication status and get user info.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  level?: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    const response: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
    };

    return createSuccessResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

