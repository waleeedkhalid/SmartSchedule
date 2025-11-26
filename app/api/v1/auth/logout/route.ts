/**
 * Authentication Logout Endpoint
 * 
 * POST /api/v1/auth/logout
 * 
 * Invalidates the user's session and clears authentication cookies.
 * This endpoint works identically for all clients - they just need to
 * send the Authorization header with their token.
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Try to authenticate (but don't fail if token is invalid - we still want to logout)
    let isDemo = false;
    try {
      const user = await authenticateRequest(request);
      const token = extractAuthToken(request);
      isDemo = token?.startsWith("demo:") === true;
    } catch (error) {
      // If authentication fails, we still proceed with logout
      // This handles cases where token is expired or invalid
      const token = extractAuthToken(request);
      isDemo = token?.startsWith("demo:") === true;
    }

    // Sign out from Supabase if it's a real token
    if (!isDemo) {
      try {
        const supabase = await createClient();
        await supabase.auth.signOut();
      } catch (error) {
        // Even if signOut fails, we consider logout successful
        console.error("Supabase signOut error:", error);
      }
    }

    // Clear authentication cookies
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('demo_user_id');
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    cookieStore.set('demo_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Fix: Use createSuccessResponse for consistency with other endpoints
    const response: LogoutResponse = {
      success: true,
      message: "Successfully logged out",
    };

    // Create response with cleared cookies using createSuccessResponse
    const nextResponse = createSuccessResponse(response, 200);
    
    // Clear cookies in response headers
    nextResponse.cookies.delete('auth_token');
    nextResponse.cookies.delete('demo_user_id');
    nextResponse.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    nextResponse.cookies.set('demo_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}

