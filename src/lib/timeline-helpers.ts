/**
 * Timeline Helper Functions
 * Utilities for processing and formatting timeline data
 */

import type {
  TermEvent,
  EnrichedEvent,
  EventCategory,
  EventType,
  EventStyleConfig,
  EventMetadata,
  TimelineFilters,
  EventGroup,
  CalendarDay,
} from "@/types/timeline";

// Event status colors and styling
export const EVENT_STYLES: Record<EventCategory, EventStyleConfig> = {
  academic: {
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    borderColor: "border-blue-300 dark:border-blue-800",
    icon: "GraduationCap",
    priority: "medium",
  },
  registration: {
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/30",
    borderColor: "border-purple-300 dark:border-purple-800",
    icon: "ClipboardList",
    priority: "high",
  },
  exam: {
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/30",
    borderColor: "border-red-300 dark:border-red-800",
    icon: "FileText",
    priority: "high",
  },
  administrative: {
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-950/30",
    borderColor: "border-amber-300 dark:border-amber-800",
    icon: "Settings",
    priority: "medium",
  },
};

// Event type icons
export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  registration: "UserPlus",
  add_drop: "RefreshCw",
  elective_survey: "ClipboardCheck",
  midterm_exam: "FileEdit",
  final_exam: "FileCheck",
  break: "Coffee",
  grade_submission: "Upload",
  feedback_period: "MessageSquare",
  schedule_publish: "Calendar",
  academic_milestone: "Award",
  other: "Info",
};

// Status styling
export const STATUS_STYLES = {
  completed: {
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    dot: "bg-gray-400",
  },
  active: {
    badge: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    dot: "bg-green-500 animate-pulse",
  },
  upcoming: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate event status based on current date
 */
export function calculateEventStatus(
  startDate: string,
  endDate: string
): "completed" | "active" | "upcoming" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
}

/**
 * Calculate progress percentage for active events
 */
export function calculateEventProgress(
  startDate: string,
  endDate: string
): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return 0;
  if (now > end) return 100;

  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();

  return Math.round((elapsed / total) * 100);
}

/**
 * Enrich a raw event with computed fields
 */
export function enrichEvent(event: TermEvent): EnrichedEvent {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const status = calculateEventStatus(event.start_date, event.end_date);
  const duration_days = daysBetween(startDate, endDate);

  const enriched: EnrichedEvent = {
    ...event,
    status,
    duration_days,
  };

  if (status === "upcoming") {
    enriched.days_until = daysBetween(now, startDate);
  } else if (status === "completed") {
    enriched.days_since = daysBetween(endDate, now);
  } else if (status === "active") {
    enriched.progress_percentage = calculateEventProgress(
      event.start_date,
      event.end_date
    );
  }

  return enriched;
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const startFormatted = start.toLocaleDateString("en-US", options);

  // If same day, show only once
  if (start.toDateString() === end.toDateString()) {
    return startFormatted;
  }

  // If same month, optimize format
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const endDay = end.getDate();
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDay}, ${start.getFullYear()}`;
  }

  const endFormatted = end.toLocaleDateString("en-US", options);
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format relative time (e.g., "in 3 days", "2 days ago")
 */
export function formatRelativeTime(days: number, isPast: boolean): string {
  if (days === 0) return "Today";
  if (days === 1) return isPast ? "Yesterday" : "Tomorrow";

  return isPast ? `${days} days ago` : `in ${days} days`;
}

/**
 * Format duration for display
 */
export function formatDuration(days: number): string {
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }

  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

/**
 * Filter events based on criteria
 */
export function filterEvents(
  events: EnrichedEvent[],
  filters: TimelineFilters
): EnrichedEvent[] {
  let filtered = [...events];

  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter((e) => e.category === filters.category);
  }

  if (filters.event_type && filters.event_type !== "all") {
    filtered = filtered.filter((e) => e.event_type === filters.event_type);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((e) => e.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Sort events by start date
 */
export function sortEventsByDate(
  events: EnrichedEvent[],
  ascending = true
): EnrichedEvent[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: EnrichedEvent[]): EventGroup[] {
  const groups = new Map<string, EnrichedEvent[]>();

  events.forEach((event) => {
    const date = new Date(event.start_date).toDateString();
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(event);
  });

  return Array.from(groups.entries())
    .map(([date, events]) => ({
      date,
      events: sortEventsByDate(events),
    }))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

/**
 * Get events for a specific month
 */
export function getEventsForMonth(
  events: EnrichedEvent[],
  year: number,
  month: number
): EnrichedEvent[] {
  return events.filter((event) => {
    const date = new Date(event.start_date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Get priority from metadata
 */
export function getEventPriority(
  metadata: EventMetadata
): "high" | "medium" | "low" {
  return metadata?.priority || "medium";
}

/**
 * Check if event requires action
 */
export function requiresAction(event: EnrichedEvent): boolean {
  return event.metadata?.requires_action === true;
}

/**
 * Get event icon name
 */
export function getEventIcon(event: EnrichedEvent): string {
  if (event.metadata?.icon) {
    return event.metadata.icon;
  }
  return EVENT_TYPE_ICONS[event.event_type];
}

/**
 * Get style configuration for event
 */
export function getEventStyle(event: EnrichedEvent): EventStyleConfig {
  const baseStyle = EVENT_STYLES[event.category];
  const priority = getEventPriority(event.metadata);

  return {
    ...baseStyle,
    priority,
  };
}

/**
 * Check if event is happening today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in range
 */
export function isInDateRange(
  date: Date,
  startDate: string,
  endDate: string
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return date >= start && date <= end;
}

/**
 * Generate calendar days for a month
 */
export function generateCalendarDays(
  year: number,
  month: number,
  events: EnrichedEvent[]
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  // Add days from previous month to fill first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(createCalendarDay(date, false, today, events));
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push(createCalendarDay(date, true, today, events));
  }

  // Add days from next month to fill last week
  const remainingDays = 7 - (days.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(createCalendarDay(date, false, today, events));
    }
  }

  return days;
}

/**
 * Create a calendar day object
 */
function createCalendarDay(
  date: Date,
  isInCurrentMonth: boolean,
  today: Date,
  events: EnrichedEvent[]
): CalendarDay {
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const dayEvents = events.filter((event) =>
    isInDateRange(date, event.start_date, event.end_date)
  );

  return {
    date,
    isToday,
    isInCurrentMonth,
    events: dayEvents,
    hasActiveEvent: dayEvents.some((e) => e.status === "active"),
    hasUpcomingEvent: dayEvents.some((e) => e.status === "upcoming"),
  };
}

/**
 * Get event counts by category
 */
export function getEventCountsByCategory(events: EnrichedEvent[]): Record<EventCategory, number> {
  return {
    academic: events.filter((e) => e.category === "academic").length,
    registration: events.filter((e) => e.category === "registration").length,
    exam: events.filter((e) => e.category === "exam").length,
    administrative: events.filter((e) => e.category === "administrative").length,
  };
}

/**
 * Get upcoming events within days
 */
export function getUpcomingEvents(
  events: EnrichedEvent[],
  daysAhead: number = 30
): EnrichedEvent[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return events.filter((event) => {
    const startDate = new Date(event.start_date);
    return startDate >= now && startDate <= futureDate;
  });
}

/**
 * Format event for display in list
 */
export function formatEventForDisplay(event: EnrichedEvent) {
  return {
    ...event,
    dateRange: formatDateRange(event.start_date, event.end_date),
    duration: formatDuration(event.duration_days),
    relativeTime: event.days_until
      ? formatRelativeTime(event.days_until, false)
      : event.days_since
        ? formatRelativeTime(event.days_since, true)
        : "Now",
    style: getEventStyle(event),
    icon: getEventIcon(event),
    requiresAction: requiresAction(event),
    isToday: isToday(event.start_date),
  };
}

