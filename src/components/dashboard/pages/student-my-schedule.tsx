"use client";

import * as React from "react";
import { CalendarDays, Download, FileText } from "lucide-react";

import { studentSchedule } from "../../../data/mock";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { ScheduleGrid } from "../../ScheduleGrid";

// Use shared types from the project for correctness
import type {
  Schedule as FullSchedule,
  Course as CourseType,
  NormalizedTimeSlot as NormSlot,
  CourseSection,
  SectionTime,
} from "../../../types/course";

// Local aliases
// helper: convert minutes to HH:MM
function minutesToTimeString(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
const dayToNumber: Record<string, number> = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
};

function buildSchedule(): FullSchedule {
  // If multiple events share same course code + section + activity, merge slots
  const map = new Map<string, { course: CourseType; slots: NormSlot[] }>();

  for (const ev of studentSchedule) {
    const key = `${ev.course}|${ev.id || "S1"}|${ev.type}`;
    if (!map.has(key)) {
      const courseObj: CourseType = {
        courseId: 0,
        courseCode: ev.course,
        courseName: ev.title,
        section: ev.id || "S1",
        activity: ev.type,
        hours: "",
        status: "",
        sectionTimes: [],
        instructor: ev.instructor || "",
        examDay: "",
        examTime: "",
        examDate: (ev as unknown as Record<string, unknown>)?.examDate
          ? String((ev as unknown as Record<string, unknown>).examDate)
          : "---",
        sectionAllocations: "",
      };
      map.set(key, { course: courseObj, slots: [] });
    }
    const entry = map.get(key)!;
    const dayNum = dayToNumber[ev.day as keyof typeof dayToNumber];
    if (!dayNum) continue;
    entry.slots.push({
      day: dayNum,
      startMinutes: timeToMinutes(ev.start),
      endMinutes: timeToMinutes(ev.end),
    });
  }

  const sections: CourseSection[] = Array.from(map.values()).map((v, idx) => {
    const sectionTimes: SectionTime[] = v.slots.map((s) => ({
      day: String(s.day),
      time: `${minutesToTimeString(s.startMinutes)} - ${minutesToTimeString(
        s.endMinutes
      )}`,
    }));
    const courseWithTimes: CourseType = {
      ...v.course,
      courseId: idx + 1,
      sectionTimes,
    };
    return {
      course: courseWithTimes,
      normalizedSlots: v.slots,
    };
  });

  const allSlots = sections.flatMap((s) => s.normalizedSlots);
  const totalHours =
    Math.round(
      (allSlots.reduce((sum, s) => sum + (s.endMinutes - s.startMinutes), 0) /
        60) *
        100
    ) / 100;
  const daysUsed = Array.from(new Set(allSlots.map((s) => s.day)));
  const earliestStart = allSlots.length
    ? Math.min(...allSlots.map((s) => s.startMinutes))
    : 0;
  const latestEnd = allSlots.length
    ? Math.max(...allSlots.map((s) => s.endMinutes))
    : 0;

  const scheduleObj: FullSchedule = {
    id: "student-schedule",
    sections,
    score: 0,
    conflicts: [],
    metadata: {
      totalHours,
      daysUsed,
      earliestStart,
      latestEnd,
      totalGaps: 0,
    },
  };
  return scheduleObj;
}

export function StudentMySchedule() {
  const schedule = React.useMemo(() => buildSchedule(), []);
  const handleExport = React.useCallback((format: "csv" | "ics") => {
    console.info(`Exporting schedule as ${format}`);
    // Implement real export later
  }, []);

  return (
    <Card data-test="student-schedule-card">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarDays
                className="size-5 text-primary"
                aria-hidden="true"
              />
              Weekly schedule overview
            </CardTitle>
            <CardDescription>
              Conflicts are flagged inline. Use exports for advising or
              printing.
            </CardDescription>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              data-test="schedule-export-csv"
            >
              <FileText className="mr-2 size-4" aria-hidden="true" /> CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleExport("ics")}
              data-test="schedule-export-ics"
            >
              <Download className="mr-2 size-4" aria-hidden="true" /> ICS
            </Button>
          </div>
        </div>
        <div className="sm:hidden">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleExport("ics")}
            data-test="schedule-export-compact"
          >
            Export timetable
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScheduleGrid
          schedule={schedule}
          tutorialDarker
          // colorMap example (optional):
          // colorMap={{ CSC101: "bg-blue-100 border-blue-300 ..." }}
        />
      </CardContent>
    </Card>
  );
}
