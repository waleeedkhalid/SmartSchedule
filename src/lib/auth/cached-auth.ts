/**
 * Cached authentication utilities
 * Implements React.cache() pattern from performance.md for request-level memoization
 */

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import type { UserRole } from "@/lib/auth/redirect-by-role";

interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string | null;
  email?: string | null;
}

/**
 * Get authenticated user (memoized per request)
 */
export const getAuthenticatedUser = cache(async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Get user profile (memoized per request)
 */
export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: profile } = await supabase
    .from("users")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    role: (profile.role ?? user.user_metadata?.role) as UserRole,
    full_name: profile.full_name,
    email: profile.email,
  };
});

/**
 * Get committee membership (memoized per request)
 */
export const getCommitteeMembership = cache(async (userId: string) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: membership } = await supabase
    .from("committee_members")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  return membership;
});

/**
 * Check if user has specific role (memoized per request)
 */
export const hasRole = cache(async (requiredRole: UserRole): Promise<boolean> => {
  const profile = await getUserProfile();
  return profile?.role === requiredRole;
});

/**
 * Check if user is committee member (memoized per request)
 */
export const isCommitteeMember = cache(async (): Promise<boolean> => {
  const profile = await getUserProfile();
  
  if (!profile) {
    return false;
  }

  const committeeRoles: UserRole[] = [
    "scheduling_committee",
    "teaching_load_committee",
    "registrar",
  ];

  return committeeRoles.includes(profile.role);
});

