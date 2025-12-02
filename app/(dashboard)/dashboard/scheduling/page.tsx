/**
 * Scheduling Dashboard Page
 *
 * Purpose: Scheduling committee portal for managing schedules, conflicts, and analytics
 *
 * Performance Optimizations:
 * - Single optimized data fetch function
 * - Parallel queries with shared Supabase client
 * - Dynamic imports for heavy components (ScheduleGenerator, Charts)
 * - React.cache() for request-level memoization
 * - Initial data passed to widgets to avoid client-side re-fetching
 */

import { redirect } from "next/navigation";
import { getSchedulingDashboardData } from "@/lib/db/scheduling-dashboard-data";
import {
  getServerUser,
  getDashboardPath,
  validateOnboardingAndProfile,
} from "@/lib/server-auth";
import { SchedulingDashboardClient } from "./scheduling-dashboard-client";

export const dynamic = "force-dynamic";

export default async function SchedulingDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== "scheduling") {
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
  const dashboardData = await getSchedulingDashboardData(user.id);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scheduling Committee Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate schedules, manage conflicts, and visualize data insights
          </p>
        </div>

        <SchedulingDashboardClient
          stats={dashboardData.stats}
          scheduleStatus={dashboardData.scheduleStatus}
          initialDeadlines={dashboardData.deadlines}
          initialNotifications={dashboardData.notifications}
        />
      </div>
    </div>
  );
}
