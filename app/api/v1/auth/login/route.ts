/**
 * Authentication Login Endpoint
 *
 * POST /api/v1/auth/login
 *
 * Authenticates user credentials and returns JWT token.
 * This endpoint is platform-agnostic - any client (PWA, React Native, iOS, Android)
 * can use it by sending email/password and receiving a JWT token.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { createErrorResponse, handleApiError } from "@/lib/api/error-handler";
import { cookies } from "next/headers";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    level?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate request body
    if (!body.email || !body.password) {
      return createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Email and password are required"
      );
    }

    // Authenticate with Supabase
    const supabase = await createClient();

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

    if (authError || !authData.user) {
      return createErrorResponse(
        401,
        "AUTH_INVALID",
        authError?.message || "Invalid email or password"
      );
    }

    // Fetch user role information with error handling
    let userRole;
    let roleError;

    try {
      const result = await supabase
        .from("user_roles")
        .select("role, name, email")
        .eq("user_id", authData.user.id)
        .single();

      userRole = result.data;
      roleError = result.error;
    } catch (error) {
      // Catch any unexpected errors (network issues, etc.)
      console.warn("Unexpected error fetching user role in login API:", error);
      return createErrorResponse(
        403,
        "FORBIDDEN",
        "User role not found. Please complete onboarding."
      );
    }

    // Handle errors gracefully
    if (roleError) {
      // Handle PGRST errors specifically - these are query/RLS issues
      if (roleError.code?.startsWith("PGRST")) {
        console.warn("user_roles query error (PGRST) in login API:", {
          code: roleError.code,
          message: roleError.message,
        });
      } else {
        console.warn("Error fetching user role in login API:", {
          code: roleError.code,
          message: roleError.message,
        });
      }
      return createErrorResponse(
        403,
        "FORBIDDEN",
        "User role not found. Please complete onboarding."
      );
    }

    if (!userRole) {
      return createErrorResponse(
        403,
        "FORBIDDEN",
        "User role not found. Please complete onboarding."
      );
    }

    // Fetch student level from student_profile if user is a student
    let studentLevel: number | undefined = undefined;
    if (userRole.role === "student") {
      const { data: studentProfile } = await supabase
        .from("student_profile")
        .select("level")
        .eq("user_id", authData.user.id)
        .single();

      if (studentProfile) {
        studentLevel = studentProfile.level;
      }
    }

    // Get the session token (JWT)
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return createErrorResponse(
        500,
        "INTERNAL_ERROR",
        "Failed to generate authentication token"
      );
    }

    const cookieStore = await cookies();

    // Set auth_token cookie for middleware access (legacy flow)
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // NEW AUTH: Also create application session cookie if USE_NEW_AUTH is enabled
    if (process.env.USE_NEW_AUTH === "true") {
      const { createSession } = await import("@/lib/session");
      await createSession(authData.user.id, userRole.role);
    }

    // Return token and user info
    const response: LoginResponse = {
      token,
      user: {
        id: authData.user.id,
        email: userRole.email,
        name: userRole.name,
        role: userRole.role,
        level: studentLevel,
      },
    };

    const nextResponse = NextResponse.json({
      success: true,
      data: response,
    });

    // Also set cookie in response headers
    nextResponse.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
