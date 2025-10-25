/**
 * Custom hook for fetching scheduler dashboard data
 * Implements memoization and error handling patterns from performance.md
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { DashboardStats, SchedulerData, UpcomingEvent, FeedbackSettings } from "../types";

interface UseDashboardDataReturn {
  schedulerData: SchedulerData | null;
  dashboardStats: DashboardStats | null;
  upcomingEvents: UpcomingEvent[];
  feedbackSettings: FeedbackSettings;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [schedulerData, setSchedulerData] = useState<SchedulerData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>({
    feedback_open: false,
    schedule_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("full_name,email,role")
        .eq("id", user.id)
        .maybeSingle();

      if (userError || !userData) {
        throw new Error("Failed to fetch user data");
      }

      const profile = userData as {
        full_name?: string | null;
        email?: string | null;
        role?: string | null;
      };

      // Get active term
      const { data: activeTerm } = await supabase
        .from("academic_term")
        .select("code")
        .eq("is_active", true)
        .maybeSingle();

      const activeTermCode = activeTerm?.code || "FALL2025";

      // Fetch all stats in parallel (optimized with Promise.all)
      const [
        { count: courseCount },
        { count: studentCount },
        { data: sections, count: sectionCount },
        { count: publishedSectionCount },
        { count: enrollmentCount },
        { data: conflicts, count: conflictCount },
        { count: preferenceCount },
        { count: totalStudentsForPreferences },
        { data: events },
      ] = await Promise.all([
        supabase
          .from("course")
          .select("*", { count: "exact", head: true })
          .eq("is_swe_managed", true),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("section")
          .select("id, created_at", { count: "exact" })
          .eq("term_code", activeTermCode)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("section")
          .select("*", { count: "exact", head: true })
          .eq("term_code", activeTermCode)
          .eq("status", "PUBLISHED"),
        supabase
          .from("section_enrollment")
          .select("*", { count: "exact", head: true })
          .eq("enrollment_status", "ENROLLED"),
        supabase
          .from("schedule_conflicts")
          .select("severity", { count: "exact" })
          .eq("resolved", false),
        supabase
          .from("elective_preferences")
          .select("id", { count: "exact" })
          .eq("term_code", activeTermCode)
          .eq("status", "SUBMITTED"),
        supabase
          .from("students")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("term_events")
          .select("id, title, event_type, start_date, end_date, category")
          .eq("term_code", activeTermCode)
          .gte("start_date", new Date().toISOString())
          .order("start_date", { ascending: true })
          .limit(5),
      ]);

      // Calculate conflicts by severity
      const conflictsBySeverity = {
        critical: 0,
        error: 0,
        warning: 0,
        info: 0,
      };

      if (conflicts) {
        conflicts.forEach((conflict: { severity: string }) => {
          if (conflict.severity in conflictsBySeverity) {
            conflictsBySeverity[
              conflict.severity as keyof typeof conflictsBySeverity
            ]++;
          }
        });
      }

      // Determine schedule status
      let scheduleStatus: "not_generated" | "draft" | "published" = "not_generated";
      let lastGeneratedAt: string | null = null;

      if (sectionCount && sectionCount > 0) {
        scheduleStatus =
          publishedSectionCount && publishedSectionCount > 0
            ? "published"
            : "draft";
        lastGeneratedAt = sections?.[0]?.created_at || null;
      }

      // Calculate preference submission rate
      const preferenceSubmissionRate =
        totalStudentsForPreferences && totalStudentsForPreferences > 0
          ? Math.round(
              ((preferenceCount || 0) / totalStudentsForPreferences) * 100
            )
          : 0;

      // Set scheduler data
      setSchedulerData({
        name:
          profile.full_name ?? user.user_metadata?.full_name ?? "Scheduler",
        email: profile.email ?? user.email ?? "",
        role: profile.role ?? "scheduling_committee",
        totalCourses: courseCount || 0,
        totalStudents: studentCount || 0,
        totalSections: sectionCount || 0,
        publishedSections: publishedSectionCount || 0,
        lastGeneratedAt,
        scheduleStatus,
      });

      // Set dashboard stats
      setDashboardStats({
        totalCourses: courseCount || 0,
        totalStudents: studentCount || 0,
        totalSections: sectionCount || 0,
        publishedSections: publishedSectionCount || 0,
        totalEnrollments: enrollmentCount || 0,
        unresolvedConflicts: conflictCount || 0,
        conflictsBySeverity,
        scheduleStatus,
        lastGeneratedAt,
        preferenceSubmissionRate,
        totalPreferences: preferenceCount || 0,
      });

      // Set upcoming events
      setUpcomingEvents(events || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - function doesn't depend on external values

  // Memoize fetch feedback settings
  const fetchFeedbackSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/committee/scheduler/feedback-settings");
      const data = await response.json();
      
      if (data.success) {
        setFeedbackSettings({
          feedback_open: data.data.feedback_open || false,
          schedule_published: data.data.schedule_published || false,
        });
      }
    } catch (err) {
      console.error("Error fetching feedback settings:", err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    fetchFeedbackSettings();
  }, [fetchDashboardData, fetchFeedbackSettings]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      schedulerData,
      dashboardStats,
      upcomingEvents,
      feedbackSettings,
      loading,
      error,
      refetch: fetchDashboardData,
    }),
    [
      schedulerData,
      dashboardStats,
      upcomingEvents,
      feedbackSettings,
      loading,
      error,
      fetchDashboardData,
    ]
  );
}

