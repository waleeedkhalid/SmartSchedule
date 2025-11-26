/**
 * Onboarding Page
 * 
 * Purpose: First-time user profile setup page
 * 
 * Route: /onboarding
 * 
 * Access Control:
 * - Requires authentication (redirects to /login if not logged in)
 * - Only accessible if onboarding_completed = FALSE
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

import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { createClient } from "@/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();
  
  // Not authenticated - redirect to login
  if (!user) {
    redirect("/login");
  }
  
  // Check if onboarding is already completed
  // CRITICAL FIX: Check BOTH onboarding_completed flag AND profile existence
  // This prevents redirect loops when flag is true but profile is missing
  // Uses idx_user_roles_onboarding partial index when onboarding_completed = FALSE
  const supabase = await createClient();
  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('onboarding_completed, role')
    .eq('user_id', user.id)
    .single();
  
  if (error || !userRole) {
    // If user_roles doesn't exist, show onboarding form
    // (This shouldn't happen, but handle gracefully)
  } else if (userRole.onboarding_completed) {
    // Flag is true - verify profile actually exists
    let profileExists = false;
    
    if (userRole.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      profileExists = !!studentProfile;
    } else if (userRole.role === 'faculty') {
      const { data: facultyProfile } = await supabase
        .from('faculty_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      profileExists = !!facultyProfile;
    } else if (['scheduling', 'teaching_load', 'registrar'].includes(userRole.role)) {
      const { data: committeeProfile } = await supabase
        .from('committee_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      profileExists = !!committeeProfile;
    }
    
    // Only redirect to dashboard if BOTH flag is true AND profile exists
    if (profileExists) {
      const dashboardRoute = userRole.role === 'student' 
        ? '/dashboard/student'
        : userRole.role === 'faculty'
        ? '/dashboard/faculty'
        : userRole.role === 'scheduling'
        ? '/dashboard/scheduling'
        : userRole.role === 'teaching_load'
        ? '/dashboard/teaching-load'
        : userRole.role === 'registrar'
        ? '/dashboard/registrar'
        : '/dashboard';
      
      redirect(dashboardRoute);
    } else {
      // Flag is true but profile is missing - reset flag to allow retry
      console.warn('Inconsistent onboarding state detected - flag is true but profile missing. Resetting flag.');
      await supabase
        .from('user_roles')
        .update({ onboarding_completed: false })
        .eq('user_id', user.id);
      // Continue to show onboarding form
    }
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

