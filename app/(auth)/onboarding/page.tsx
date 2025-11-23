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
import { getMockUserRole } from "@/lib/demo-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage() {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();
  
  // Not authenticated - redirect to login
  if (!userRole) {
    redirect("/login");
  }
  
  // In demo mode, all users have completed onboarding
  // Redirect to appropriate dashboard
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

