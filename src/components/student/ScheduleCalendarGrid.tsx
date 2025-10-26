"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScheduleSection } from "@/types/schedule";
import { cn } from "@/lib/utils";

export interface ScheduleCalendarGridProps {
  sections: ScheduleSection[];
}

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
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

export function ScheduleCalendarGrid({ sections }: ScheduleCalendarGridProps) {
  // Create a map of day -> time -> sections
  const scheduleMap = new Map<string, Map<string, ScheduleSection[]>>();

  // Populate the schedule map
  sections.forEach((section) => {
    section.times.forEach((time) => {
      if (!scheduleMap.has(time.day)) {
        scheduleMap.set(time.day, new Map());
      }

      const dayMap = scheduleMap.get(time.day)!;
      const startHour = time.start_time.split(":")[0];
      const timeKey = `${startHour}:00`;

      if (!dayMap.has(timeKey)) {
        dayMap.set(timeKey, []);
      }

      dayMap.get(timeKey)!.push(section);
    });
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row - Days */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground text-center py-2">
                Time
              </div>
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-sm font-medium text-center py-2 bg-muted rounded-t-md"
                >
                  {day.charAt(0) + day.slice(1).toLowerCase()}
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="space-y-1">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-6 gap-2">
                  {/* Time Label */}
                  <div className="text-xs text-muted-foreground text-center py-4 flex items-center justify-center">
                    {time}
                  </div>

                  {/* Day Cells */}
                  {DAYS.map((day) => {
                    const dayMap = scheduleMap.get(day);
                    const coursesAtTime = dayMap?.get(time) || [];

                    return (
                      <div
                        key={`${day}-${time}`}
                        className="min-h-[80px] border rounded-md p-2 bg-background"
                      >
                        {coursesAtTime.map((section, idx) => {
                          const timeSlot = section.times.find(
                            (t) => t.day === day && t.start_time.startsWith(time.split(":")[0])
                          );

                          return (
                            <div
                              key={`${section.section_id}-${idx}`}
                              className={cn(
                                "p-2 rounded-md text-xs mb-1 border-l-4",
                                section.type === "REQUIRED"
                                  ? "bg-blue-50 border-l-blue-500 text-blue-900 dark:bg-blue-950 dark:text-blue-100 required"
                                  : "bg-green-50 border-l-green-500 text-green-900 dark:bg-green-950 dark:text-green-100 elective"
                              )}
                            >
                              <div className="font-semibold">{section.course_code}</div>
                              <div className="text-[10px] opacity-90 truncate">
                                {section.course_name}
                              </div>
                              {timeSlot && (
                                <div className="text-[10px] mt-1 opacity-75">
                                  {timeSlot.start_time} - {timeSlot.end_time}
                                </div>
                              )}
                              {section.room && (
                                <div className="text-[10px] opacity-75">
                                  {section.room}
                                </div>
                              )}
                              {section.instructor && (
                                <div className="text-[10px] opacity-75 truncate">
                                  {section.instructor}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm">Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm">Elective</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

