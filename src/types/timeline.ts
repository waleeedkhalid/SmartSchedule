/**
 * Timeline Types and Interfaces
 * Comprehensive type definitions for academic timeline visualization
 */

import type { Database } from "./database";

// Base types from database
export type EventType = Database["public"]["Enums"]["event_type"];
export type EventCategory = Database["public"]["Enums"]["event_category"];

// Raw event from database
export interface TermEvent {
  id: string;
  term_code: string;
  title: string;
  description: string | null;
  event_type: EventType;
  category: EventCategory;
  start_date: string;
  end_date: string;
  is_recurring: boolean | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string | null;
}

// Enriched event with computed fields
export interface EnrichedEvent extends TermEvent {
  status: "completed" | "active" | "upcoming";
  days_until?: number; // For upcoming events
  days_since?: number; // For completed events
  duration_days: number;
  progress_percentage?: number; // For active events
}

// Term information with progress
export interface TermInfo {
  code: string;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  progress_percentage: number;
  days_total: number;
  days_elapsed: number;
  days_remaining: number;
  registration_open: boolean;
  electives_survey_open: boolean;
  schedule_published: boolean;
  feedback_open: boolean;
}

// Events grouped by category
export interface EventsByCategory {
  academic: EnrichedEvent[];
  registration: EnrichedEvent[];
  exam: EnrichedEvent[];
  administrative: EnrichedEvent[];
}

// Timeline statistics
export interface TimelineStatistics {
  total_events: number;
  active_events: number;
  upcoming_events: number;
  completed_events: number;
  by_category: {
    academic: number;
    registration: number;
    exam: number;
    administrative: number;
  };
}

// Complete timeline data structure
export interface TimelineData {
  term: TermInfo;
  events: {
    all: EnrichedEvent[];
    by_category: EventsByCategory;
    active: EnrichedEvent[];
    upcoming: EnrichedEvent[];
  };
  statistics: TimelineStatistics;
}

// API response wrapper
export interface TimelineResponse {
  success: boolean;
  data: TimelineData;
  error?: string;
}

// Event filter options
export interface TimelineFilters {
  category?: EventCategory | "all";
  event_type?: EventType | "all";
  status?: "completed" | "active" | "upcoming" | "all";
  search?: string;
}

// Event form data for creating/editing
export interface EventFormData {
  term_code: string;
  title: string;
  description?: string;
  event_type: EventType;
  category: EventCategory;
  start_date: string;
  end_date: string;
  is_recurring?: boolean;
  metadata?: Record<string, any>;
}

// Visual styling configuration
export interface EventStyleConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

// Timeline view configuration
export interface TimelineViewConfig {
  showCompleted: boolean;
  showUpcoming: boolean;
  showActive: boolean;
  daysAhead: number;
  groupByCategory: boolean;
  compactMode: boolean;
}

// Event metadata types
export interface EventMetadata {
  priority?: "high" | "medium" | "low";
  requires_action?: boolean;
  url?: string;
  icon?: string;
  notification?: boolean;
  audience?: "all" | "student" | "faculty" | "committee";
  exam_type?: "midterm1" | "midterm2" | "final";
  [key: string]: any;
}

// Timeline event for display
export interface TimelineEventDisplay {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  category: EventCategory;
  type: EventType;
  status: "completed" | "active" | "upcoming";
  style: EventStyleConfig;
  metadata: EventMetadata;
  daysUntil?: number;
  duration: string;
}

// Event group for rendering
export interface EventGroup {
  date: string;
  events: EnrichedEvent[];
}

// Calendar day representation
export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isInCurrentMonth: boolean;
  events: EnrichedEvent[];
  hasActiveEvent: boolean;
  hasUpcomingEvent: boolean;
}

// Month view data
export interface MonthViewData {
  month: number;
  year: number;
  weeks: CalendarDay[][];
  totalEvents: number;
}

