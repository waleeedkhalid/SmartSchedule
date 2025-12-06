/**
 * Onboarding Page
 *
 * Purpose: First-time user profile setup page
 *
 * Route: /onboarding
 *
 * Access Control:
 * - Requires authentication (redirects to /login if not logged in)
 * - Only accessible if user profile doesn't exist (needs onboarding)
 * - Bypasses main dashboard redirect from middleware
 *
 * Flow:
 * 1. User logs in for first time
 * 2. Middleware detects incomplete onboarding
 * 3. User redirected here from middleware
 * 4. User completes onboarding form
 * 5. Profile updated in database
 * 6. User redirected to appropriate dashboard
 *
 * Data Collection:
 * - Students: academic level (determines required courses and schedule)
 * - Other roles: minimal setup (department already defaulted)
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { getServerUser } from "@/lib/server-auth";
import { OnboardingForm } from "@/components/onboarding-form";
import { OnboardingSkeleton } from "@/components/skeletons/OnboardingSkeleton";

// Force dynamic rendering - this page checks user onboarding status and redirects
// force-dynamic opts out of Full Route Cache, which is appropriate for user-specific flows
export const dynamic = "force-dynamic";

async function OnboardingContent() {
  // 1. Security & Onboarding Checks
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated - redirect to login
  if (!user) {
    redirect("/login");
  }

  // 2. Robust Onboarding Check
  // We must verify BOTH the flag and the actual profile existence to prevent infinite loops
  let shouldRedirectToDashboard = false;

  const { data: userRole, error: fetchError } = await supabase
    .from("user_roles")
    .select("onboarding_completed, role")
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    if (fetchError.code !== "PGRST116") {
      console.warn("Error fetching user role:", fetchError.message);
    }
  } else if (userRole?.onboarding_completed === true) {
    // Flag says completed, but we MUST verify profile exists
    // This prevents the "Dashboard -> Onboarding -> Dashboard" loop
    let profileExists = false;
    const role = userRole.role;

    if (role === "student") {
      const { data } = await supabase
        .from("student_profile")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      profileExists = !!data;
    } else if (role === "faculty") {
      const { data } = await supabase
        .from("faculty_profile")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      profileExists = !!data;
    } else if (["scheduling", "teaching_load", "registrar"].includes(role)) {
      const { data } = await supabase
        .from("committee_profile")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      profileExists = !!data;
    }

    if (profileExists) {
      // legitimate completion - sync metadata and redirect
      if (user.user_metadata?.onboarding_completed !== true) {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true },
        });
      }
      shouldRedirectToDashboard = true;
    } else {
      // DATA INCONSISTENCY DETECTED
      // Flag is true, but profile is missing.
      // We must RESET the flag so the user can onboard again.
      console.warn(
        `Inconsistency detected for user ${user.id}: onboarding_completed=true but ${role}_profile missing. Resetting flag.`
      );

      await supabase
        .from("user_roles")
        .update({ onboarding_completed: false })
        .eq("user_id", user.id);

      await supabase.auth.updateUser({
        data: { onboarding_completed: false },
      });

      // Do NOT redirect - let them fall through to the form
      shouldRedirectToDashboard = false;
    }
  }

  // Perform redirect outside try-catch to avoid catching NEXT_REDIRECT error
  if (shouldRedirectToDashboard) {
    redirect("/dashboard");
  }

  // 2. Get formatted user data for the form
  const serverUser = await getServerUser();

  if (!serverUser) {
    redirect("/login");
  }

  // Render onboarding form for users who need to complete onboarding
  return (
    <OnboardingForm
      userId={serverUser.id}
      userName={serverUser.name}
      userRole={
        serverUser.role as
        | "student"
        | "faculty"
        | "scheduling"
        | "teaching_load"
        | "registrar"
      }
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}
