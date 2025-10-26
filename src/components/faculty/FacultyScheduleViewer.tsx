"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Calendar, Loader2, BookOpen } from "lucide-react";
import { ScheduleCalendarGrid } from "@/components/student/ScheduleCalendarGrid";
import type { ScheduleSection } from "@/types/schedule";
import {
  exportToPDF,
  downloadFile,
} from "@/lib/schedule/schedule-export";

interface FacultySection {
  section_id: string;
  course_code: string;
  course_name: string;
  credits?: number;
  room?: string;
  times: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

interface FacultySchedule {
  term: {
    code: string;
    name: string;
  };
  sections: FacultySection[];
  total_hours: number;
}

export function FacultyScheduleViewer() {
  const [schedule, setSchedule] = useState<FacultySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/faculty/schedule");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch schedule");
      }

      const data = await response.json();

      if (data.success) {
        setSchedule({
          term: data.term,
          sections: data.sections,
          total_hours: data.total_hours,
        });
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
      // Convert faculty sections to ScheduleSection format
      const scheduleSections: ScheduleSection[] = schedule.sections.map((section) => ({
        course_code: section.course_code,
        course_name: section.course_name || "",
        section_id: section.section_id,
        instructor: undefined, // Faculty viewing their own schedule
        room: section.room,
        type: "REQUIRED" as const, // Default type for faculty sections
        credits: section.credits,
        times: section.times,
      }));

      const blob = await exportToPDF(scheduleSections, {
        termName: schedule.term.name,
      });

      downloadFile(blob, `teaching-schedule-${schedule.term.code}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      setError("Failed to export PDF");
    }
  }

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
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!schedule || !schedule.sections || schedule.sections.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No teaching assignments for this term.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Convert to ScheduleSection format for calendar grid
  const scheduleSections: ScheduleSection[] = schedule.sections.map((section) => ({
    course_code: section.course_code,
    course_name: section.course_name || "",
    section_id: section.section_id,
    room: section.room,
    type: "REQUIRED" as const,
    credits: section.credits,
    times: section.times,
  }));

  return (
    <div className="space-y-4">
      {/* Header with teaching load summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Teaching Schedule - {schedule.term.name}</CardTitle>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{schedule.total_hours} hours per week</span>
                <span>•</span>
                <span>
                  {schedule.sections.length} section{schedule.sections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <ScheduleCalendarGrid sections={scheduleSections} />

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {schedule.sections.map((section) => (
              <div
                key={section.section_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {section.course_code} - {section.course_name}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Section: {section.section_id}
                    {section.room && ` • Room: ${section.room}`}
                    {section.credits && ` • ${section.credits} credits`}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {section.times.length} session{section.times.length !== 1 ? 's' : ''}/week
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

