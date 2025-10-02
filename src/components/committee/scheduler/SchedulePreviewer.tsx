"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import type { GeneratedSchedule } from "@/lib/schedule-generator";

export interface SchedulePreviewerProps {
  schedules: GeneratedSchedule[];
  generationStats?: {
    totalCombinations: number;
    validCount: number;
    generationMs: number;
    coursesCount: number;
  };
}

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
  "18:00",
  "19:00",
  "20:00",
];

export function SchedulePreviewer({
  schedules,
  generationStats,
}: SchedulePreviewerProps): React.ReactElement {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            No schedules generated yet
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Select courses to generate schedules
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Choose courses from the editor above and click &quot;Generate
              Schedules&quot; to see all possible conflict-free schedule options
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSchedule = schedules[currentIndex];

  // Build a grid structure for display
  interface ClassEntry {
    courseCode: string;
    instructor: string;
    room: string;
    startTime: string;
    endTime: string;
  }
  const gridData = new Map<string, Map<string, ClassEntry[]>>();

  for (const option of currentSchedule.options) {
    for (const section of option.sections) {
      for (const time of section.times) {
        const day = time.day;
        if (!gridData.has(day)) {
          gridData.set(day, new Map());
        }

        const timeKey = time.start;
        const dayMap = gridData.get(day)!;
        if (!dayMap.has(timeKey)) {
          dayMap.set(timeKey, []);
        }

        dayMap.get(timeKey)!.push({
          courseCode: section.courseCode,
          instructor: section.instructor,
          room: section.room,
          startTime: time.start,
          endTime: time.end,
        });
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Schedule Preview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Viewing all possible conflict-free schedules
            </p>
          </div>

          {generationStats && (
            <div className="flex gap-2">
              <Badge variant="outline">
                {generationStats.validCount} valid schedules
              </Badge>
              <Badge variant="secondary">
                {generationStats.generationMs}ms
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-center">
            <div className="text-lg font-semibold">
              Schedule {currentIndex + 1} of {schedules.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentSchedule.totalCredits} total credits
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentIndex(Math.min(schedules.length - 1, currentIndex + 1))
            }
            disabled={currentIndex === schedules.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Course List */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-medium mb-3">Courses in this schedule:</h4>
          <div className="grid grid-cols-2 gap-2">
            {currentSchedule.options.map((option) => (
              <div key={option.courseCode} className="flex items-center gap-2">
                <Badge>{option.courseCode}</Badge>
                <span className="text-sm truncate">{option.courseName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium w-24">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </th>
                  {DAYS_ORDER.map((day) => (
                    <th
                      key={day}
                      className="border p-2 text-center font-medium"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-muted/50">
                    <td className="border p-2 text-sm text-muted-foreground font-mono">
                      {timeSlot}
                    </td>
                    {DAYS_ORDER.map((day) => {
                      const dayMap = gridData.get(day);
                      const classes = dayMap?.get(timeSlot) || [];

                      return (
                        <td key={`${day}-${timeSlot}`} className="border p-1">
                          {classes.length > 0 && (
                            <div className="space-y-1">
                              {classes.map((cls, idx) => (
                                <div
                                  key={idx}
                                  className="bg-primary/10 border border-primary/20 rounded p-2 text-xs"
                                >
                                  <div className="font-semibold">
                                    {cls.courseCode}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {cls.instructor}
                                  </div>
                                  <div className="text-muted-foreground">
                                    Room {cls.room}
                                  </div>
                                  <div className="text-muted-foreground font-mono">
                                    {cls.startTime} - {cls.endTime}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        {generationStats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {generationStats.coursesCount}
              </div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {generationStats.totalCombinations.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Combinations
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {generationStats.validCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Valid Schedules
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
