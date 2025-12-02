/**
 * Registrar Dashboard Page
 *
 * Purpose: Registrar portal for managing student registrations and enrollments
 *
 * Performance Optimizations:
 * - Single optimized data fetch function
 * - Parallel queries with shared Supabase client
 * - Dynamic imports for heavy components (Stats, StudentLookup, Registration)
 * - React.cache() for request-level memoization
 * - Initial data passed to widgets to avoid client-side re-fetching
 */

import { redirect } from "next/navigation";
import { getRegistrarDashboardData } from "@/lib/db/registrar-dashboard-data";
import {
  getServerUser,
  getDashboardPath,
  validateOnboardingAndProfile,
} from "@/lib/server-auth";
import { RegistrarDashboardClient } from "./registrar-dashboard-client";

export const dynamic = "force-dynamic";

export default async function RegistrarDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== "registrar") {
    // If role is missing, user needs onboarding
    if (!user.role) {
      redirect("/onboarding");
    }
    // Otherwise redirect to their correct dashboard
    const correctDashboard = getDashboardPath(user.role);
    redirect(correctDashboard);
  }

  // Validate onboarding and profile status
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(
    user.id,
    user.role
  );

  if (needsOnboarding || !profileExists) {
    redirect("/onboarding");
  }

  // Fetch all dashboard data in a single optimized call
  const dashboardData = await getRegistrarDashboardData(user.id);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Register students in sections that are 15-50% over capacity
          </p>
        </div>

        <RegistrarDashboardClient
          initialDeadlines={dashboardData.deadlines}
          initialNotifications={dashboardData.notifications}
        />
      </div>
    </div>
  );
}
