import { redirect } from "next/navigation";
import { getServerUser, getDashboardPath, validateOnboardingAndProfile } from "@/lib/server-auth";

// Force dynamic rendering - this page redirects based on user role
// force-dynamic opts out of Full Route Cache, which is appropriate for user-specific redirects
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login
  // Note: Layout already handles this, but we keep it here for safety
  // If layout allows unauthenticated users through, this will catch it
  if (!user) {
    redirect('/login');
  }

  // CRITICAL: Check onboarding status before allowing access to any dashboard
  // Users must complete onboarding before accessing their dashboard
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(user.id, user.role);
  
  if (needsOnboarding || !profileExists) {
    redirect('/onboarding');
  }

  // Redirect to role-specific dashboard
  // This is the main purpose of this page - route users to their role dashboard
  // Middleware handles redirect loop detection and cookie clearing
  const dashboardPath = getDashboardPath(user.role);
  redirect(dashboardPath);
}
