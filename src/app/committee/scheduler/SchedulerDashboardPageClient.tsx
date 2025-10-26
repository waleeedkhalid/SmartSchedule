"use client";

/**
 * Scheduler Dashboard Page - Client Component
 * Optimized with performance patterns from docs/performance.md:
 * - Custom hooks for data fetching
 * - Component splitting for better code organization
 * - React.memo for expensive components
 * - useMemo/useCallback for performance
 */

import React, { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Clock } from "lucide-react";

// Custom hooks
import { useDashboardData } from "@/components/committee/scheduler/hooks/useDashboardData";
import { useFeedbackSettings } from "@/components/committee/scheduler/hooks/useFeedbackSettings";

// Memoized components
import { QuickStatsCard } from "@/components/committee/scheduler/components/QuickStatsCard";
import { ConflictsStatsCard } from "@/components/committee/scheduler/components/ConflictsStatsCard";
import { UpcomingEventsCard } from "@/components/committee/scheduler/components/UpcomingEventsCard";
import { SystemOverviewCard } from "@/components/committee/scheduler/components/SystemOverviewCard";
import { ActionCard } from "@/components/committee/scheduler/components/ActionCard";
import { FeedbackControlsCard } from "@/components/committee/scheduler/components/FeedbackControlsCard";
import { ImportantNotices } from "@/components/committee/scheduler/components/ImportantNotices";

export default function SchedulerDashboardPage() {
  // Custom hooks with memoization
  const {
    schedulerData,
    dashboardStats,
    upcomingEvents,
    feedbackSettings: initialFeedbackSettings,
    loading,
    error,
  } = useDashboardData();

  const {
    feedbackSettings,
    updateFeedbackSetting,
    updatingSettings,
  } = useFeedbackSettings(initialFeedbackSettings);

  // Memoize action cards configuration - Student Management and Timeline
  const actionCards = useMemo(() => [
    {
      title: "Student Management",
      description: "Manage students, enrollments, and irregular student cases",
      icon: Users,
      features: [
        "View student statistics and enrollment metrics",
        "Search and filter student list by level and status",
        "Track and manage irregular students",
        "Coordinate with Registrar for student cases",
      ],
      href: "/committee/scheduler/students",
      buttonText: "Manage Students",
      variant: "default" as const,
      borderColorClass: "border-2 hover:border-blue-500",
    },
    {
      title: "Academic Timeline",
      description: "Track academic phases, milestones, and important dates",
      icon: Clock,
      features: [
        "Monitor phase progression and task completion",
        "View upcoming deadlines and events",
        "Track scheduling workflow progress",
        "Stay updated on academic calendar",
      ],
      href: "/committee/scheduler/timeline",
      buttonText: "View Timeline",
      variant: "default" as const,
      borderColorClass: "border-2 hover:border-purple-500",
    },
  ], []);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !schedulerData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Scheduling Committee Dashboard
          </h1>
          <p className="text-muted-foreground">
            {error ? error.message : "Unable to load scheduler data."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Scheduling Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {schedulerData.name}
        </p>
      </div>

      {/* Quick Stats - Memoized Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickStatsCard
          title="Total Courses"
          value={dashboardStats?.totalCourses || 0}
          subtitle="SWE-managed courses"
          icon={BookOpen}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
        />

        <QuickStatsCard
          title="Total Students"
          value={dashboardStats?.totalStudents || 0}
          subtitle="Active students"
          icon={Users}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />

        <QuickStatsCard
          title="Generated Sections"
          value={dashboardStats?.totalSections || 0}
          subtitle={dashboardStats?.lastGeneratedAt ? "" : "Not generated yet"}
          icon={Calendar}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
          lastGeneratedAt={dashboardStats?.lastGeneratedAt}
          progress={
            dashboardStats && dashboardStats.totalSections > 0
              ? {
                  current: dashboardStats.publishedSections,
                  total: dashboardStats.totalSections,
                }
              : undefined
          }
        />

        <ConflictsStatsCard stats={dashboardStats} />
      </div>

      {/* Widgets Row - Memoized Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <UpcomingEventsCard events={upcomingEvents} />
        <SystemOverviewCard stats={dashboardStats} />
      </div>

      {/* Main Actions - Memoized Components */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Scheduler Tools</h2>
        <p className="text-muted-foreground mb-6">
          Core scheduling committee features for managing students and tracking academic progress
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actionCards.map((card) => (
            <ActionCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon}
              features={card.features}
              href={card.href}
              buttonText={card.buttonText}
              variant={card.variant}
              borderColorClass={card.borderColorClass}
            />
          ))}
        </div>
      </div>

      {/* Feedback Controls - Memoized Component */}
      <FeedbackControlsCard
        feedbackSettings={feedbackSettings}
        updateFeedbackSetting={updateFeedbackSetting}
        updatingSettings={updatingSettings}
      />

      {/* Important Notices - Memoized Component */}
      <div className="mt-8">
        <ImportantNotices stats={dashboardStats} />
      </div>
    </div>
  );
}
