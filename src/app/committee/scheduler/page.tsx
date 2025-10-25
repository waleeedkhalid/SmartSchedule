import { redirect } from "next/navigation";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import {
  getAuthenticatedUser,
  getUserProfile,
  getCommitteeMembership,
} from "@/lib/auth/cached-auth";

const DASHBOARD_PATH = "/committee/scheduler/dashboard";
const SETUP_PATH = "/committee/scheduler/setup";

/**
 * Scheduler Landing Page - Server Component
 * Optimized with React.cache() for request-level memoization (performance.md)
 */
export default async function SchedulerLandingPage() {
  // Use cached authentication functions - these will be deduplicated
  // if called multiple times in the same request
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();

  if (profile?.role !== "scheduling_committee") {
    redirect(redirectByRole(profile?.role));
  }

  const membership = await getCommitteeMembership(user.id);

  if (!membership) {
    redirect(SETUP_PATH);
  }

  redirect(DASHBOARD_PATH);
}
