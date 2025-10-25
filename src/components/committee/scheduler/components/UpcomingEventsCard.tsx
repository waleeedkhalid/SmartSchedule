/**
 * Upcoming Events Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import type { UpcomingEvent } from "../types";

interface UpcomingEventsCardProps {
  events: UpcomingEvent[];
}

// Memoized event item component
const EventItem = memo(function EventItem({ event }: { event: UpcomingEvent }) {
  const daysUntil = useMemo(
    () =>
      Math.ceil(
        (new Date(event.start_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    [event.start_date]
  );

  const dotColor = useMemo(() => {
    if (daysUntil <= 3) return "bg-red-500";
    if (daysUntil <= 7) return "bg-orange-500";
    return "bg-blue-500";
  }, [daysUntil]);

  const dateLabel = useMemo(() => {
    const formattedDate = new Date(event.start_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (daysUntil === 0) return `${formattedDate} • Today`;
    if (daysUntil === 1) return `${formattedDate} • Tomorrow`;
    return `${formattedDate} • In ${daysUntil} days`;
  }, [event.start_date, daysUntil]);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <div className={`h-2 w-2 rounded-full ${dotColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dateLabel}
        </p>
      </div>
      <Badge variant="outline" className="text-xs">
        {event.category}
      </Badge>
    </div>
  );
});

export const UpcomingEventsCard = memo(function UpcomingEventsCard({
  events,
}: UpcomingEventsCardProps) {
  const hasEvents = events.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
        <CardDescription>
          Important deadlines and academic events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasEvents ? (
          <div className="space-y-3">
            {events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No upcoming events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

