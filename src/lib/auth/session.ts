/**
 * Session Management Utilities
 * Handles session validation, refresh, and role encoding
 */

import type { Session, User } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/constants";

/**
 * Check if a session is expiring soon (within 10 minutes)
 */
export function isSessionExpiringSoon(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  const expiresAtMs = expiresAt * 1000; // Convert to milliseconds
  const now = Date.now();
  
  return expiresAtMs - now < TEN_MINUTES_MS;
}

/**
 * Validate that a user's email is confirmed
 */
export function validateEmailConfirmed(user: User): {
  valid: boolean;
  error?: string;
} {
  if (!user.email_confirmed_at) {
    return {
      valid: false,
      error: "Please verify your email address before signing in. Check your inbox for a verification link.",
    };
  }

  return { valid: true };
}

/**
 * Validate session and refresh if needed
 */
export async function validateAndRefreshSession(): Promise<{
  session: Session | null;
  user: User | null;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return { session: null, user: null, error: sessionError.message };
    }

    if (!session) {
      return { session: null, user: null };
    }

    // Refresh if expiring soon
    if (isSessionExpiringSoon(session.expires_at)) {
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("Session refresh error:", refreshError);
        return { session, user: session.user, error: refreshError.message };
      }

      if (refreshedSession) {
        return { 
          session: refreshedSession, 
          user: refreshedSession.user 
        };
      }
    }

    return { session, user: session.user };
  } catch (error) {
    console.error("Session validation error:", error);
    return { 
      session: null, 
      user: null, 
      error: error instanceof Error ? error.message : "Session validation failed" 
    };
  }
}

/**
 * Store role in user metadata for faster access
 */
export async function updateUserRole(role: UserRole): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase.auth.updateUser({
      data: { role },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update user role error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update role" 
    };
  }
}

/**
 * Get role from user metadata (cached in JWT)
 */
export function getRoleFromUser(user: User): UserRole | null {
  const role = user.user_metadata?.role as string | undefined;
  
  // Validate it's a valid role
  const validRoles: readonly string[] = [
    "student",
    "faculty",
    "scheduling_committee",
    "teaching_load_committee",
    "registrar",
  ];

  if (role && validRoles.includes(role)) {
    return role as UserRole;
  }

  return null;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<{
  session: Session | null;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session };
  } catch (error) {
    console.error("Refresh session error:", error);
    return { 
      session: null, 
      error: error instanceof Error ? error.message : "Failed to refresh session" 
    };
  }
}

