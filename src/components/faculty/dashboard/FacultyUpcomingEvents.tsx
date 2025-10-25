"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TermEvent } from "@/types/database";
import {
  enrichEvent,
  formatDateRange,
  formatRelativeTime,
  getEventStyle,
} from "@/lib/timeline-helpers";

interface FacultyUpcomingEventsProps {
  termCode?: string;
  limit?: number;
}

export default function FacultyUpcomingEvents({
  termCode,
  limit = 5,
}: FacultyUpcomingEventsProps) {
  const [events, setEvents] = useState<TermEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/faculty/events");
        const data = await response.json();

        if (data.success) {
          const allEvents = data.data.events || [];
          // Filter for upcoming events and sort by start date
          const upcoming = allEvents
            .map((e: TermEvent) => enrichEvent(e))
            .filter((e: any) => e.status === "upcoming" || e.status === "active")
            .sort(
              (a: any, b: any) =>
                new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
            )
            .slice(0, limit);

          setEvents(upcoming);
        } else {
          setError(data.error || "Failed to fetch events");
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [termCode, limit]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "grade_submission":
        return Upload;
      case "feedback_period":
        return AlertCircle;
      case "schedule_publish":
        return Calendar;
      default:
        return Info;
    }
  };

  if (loading) {
    return (
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
        <CardDescription>
          Important dates and milestones for faculty
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No upcoming events
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later for deadlines and milestones
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => {
              const Icon = getEventIcon(event.event_type);
              const style = getEventStyle(event);
              const isActive = event.status === "active";
              const daysText = event.days_until
                ? formatRelativeTime(event.days_until, false)
                : "Active now";

              return (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-lg border p-3 transition-all",
                    style.bgColor,
                    style.borderColor,
                    isActive && "ring-2 ring-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5", style.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn("font-semibold text-sm", style.color)}>
                          {event.title}
                        </h4>
                        {isActive && (
                          <Badge
                            variant="default"
                            className="text-xs shrink-0 bg-green-600"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatDateRange(event.start_date, event.end_date)}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{daysText}</span>
                        </div>
                      </div>
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

