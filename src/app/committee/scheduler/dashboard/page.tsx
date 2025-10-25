import { Metadata } from "next";
import SchedulerDashboardPageClient from "../SchedulerDashboardPageClient";

export const metadata: Metadata = {
  title: "Scheduler Dashboard | SmartSchedule",
  description: "Scheduling Committee Dashboard - Manage course schedules, sections, and academic planning",
};

/**
 * Scheduler Dashboard Page
 * Server component wrapper for the dashboard
 */
export default function SchedulerDashboardPage() {
  return <SchedulerDashboardPageClient />;
}

