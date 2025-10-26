"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AcademicTimelineVisualization } from "./AcademicTimelineVisualization";
import {
  mockTimelinePhases,
  mockAcademicEvents,
  mockAcademicTerm,
} from "@/lib/mock-data/scheduler-data";

/**
 * Timeline Management Page
 * Visualize and manage the academic timeline
 * 
 * Features:
 * - Phase tracking with progress
 * - Upcoming events and deadlines
 * - Task management within phases
 * 
 * TODO: Replace mock data with actual API calls when backend is ready
 */
export function TimelineManagementPage() {
  return (
    <div className="p-6">
      {/* Back to Dashboard Button */}
      <Link href="/committee/scheduler/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <AcademicTimelineVisualization
        phases={mockTimelinePhases}
        upcomingEvents={mockAcademicEvents}
        currentPhase={mockAcademicTerm.current_phase}
      />
    </div>
  );
}

