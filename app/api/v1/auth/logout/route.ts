/**
 * Authentication Logout Endpoint
 *
 * POST /api/v1/auth/logout
 *
 * Invalidates the user's session and clears authentication cookies.
 * This endpoint works identically for all clients - they just need to
 * send the Authorization header with their token.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, extractAuthToken } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAMES } from "@/lib/utils/cookie-utils";

interface LogoutResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    // Try to authenticate (but don't fail if token is invalid - we still want to logout)
    let isDemo = false;
    try {
      await authenticateRequest(request);
      const token = extractAuthToken(request);
      isDemo = token?.startsWith("demo:") === true;
    } catch {
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
      } catch {
        // Even if signOut fails, we consider logout successful
        // Error is logged by Supabase client
      }
    }

    // Clear all authentication cookies (custom and Supabase)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Get all cookies to find Supabase cookies
    const cookiesToClear: string[] = [...AUTH_COOKIE_NAMES];

    // Also find any cookies that match Supabase patterns
    allCookies.forEach((cookie) => {
      if (
        (cookie.name.startsWith("sb-") || cookie.name.includes("supabase")) &&
        !cookiesToClear.includes(cookie.name)
      ) {
        cookiesToClear.push(cookie.name);
      }
    });

    // NEW AUTH: Also delete the application session cookie
    if (!cookiesToClear.includes("session")) {
      cookiesToClear.push("session");
    }

    // NEW AUTH: Delete session using the session module if enabled
    if (process.env.USE_NEW_AUTH === "true") {
      try {
        const { deleteSession } = await import("@/lib/session");
        await deleteSession();
      } catch {
        // If deleteSession fails, we still continue with manual cleanup
      }
    }

    // Clear each cookie by deleting and setting to empty with maxAge: 0
    cookiesToClear.forEach((cookieName) => {
      cookieStore.delete(cookieName);
      cookieStore.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    });

    // Fix: Use createSuccessResponse for consistency with other endpoints
    const response: LogoutResponse = {
      success: true,
      message: "Successfully logged out",
    };

    // Create response with cleared cookies using createSuccessResponse
    const nextResponse = createSuccessResponse(response, 200);

    // Clear all cookies in response headers (ensures browser removes them)
    cookiesToClear.forEach((cookieName) => {
      nextResponse.cookies.delete(cookieName);
      nextResponse.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
    });

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
