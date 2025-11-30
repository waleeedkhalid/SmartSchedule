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

  // Reverse Check: If they ARE onboarded (metadata is true), kick them to dashboard
  if (user.user_metadata?.onboarding_completed === true) {
    redirect("/dashboard");
  }

  // SYNC CHECK: If metadata says false, but DB says true -> Fix metadata and redirect
  // This fixes the infinite loop for existing users who have profiles but missing metadata
  // Note: We check DB status first, then redirect outside try-catch to avoid catching NEXT_REDIRECT
  let shouldRedirectToDashboard = false;
  let syncError: Error | null = null;

  const { data: userRole, error: fetchError } = await supabase
    .from("user_roles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    // If no user_role record exists, user needs onboarding - this is expected
    if (fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.warn("Error fetching user role:", fetchError.message);
    }
  } else if (userRole?.onboarding_completed === true) {
    // User is already onboarded in DB, sync metadata and redirect
    try {
      await supabase.auth.updateUser({
        data: { onboarding_completed: true },
      });
    } catch (error) {
      syncError = error as Error;
      console.warn("Error syncing onboarding metadata:", syncError.message);
    }
    // Redirect even if metadata sync fails - DB is source of truth
    shouldRedirectToDashboard = true;
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
