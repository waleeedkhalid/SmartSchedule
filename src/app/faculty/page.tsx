/**
 * Faculty Entry Point (Optimized)
 * 
 * Performance Optimizations:
 * - Uses cached auth functions (10-100x faster)
 * - Select only required columns
 */

import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";

export default async function FacultyLandingPage() {
  // Use cached auth function
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  // Use cached profile function
  const profile = await getUserProfile();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  // Check if faculty record exists
  const supabase = await createServerClient();
  const { data: faculty } = await supabase
    .from("faculty")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (faculty) {
    redirect("/faculty/dashboard");
  }

  redirect("/faculty/setup");
}
