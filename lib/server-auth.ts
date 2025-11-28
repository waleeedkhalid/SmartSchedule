/**
 * Server-Side Authentication Utilities
 * 
 * Helper functions for getting authenticated user information in server components.
 * Supports both demo accounts and Supabase production accounts.
 * 
 * Uses the standard Supabase SSR pattern: the server client automatically reads
 * session cookies, so we call `supabase.auth.getUser()` without arguments.
 * 
 * CRITICAL: Uses React.cache() to deduplicate multiple calls in the same request.
 * This ensures that layout + page + components all calling getServerUser() only
 * result in ONE database query per request, preventing infinite loops and reducing load.
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { mockUsers } from "@/lib/demo-data";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Gets the authenticated user from cookies (for server components)
 * Returns null if not authenticated
 * 
 * Uses the standard Supabase SSR pattern where the server client automatically
 * reads session cookies from the request. No manual token handling required.
 * 
 * CRITICAL: Wrapped with React.cache() to ensure only ONE fetch per request.
 * Multiple calls from layout, page, and components in the same render tree
 * will all share the same cached result, preventing duplicate database queries
 * and infinite redirect loops.
 */
export const getServerUser = cache(async (): Promise<ServerUser | null> => {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('demo_user_id')?.value;

  // Check for demo user first
  if (demoUserId) {
    const user = mockUsers.find(u => u.id === demoUserId);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  }

  // Check for real Supabase user using standard SSR pattern
  try {
    const supabase = await createClient();
    
    // Standard Supabase SSR pattern: getUser() without arguments
    // The client automatically reads session cookies from the request
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Fetch user role from user_roles table
    // Note: level column was removed in migration 20251030154649_simplify_user_roles_to_basics.sql
    let userRole;
    let roleError;
    
    try {
      const result = await supabase
        .from("user_roles")
        .select("role, name")
        .eq("user_id", user.id)
        .single();
      
      userRole = result.data;
      roleError = result.error;
    } catch (error) {
      // Catch any unexpected errors (network issues, etc.)
      console.warn('Unexpected error fetching user role in getServerUser:', error);
      return null;
    }

    // Handle errors gracefully
    if (roleError) {
      // PGRST116 is "not found" - expected for new users, don't log
      if (roleError.code !== 'PGRST116') {
        // Log other errors (400, RLS violations, etc.) but don't throw
        console.warn('Error fetching user role in getServerUser:', {
          code: roleError.code,
          message: roleError.message,
        });
      }
      return null;
    }

    if (!userRole) {
      return null;
    }

    // Ensure user has email (required for ServerUser interface)
    if (!user.email) {
      return null;
    }

    return {
      id: user.id,
      email: user.email, // Use email from auth user (source of truth)
      role: userRole.role,
      name: userRole.name, // Use name from user_roles (application-specific name)
      // Note: level was removed from user_roles table - student-specific data should be in student_profile table
    };
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
});

/**
 * Gets the dashboard path for a given role
 */
/**
 * Check if user has completed onboarding and has a valid profile
 * Redirects to onboarding if either check fails
 * 
 * @param userId - The user ID
 * @param role - The user's role
 * @returns Object with onboarding status and profile existence
 */
export async function validateOnboardingAndProfile(
  userId: string,
  role: string
): Promise<{ needsOnboarding: boolean; profileExists: boolean }> {
  const supabase = await createClient();
  
  // First check onboarding_completed flag in user_roles table
  // This is the primary source of truth for onboarding status
  const { data: userRole, error: userRoleError } = await supabase
    .from('user_roles')
    .select('onboarding_completed')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (userRoleError && userRoleError.code !== 'PGRST116') {
    console.warn('Error checking user_roles onboarding status:', userRoleError);
  }
  
  // If onboarding is already marked as completed, trust that
  if (userRole?.onboarding_completed === true) {
    return { needsOnboarding: false, profileExists: true };
  }
  
  // Otherwise, check profile existence based on role as a fallback
  // This handles cases where profile exists but flag wasn't set
  let profileExists = false;
  
  if (role === 'student') {
    const { data: studentProfile, error: studentError } = await supabase
      .from('student_profile')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    profileExists = !!studentProfile;
    if (studentError && studentError.code !== 'PGRST116') {
      console.warn('Error checking student profile:', studentError);
    }
  } else if (role === 'faculty') {
    const { data: facultyProfile, error: facultyError } = await supabase
      .from('faculty_profile')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    profileExists = !!facultyProfile;
    if (facultyError && facultyError.code !== 'PGRST116') {
      console.warn('Error checking faculty profile:', facultyError);
    }
  } else if (['scheduling', 'teaching_load', 'registrar'].includes(role)) {
    const { data: committeeProfile, error: committeeError } = await supabase
      .from('committee_profile')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    profileExists = !!committeeProfile;
    if (committeeError && committeeError.code !== 'PGRST116') {
      console.warn('Error checking committee profile:', committeeError);
    }
  }
  
  return { needsOnboarding: !profileExists, profileExists };
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'faculty':
      return '/dashboard/faculty';
    case 'scheduling':
      return '/dashboard/scheduling';
    case 'teaching_load':
      return '/dashboard/teaching-load';
    case 'registrar':
      return '/dashboard/registrar';
    default:
      return '/dashboard'; // Let dashboard page handle role detection
  }
}

