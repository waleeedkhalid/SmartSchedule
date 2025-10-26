"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { MockAcademicEvent } from "@/types/scheduler-mock";
import { format, differenceInDays } from "date-fns";

interface UpcomingEventsWidgetProps {
  events: MockAcademicEvent[];
  maxEvents?: number;
  onViewAll?: () => void;
  compact?: boolean;
}

export function UpcomingEventsWidget({
  events,
  maxEvents = 5,
  onViewAll,
  compact = false,
}: UpcomingEventsWidgetProps) {
  const displayEvents = events.slice(0, maxEvents);

  const getDaysUntil = (date: string) => {
    return differenceInDays(new Date(date), new Date());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (displayEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No upcoming events</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          {onViewAll && events.length > maxEvents && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayEvents.map((event) => {
            const daysUntil = getDaysUntil(event.start_date);
            const isUrgent = daysUntil <= 7 && daysUntil >= 0;

            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border transition-colors ${
                  isUrgent
                    ? "border-orange-200 bg-orange-50 hover:bg-orange-100"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {!compact && event.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getPriorityColor(event.priority)} variant="outline">
                    {event.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(event.start_date), "MMM dd, yyyy")}</span>
                  </div>
                  {daysUntil >= 0 && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${isUrgent ? "border-orange-600 text-orange-600" : ""}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                        ? "Tomorrow"
                        : `In ${daysUntil} days`}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

