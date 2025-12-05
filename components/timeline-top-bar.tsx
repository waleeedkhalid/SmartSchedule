"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { TimelineEventDialog } from "@/components/timeline-event-dialog";
import { calculateTimelineStatus } from "@/lib/utils/timeline-status";
import Link from "next/link";

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  category: string;
  start_date: string;
  end_date: string;
  priority: string;
  status: string;
  requires_action: boolean;
  target_roles: string[] | null;
  is_deadline: boolean;
}

interface TimelineTopBarProps {
  userRole: string;
}

const priorityColors = {
  low: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
  medium:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700",
  critical:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700",
};

const statusColors = {
  upcoming: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  in_progress:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
  completed:
    "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  overdue: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  cancelled: "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800",
};

async function fetchTimelineEvents(role: string): Promise<TimelineEvent[]> {
  const authHeader = await getAuthHeader();
  const response = await fetch(`/api/timeline?role=${role}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch timeline events");
  }

  const result = await response.json();
  return (result.data || []) as TimelineEvent[];
}

function getEventStatus(
  event: TimelineEvent
): "upcoming" | "in_progress" | "completed" | "overdue" {
  // Use the utility function to calculate status dynamically
  const calculatedStatus = calculateTimelineStatus({
    status: event.status,
    start_date: event.start_date,
    end_date: event.end_date,
    is_deadline: event.is_deadline,
  }) as "upcoming" | "in_progress" | "completed" | "overdue";

  return calculatedStatus;
}

function getDaysUntil(event: TimelineEvent): number {
  try {
    const now = new Date();
    const endDate = event.end_date ? new Date(event.end_date) : null;

    if (!endDate || isNaN(endDate.getTime())) {
      return 0; // Return 0 if date is invalid
    }

    return differenceInDays(endDate, now);
  } catch {
    return 0; // Return 0 on any error
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3 w-3" />;
    case "overdue":
      return <AlertCircle className="h-3 w-3" />;
    case "in_progress":
      return <Clock className="h-3 w-3" />;
    default:
      return <Calendar className="h-3 w-3" />;
  }
}

export function TimelineTopBar({ userRole }: TimelineTopBarProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Call hooks before any early returns
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["timeline", "topbar", userRole],
    queryFn: () => fetchTimelineEvents(userRole || ""),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userRole && typeof userRole === "string",
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 1, // Only retry once on error
  });

  function handleEventClick(event: TimelineEvent, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedEvent(event);
    setDialogOpen(true);
  }

  // Filter to show only upcoming, in_progress, and overdue events
  // Safely handle empty or invalid events array
  const relevantEvents = (Array.isArray(events) ? events : [])
    .filter((event) => {
      if (!event || typeof event !== "object" || !event.end_date) return false;
      try {
        const status = getEventStatus(event);
        // Show upcoming, in_progress, and overdue (ended) events
        return ["upcoming", "in_progress", "overdue"].includes(status);
      } catch {
        return false; // Skip invalid events
      }
    })
    .slice(0, 10) // Show max 10 events
    .sort((a, b) => {
      // Sort by end_date (earliest first) - safely handle invalid dates
      try {
        const dateA = a?.end_date ? new Date(a.end_date).getTime() : 0;
        const dateB = b?.end_date ? new Date(b.end_date).getTime() : 0;
        if (isNaN(dateA) || isNaN(dateB)) return 0;
        return dateA - dateB;
      } catch {
        return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>Loading timeline...</span>
        </div>
      </div>
    );
  }

  // Handle errors gracefully
  if (error) {
    return (
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span>Unable to load timeline</span>
        </div>
      </div>
    );
  }

  if (relevantEvents.length === 0) {
    return (
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>No upcoming deadlines</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center">
      <ScrollArea className="flex-1 h-full">
        <div className="flex items-center gap-3 px-4 py-2 h-full">
          {relevantEvents
            .filter((event) => event && event.id) // Filter out invalid events before mapping
            .map((event) => {
              const status = getEventStatus(event);
              const daysUntil = getDaysUntil(event);
              const priority = (event.priority ||
                "medium") as keyof typeof priorityColors;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={(e) => handleEventClick(event, e)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:shadow-sm min-w-fit",
                    statusColors[status] || statusColors.upcoming,
                    "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  )}
                >
                  {getStatusIcon(status)}
                  <span className="text-xs font-medium whitespace-nowrap">
                    {event.title || "Untitled Event"}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs border",
                      priorityColors[priority] || priorityColors.medium
                    )}
                  >
                    {event.priority || "medium"}
                  </Badge>
                  {status === "overdue" ? (
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      {Math.abs(daysUntil)}d overdue
                    </span>
                  ) : status === "in_progress" ? (
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                      {daysUntil >= 0 ? `${daysUntil}d left` : "Ending soon"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {daysUntil}d
                    </span>
                  )}
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              );
            })}
          {events.length > relevantEvents.length && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/timeline" prefetch={true}>
                View All ({events.length})
              </Link>
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* Timeline Event Detail Dialog */}
      <TimelineEventDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userRole={userRole}
      />
    </div>
  );
}
