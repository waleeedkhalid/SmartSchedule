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
  
  // Get user's role (profile presence)
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, name')
    .eq('user_id', user.id)
    .maybeSingle();
  
  // User not found in user_roles table
  // This can happen if registration didn't complete properly (RLS policy blocked INSERT)
  if (roleError || !userRole) {
    // Show error instead of redirecting to prevent infinite loop
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
              This usually happens if registration didn't complete properly. Please sign out and try registering again.
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
  
  // Profile exists: redirect straight to appropriate dashboard
  // (Onboarding is not required with current minimal schema)
  if (userRole) {
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
  
  // If we reached here, profile is missing - show helpful message
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
            This usually happens if registration didn't complete properly. Please sign out and try registering again.
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

