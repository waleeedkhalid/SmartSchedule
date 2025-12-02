import { redirect } from "next/navigation";
import {
  getServerUser,
  getDashboardPath,
  validateOnboardingAndProfile,
} from "@/lib/server-auth";
import { getTeachingLoadDashboardData } from "@/lib/db/teaching-load-dashboard-data";
import { TeachingLoadDashboardClient } from "./teaching-load-dashboard-client";

export default async function TeachingLoadDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Validate role
  if (!user.role || user.role !== "teaching_load") {
    if (!user.role) {
      redirect("/onboarding");
    }
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

  // Fetch all dashboard data in parallel using optimized function
  const dashboardData = await getTeachingLoadDashboardData();

  return (
    <TeachingLoadDashboardClient
      instructorsCount={dashboardData.instructorsCount}
      sectionsCount={dashboardData.sectionsCount}
      coursesCount={dashboardData.coursesCount}
      normalizedSections={dashboardData.normalizedSections}
      instructorsList={dashboardData.instructorsList}
      roomsList={dashboardData.roomsList}
    />
  );
}
