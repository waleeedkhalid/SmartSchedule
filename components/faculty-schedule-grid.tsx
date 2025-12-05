"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { FacultySection } from "@/lib/db/faculty/types";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

type TimeFormat = "12h" | "24h";

function parseTime(time: string | null | undefined): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(time: string, format: TimeFormat): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);

  if (format === "24h") {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function sectionOccupiesSlot(
  section: FacultySection,
  day: string,
  timeSlot: string
): boolean {
  const pattern = section.meeting_pattern;
  if (!pattern || !pattern.days?.includes(day) || !pattern.start) return false;

  const slotStart = parseTime(timeSlot);
  const slotEnd = slotStart + 60;
  const sectionStart = parseTime(pattern.start);
  const sectionEnd = sectionStart + (pattern.duration || 0);

  return slotStart < sectionEnd && sectionStart < slotEnd;
}

export function FacultyScheduleGrid({
  sections,
}: {
  sections: FacultySection[];
}) {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const schedulableSections = useMemo(
    () =>
      Array.isArray(sections) ? sections.filter((s) => s.meeting_pattern) : [],
    [sections]
  );

  if (!schedulableSections.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Teaching Schedule
          </CardTitle>
          <CardDescription>
            Your assigned sections will appear here once times are published.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No meeting times are available yet. Check back after your sections
            are scheduled.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Teaching Schedule
              </CardTitle>
              <CardDescription>
                Visual grid of your assigned sections; times shown in{" "}
                {timeFormat === "12h" ? "12-hour" : "24-hour"} format.
              </CardDescription>
            </div>
            <div className="flex items-center border rounded-lg overflow-hidden text-xs font-medium">
              <button
                className={`px-3 py-1.5 transition-colors ${
                  timeFormat === "12h"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setTimeFormat("12h")}
              >
                12h
              </button>
              <button
                className={`px-3 py-1.5 transition-colors ${
                  timeFormat === "24h"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
                onClick={() => setTimeFormat("24h")}
              >
                24h
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-2">
          <Badge className="bg-emerald-600">Released</Badge>
          <span className="text-muted-foreground">Published sections</span>
        </span>
        <span className="flex items-center gap-2">
          <Badge className="bg-amber-500">Draft</Badge>
          <span className="text-muted-foreground">Pending confirmation</span>
        </span>
        <span className="flex items-center gap-2">
          <Badge variant="outline">Lab</Badge>
          <span className="text-muted-foreground">Lab or practical</span>
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40">
                  <th className="border p-2 text-left w-24 text-sm font-medium">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="border p-2 text-center text-sm font-medium"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr
                    key={timeSlot}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/20"
                  >
                    <td className="border p-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatTime(timeSlot, timeFormat)}
                    </td>
                    {DAYS.map((day) => {
                      const sectionsInSlot = schedulableSections.filter(
                        (section) => sectionOccupiesSlot(section, day, timeSlot)
                      );

                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border p-1 align-top min-w-[140px]"
                        >
                          {sectionsInSlot.map((section) => {
                            const isReleased = section.state === "released";
                            const colorClass = isReleased
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800"
                              : "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800";
                            const pattern = section.meeting_pattern;

                            return (
                              <div
                                key={`${section.id}-${day}-${timeSlot}`}
                                className={`p-2 rounded border text-xs mb-1 last:mb-0 space-y-1 ${colorClass}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-[13px]">
                                    {section.course_code}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="h-5 px-2 text-[10px]"
                                  >
                                    Sec {section.section_no}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {pattern?.start
                                      ? formatTime(pattern.start, timeFormat)
                                      : "TBD"}
                                    {pattern?.duration
                                      ? ` • ${pattern.duration}m`
                                      : ""}
                                  </span>
                                </div>
                                {section.room_code && (
                                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{section.room_code}</span>
                                  </div>
                                )}
                                {section.activity === "lab" && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-[10px] w-fit"
                                  >
                                    Lab
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
