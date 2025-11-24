/**
 * Authentication Login Endpoint
 * 
 * POST /api/v1/auth/login
 * 
 * Authenticates user credentials and returns JWT token.
 * This endpoint is platform-agnostic - any client (PWA, React Native, iOS, Android)
 * can use it by sending email/password and receiving a JWT token.
 */

import { NextRequest } from "next/server";
import { createClient } from "@/supabase/server";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api/error-handler";
import { verifyDemoCredentials } from "@/lib/demo-data";

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

    // Check for demo credentials first
    const demoAuth = verifyDemoCredentials(body.email, body.password);
    if (demoAuth.valid && demoAuth.user) {
      // Generate demo token (format: "demo:{user_id}")
      const demoToken = `demo:${demoAuth.user.id}`;

      const response: LoginResponse = {
        token: demoToken,
        user: {
          id: demoAuth.user.id,
          email: demoAuth.user.email,
          name: demoAuth.user.name,
          role: demoAuth.user.role,
          level: demoAuth.user.level ?? undefined,
        },
      };

      return createSuccessResponse(response, 200);
    }

    // Try real Supabase authentication
    const supabase = await createClient();

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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

    // Fetch user role information
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role, name, email, level")
      .eq("user_id", authData.user.id)
      .single();

    if (roleError || !userRole) {
      return createErrorResponse(
        403,
        "FORBIDDEN",
        "User role not found. Please complete onboarding."
      );
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

    // Return token and user info
    const response: LoginResponse = {
      token,
      user: {
        id: authData.user.id,
        email: userRole.email,
        name: userRole.name,
        role: userRole.role,
        level: userRole.level ?? undefined,
      },
    };

    return createSuccessResponse(response, 200);
  } catch (error) {
    return handleApiError(error);
  }
}

