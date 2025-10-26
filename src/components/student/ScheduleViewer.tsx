"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Calendar, Loader2 } from "lucide-react";
import type { StudentSchedule, ScheduleSection } from "@/types/schedule";
import { ScheduleCalendarGrid } from "./ScheduleCalendarGrid";
import {
  exportToPDF,
  exportToICal,
  downloadFile,
  downloadTextFile,
} from "@/lib/schedule/schedule-export";

export function ScheduleViewer() {
  const [schedule, setSchedule] = useState<StudentSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/student/schedule");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch schedule");
      }

      const data = await response.json();

      if (data.success && data.schedule) {
        setSchedule(data.schedule);
      } else {
        setError("No schedule data available");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!schedule || !schedule.sections) return;

    try {
      const blob = await exportToPDF(schedule.sections, {
        termName: schedule.term_code,
      });

      downloadFile(blob, `schedule-${schedule.term_code}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      setError("Failed to export PDF");
    }
  }

  function handleExportICal() {
    if (!schedule || !schedule.sections) return;

    try {
      // Calculate term dates (approximate - should come from term data)
      const now = new Date();
      const termStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const termEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0);

      const icalContent = exportToICal(schedule.sections, {
        termStartDate: termStart.toISOString().split("T")[0],
        termEndDate: termEnd.toISOString().split("T")[0],
      });

      downloadTextFile(
        icalContent,
        `schedule-${schedule.term_code}.ics`,
        "text/calendar"
      );
    } catch (err) {
      console.error("Failed to export iCal:", err);
      setError("Failed to export iCal");
    }
  }

  // Calculate total credits
  const totalCredits =
    schedule?.sections.reduce((sum, section) => sum + (section.credits || 0), 0) || 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading schedule...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.toLowerCase().includes("no published schedule")
            ? "No published schedule found for the current term."
            : error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!schedule || !schedule.sections || schedule.sections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No courses in your schedule yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with metadata and export buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Schedule - {schedule.term_code}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCredits} Credit Hours | {schedule.sections.length} Courses
                {schedule.version && ` | Version ${schedule.version}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportICal}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Export iCal
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <ScheduleCalendarGrid sections={schedule.sections} />
    </div>
  );
}

