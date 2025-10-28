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
 * - Students: academic level, enrollment year, expected graduation (optional)
 * - Other roles: minimal setup (department already defaulted)
 */

import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Not authenticated - redirect to login
  if (authError || !user) {
    redirect("/login");
  }
  
  // Get user's role and onboarding status
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, name, onboarding_completed, level, enrollment_year')
    .eq('user_id', user.id)
    .single();
  
  // User not found in user_roles table
  if (roleError || !userRole) {
    redirect("/login");
  }
  
  // Already completed onboarding - redirect to dashboard
  // This prevents users from accessing /onboarding directly after setup
  if (userRole.onboarding_completed) {
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
  }
  
  // Render onboarding form
  // This is a client component that handles the actual form and submission
  return (
    <OnboardingForm 
      userId={user.id}
      userName={userRole.name}
      userRole={userRole.role}
    />
  );
}

