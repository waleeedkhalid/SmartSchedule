/**
 * Academic Timeline Component
 * Visual timeline display for academic events and milestones
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  ChevronRight,
  GraduationCap,
  ClipboardList,
  FileText,
  Settings,
  Award,
  Coffee,
  UserPlus,
  RefreshCw,
  ClipboardCheck,
  FileEdit,
  FileCheck,
  Upload,
  MessageSquare,
  Info,
} from "lucide-react";
import type {
  TimelineData,
  EnrichedEvent,
  EventCategory,
  TimelineFilters,
} from "@/types/timeline";
import {
  formatDateRange,
  formatDuration,
  formatRelativeTime,
  getEventStyle,
  filterEvents,
  sortEventsByDate,
  STATUS_STYLES,
  EVENT_TYPE_ICONS,
} from "@/lib/timeline-helpers";

interface AcademicTimelineProps {
  data: TimelineData;
  showFilters?: boolean;
  compactMode?: boolean;
  onEventClick?: (event: EnrichedEvent) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  ClipboardList,
  FileText,
  Settings,
  Award,
  Coffee,
  UserPlus,
  RefreshCw,
  ClipboardCheck,
  FileEdit,
  FileCheck,
  Upload,
  MessageSquare,
  Info,
  Calendar,
};

export default function AcademicTimeline({
  data,
  showFilters = true,
  compactMode = false,
  onEventClick,
}: AcademicTimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>({
    category: "all",
    status: "all",
    search: "",
  });

  const [activeView, setActiveView] = useState<"timeline" | "list" | "stats">(
    "timeline"
  );

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const filtered = filterEvents(data.events.all, filters);
    return sortEventsByDate(filtered, true);
  }, [data.events.all, filters]);

  // Event icon helper
  const EventIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
    const Icon = ICON_MAP[iconName] || Info;
    return <Icon className={className} />;
  };

  // Render event card
  const EventCard = ({ event }: { event: EnrichedEvent }) => {
    const style = getEventStyle(event);
    const statusStyle = STATUS_STYLES[event.status];

    return (
      <Card
        className={`${style.borderColor} border-l-4 hover:shadow-md transition-all cursor-pointer`}
        onClick={() => onEventClick?.(event)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`${style.bgColor} p-2 rounded-lg flex-shrink-0`}>
              <EventIcon
                iconName={EVENT_TYPE_ICONS[event.event_type]}
                className={`h-5 w-5 ${style.color}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm leading-tight">
                  {event.title}
                </h4>
                <Badge variant="outline" className={`${statusStyle.badge} text-xs`}>
                  {event.status}
                </Badge>
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateRange(event.start_date, event.end_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(event.duration_days)}
                </span>
                {event.status === "upcoming" && event.days_until !== undefined && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                    {formatRelativeTime(event.days_until, false)}
                  </span>
                )}
                {event.status === "active" && event.progress_percentage !== undefined && (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                    {event.progress_percentage}% complete
                  </span>
                )}
              </div>

              {/* Progress bar for active events */}
              {event.status === "active" && event.progress_percentage !== undefined && (
                <Progress value={event.progress_percentage} className="h-1 mt-2" />
              )}

              {/* Action badge */}
              {event.metadata?.requires_action && event.status !== "completed" && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Action Required
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Term progress header
  const TermProgress = () => (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{data.term.name}</CardTitle>
            <CardDescription className="text-base mt-1">
              {formatDateRange(data.term.start_date, data.term.end_date)}
            </CardDescription>
          </div>
          <Badge variant="default" className="text-base px-3 py-1">
            {data.term.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Term Progress</span>
            <span className="font-semibold">{data.term.progress_percentage}%</span>
          </div>
          <Progress value={data.term.progress_percentage} className="h-2" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Elapsed</p>
              <p className="font-semibold">{data.term.days_elapsed} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold">{data.term.days_remaining} days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold">{data.term.days_total} days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Statistics cards
  const StatisticsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{data.statistics.total_events}</div>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
            Active Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data.statistics.active_events}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data.statistics.upcoming_events}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-muted-foreground">
            {data.statistics.completed_events}
          </div>
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Events by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.statistics.by_category).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Filter controls
  const FilterControls = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {["all", "active", "upcoming", "completed"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filters.status === status ? "default" : "outline"}
                onClick={() =>
                  setFilters({ ...filters, status: status as TimelineFilters["status"] })
                }
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {["all", "academic", "registration", "exam", "administrative"].map(
              (category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={filters.category === category ? "default" : "outline"}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      category: category as TimelineFilters["category"],
                    })
                  }
                  className="capitalize"
                >
                  {category}
                </Button>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Term Progress */}
      <TermProgress />

      {/* View Toggle */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4 mt-6">
          {showFilters && <FilterControls />}

          {/* Timeline View */}
          <div className="space-y-6">
            {/* Active Events */}
            {data.events.active.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="text-lg font-semibold">Active Now</h3>
                </div>
                <div className="space-y-3">
                  {filterEvents(data.events.active, filters).map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {data.events.upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChevronRight className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Upcoming</h3>
                </div>
                <div className="space-y-3">
                  {filterEvents(data.events.upcoming, filters)
                    .slice(0, 10)
                    .map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                </div>
              </div>
            )}

            {/* Completed Events */}
            {filteredEvents.filter((e) => e.status === "completed").length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Completed
                  </h3>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {filteredEvents
                      .filter((e) => e.status === "completed")
                      .map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <CardDescription>
                {filteredEvents.length} event(s) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2 pr-4">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatisticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

