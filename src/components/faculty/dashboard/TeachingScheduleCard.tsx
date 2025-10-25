"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  sectionId: string;
  courseCode: string;
  courseName: string;
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

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

export default function TeachingScheduleCard() {
  const [schedule, setSchedule] = useState<ScheduleByDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/faculty/schedule");
        const data = await response.json();

        if (data.success) {
          setSchedule(data.data.scheduleByDay);
        } else {
          setError(data.error || "Failed to fetch schedule");
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Teaching Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Teaching Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const hasSchedule = schedule && Object.values(schedule).some((day) => day.length > 0);

  return (
    <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Teaching Schedule</CardTitle>
              <CardDescription>
                Your weekly teaching timetable
              </CardDescription>
            </div>
          </div>
          {hasSchedule && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/faculty/schedule">
                Full View <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasSchedule ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No teaching schedule yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your schedule will appear here once courses are assigned
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS.map((day) => {
              const daySchedule = schedule[day as keyof ScheduleByDay] || [];
              if (daySchedule.length === 0) return null;

              return (
                <div
                  key={day}
                  className="rounded-lg border bg-muted/20 p-3"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1 font-semibold">
                      {day.substring(0, 3)}
                    </Badge>
                    <div className="flex-1 space-y-2">
                      {daySchedule.map((item, idx) => (
                        <div
                          key={`${item.sectionId}-${idx}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-medium">{item.courseName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.courseCode}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

