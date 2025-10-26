import { Metadata } from "next";
import { TimelineManagementPage } from "@/components/committee/scheduler/timeline-v2";

export const metadata: Metadata = {
  title: "Academic Timeline | SmartSchedule",
  description: "Track phases, milestones, and deadlines",
};

/**
 * Academic Timeline Route
 * Committee interface for managing academic timeline
 */
export default function SchedulerTimelinePage() {
  return <TimelineManagementPage />;
}

