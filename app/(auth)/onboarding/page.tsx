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
import { getServerUser, validateOnboardingAndProfile, getDashboardPath } from "@/lib/server-auth";
import { OnboardingForm } from "@/components/onboarding-form";
import { OnboardingSkeleton } from "@/components/skeletons/OnboardingSkeleton";

// Force dynamic rendering - this page checks user onboarding status and redirects
// force-dynamic opts out of Full Route Cache, which is appropriate for user-specific flows
export const dynamic = 'force-dynamic';

async function OnboardingContent() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();
  
  // Not authenticated - redirect to login
  if (!user) {
    redirect("/login");
  }
  
  // Check if onboarding is already completed using profile existence
  // Onboarding is complete if the user has a profile for their role
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(user.id, user.role);
  
  // If onboarding is complete (profile exists), redirect to dashboard
  if (!needsOnboarding && profileExists) {
    const dashboardRoute = getDashboardPath(user.role);
    redirect(dashboardRoute);
  }
  
  // Render onboarding form for users who need to complete onboarding
  return (
    <OnboardingForm 
      userId={user.id}
      userName={user.name}
      userRole={user.role as 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar'}
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

