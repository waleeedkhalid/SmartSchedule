/**
 * Upcoming Events Component
 * Display upcoming academic events for students
 */

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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Bell,
  FileText,
  Award,
  Coffee,
  UserPlus,
  ClipboardCheck,
  FileEdit,
} from "lucide-react";
import type { EnrichedEvent } from "@/types/timeline";
import {
  formatDateRange,
  formatRelativeTime,
  getEventStyle,
  EVENT_TYPE_ICONS,
} from "@/lib/timeline-helpers";

interface UpcomingEventsProps {
  termCode?: string;
  limit?: number;
  showViewAll?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus,
  RefreshCw: Clock,
  ClipboardCheck,
  FileEdit,
  FileCheck: FileText,
  Upload: FileText,
  MessageSquare: FileText,
  Info: AlertCircle,
  Calendar,
  Award,
  Coffee,
};

export default function UpcomingEvents({
  termCode,
  limit = 5,
  showViewAll = true,
}: UpcomingEventsProps) {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams({
          upcoming: "true",
          days_ahead: "30",
        });

        if (termCode) {
          params.append("term_code", termCode);
        }

        const response = await fetch(`/api/academic/events?${params}`);
        const result = await response.json();

        if (result.success && result.data) {
          setEvents(result.data.slice(0, limit));
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

  const EventIcon = ({
    iconName,
    className,
  }: {
    iconName: string;
    className?: string;
  }) => {
    const Icon = ICON_MAP[iconName] || AlertCircle;
    return <Icon className={className} />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Loading events...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Important dates and deadlines
            </CardDescription>
          </div>
          {events.some((e) => e.metadata?.requires_action) && (
            <Badge variant="destructive" className="animate-pulse">
              <Bell className="h-3 w-3 mr-1" />
              Action Required
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 pr-4">
            {events.map((event) => {
              const style = getEventStyle(event);
              const iconName = EVENT_TYPE_ICONS[event.event_type];

              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${style.bgColor} border ${style.borderColor} hover:shadow-sm transition-all`}
                >
                  {/* Icon */}
                  <div
                    className={`${style.bgColor} p-2 rounded-lg border ${style.borderColor} flex-shrink-0`}
                  >
                    <EventIcon
                      iconName={iconName}
                      className={`h-4 w-4 ${style.color}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm leading-tight">
                        {event.title}
                      </h4>
                      {event.days_until !== undefined && (
                        <Badge
                          variant="secondary"
                          className="text-xs whitespace-nowrap"
                        >
                          {formatRelativeTime(event.days_until, false)}
                        </Badge>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateRange(event.start_date, event.end_date)}</span>
                    </div>

                    {event.metadata?.requires_action && (
                      <Badge
                        variant="destructive"
                        className="mt-2 text-xs"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Action Required
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {showViewAll && events.length >= limit && (
          <Button
            variant="outline"
            className="w-full mt-4"
            size="sm"
            asChild
          >
            <a href="/student/calendar">
              View All Events
              <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar or small spaces
export function UpcomingEventsCompact({ termCode }: { termCode?: string }) {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams({
          upcoming: "true",
          days_ahead: "7",
        });

        if (termCode) {
          params.append("term_code", termCode);
        }

        const response = await fetch(`/api/academic/events?${params}`);
        const result = await response.json();

        if (result.success && result.data) {
          setEvents(result.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [termCode]);

  if (loading || events.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Bell className="h-4 w-4" />
        This Week
      </h4>
      <div className="space-y-1">
        {events.map((event) => (
          <div
            key={event.id}
            className="text-xs p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="font-medium truncate">{event.title}</div>
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.days_until !== undefined &&
                formatRelativeTime(event.days_until, false)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

