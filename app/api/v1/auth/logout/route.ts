/**
 * Authentication Logout Endpoint
 * 
 * POST /api/v1/auth/logout
 * 
 * Invalidates the user's session.
 * This endpoint works identically for all clients - they just need to
 * send the Authorization header with their token.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate to get user (validates token)
    const user = await authenticateRequest(request);

    // Check if this is a demo token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const isDemo = token?.startsWith("demo:") === true;

    if (isDemo !== true) {
      // Only sign out from Supabase if it's a real token
      const supabase = await createClient();

      // Sign out the user
      const { error } = await supabase.auth.signOut();

      if (error) {
        // Even if signOut fails, we consider logout successful
        // (token will expire naturally)
        console.error("Logout error:", error);
      }
    }

    const response: LogoutResponse = {
      success: true,
      message: "Successfully logged out",
    };

    return createSuccessResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

