import { Metadata } from "next";
import { SchedulerFeaturesDemo } from "./SchedulerFeaturesDemo";

export const metadata: Metadata = {
  title: "Scheduler Features Demo | SmartSchedule",
  description: "Demo of scheduler features for committee members",
};

/**
 * Scheduler Features Demo Page
 * Showcases all the new scheduler UI components
 */
export default function SchedulerFeaturesDemoPage() {
  return <SchedulerFeaturesDemo />;
}

