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
import { createClient } from "@/supabase/server";
import { getStudentProfile } from "@/lib/db/student-profiles";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Not authenticated - redirect to login
  if (authError || !user) {
    redirect("/login");
  }
  
  // Get user's role from user_roles table
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, name')
    .eq('user_id', user.id)
    .maybeSingle();
  
  // User not found in user_roles table
  // This can happen if registration didn't complete properly
  if (roleError || !userRole) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Your account exists but your profile could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This usually happens if registration didn&apos;t complete properly. Please sign out and try registering again.
            </p>
            {roleError && (
              <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
                Error: {roleError.message}
              </div>
            )}
            <form action={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/register");
            }}>
              <Button type="submit" className="w-full">
                Sign Out and Register Again
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Check if user has role-specific profile data
  let needsOnboarding = false;
  
  if (userRole.role === 'student') {
    // Students need a student_profile record
    const studentProfile = await getStudentProfile(user.id);
    if (!studentProfile) {
      needsOnboarding = true;
    }
  } else if (userRole.role === 'faculty') {
    // Faculty need a faculty_profile record
    const facultyProfile = await db.facultyProfile.findUnique({
      where: { userId: user.id }
    });
    if (!facultyProfile) {
      needsOnboarding = true;
    }
  }
  // Other roles (scheduling, teaching_load, registrar) don't need separate profiles
  // They only need user_roles entry, which already exists
  
  // If profile exists, redirect to dashboard
  if (!needsOnboarding) {
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
  
  // User needs onboarding - show onboarding form
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-2xl">
        <OnboardingForm 
          userId={user.id} 
          userName={userRole.name} 
          userRole={userRole.role as 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar'} 
        />
      </div>
    </div>
  );
}

