"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  sectionId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  roomId: number | null;
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleByDay {
  SUNDAY: ScheduleItem[];
  MONDAY: ScheduleItem[];
  TUESDAY: ScheduleItem[];
  WEDNESDAY: ScheduleItem[];
  THURSDAY: ScheduleItem[];
}

interface FacultyScheduleClientProps {
  schedule: ScheduleByDay;
}

const DAYS = [
  { key: "SUNDAY", label: "Sunday" },
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
] as const;

export default function FacultyScheduleClient({ schedule }: FacultyScheduleClientProps) {
  // ✅ OPTIMIZED: Use useMemo for computed values
  const hasSchedule = useMemo(() => {
    return Object.values(schedule).some((day) => day.length > 0);
  }, [schedule]);

  const sortedSchedule = useMemo(() => {
    const result: Record<string, ScheduleItem[]> = {};
    DAYS.forEach(({ key }) => {
      const daySchedule = schedule[key as keyof ScheduleByDay] || [];
      result[key] = [...daySchedule].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );
    });
    return result;
  }, [schedule]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Teaching Schedule</h1>
        <p className="text-muted-foreground">Your weekly teaching timetable</p>
      </div>

      {/* Schedule Grid */}
      {!hasSchedule ? (
        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Schedule Yet</h3>
              <p className="text-sm text-muted-foreground">
                Your teaching schedule will appear here once courses are assigned
                <br />
                and the academic schedule is published.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {DAYS.map(({ key, label }) => {
            const daySchedule = sortedSchedule[key] || [];

            return (
              <Card
                key={key}
                className={cn(
                  "border-2 transition-all",
                  daySchedule.length > 0
                    ? "bg-white dark:bg-gray-950 shadow-sm"
                    : "bg-muted/20 opacity-60"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      {label}
                    </CardTitle>
                    {daySchedule.length > 0 && (
                      <Badge variant="outline">
                        {daySchedule.length} {daySchedule.length === 1 ? "class" : "classes"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {daySchedule.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes scheduled
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {daySchedule.map((item, idx) => (
                        <div
                          key={`${item.sectionId}-${idx}`}
                          className="rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-base">
                                  {item.courseName}
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {item.courseCode} • {item.credits} credits
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {item.startTime} - {item.endTime}
                                  </span>
                                </div>
                                {item.roomId && (
                                  <Badge variant="secondary" className="text-xs">
                                    Room {item.roomId}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
