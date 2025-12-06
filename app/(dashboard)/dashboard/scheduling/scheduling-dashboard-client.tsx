"use client";

/**
 * Scheduling Dashboard Client Component
 *
 * Client Component that handles the tabbed interface for the scheduling dashboard.
 * Receives server-fetched data as props to minimize client bundle size.
 *
 * Following Next.js 15 best practices:
 * - Server Component (page.tsx) fetches data
 * - Client Component (this file) handles interactivity
 * - Data passed as serializable props
 * - Heavy components dynamically imported for code splitting
 */

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  DoorOpen,
  Users,
  AlertCircle,
  GitBranch,
  CheckCircle,
  BarChart3,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";
import type {
  SchedulingStats,
  ScheduleStatus,
} from "@/lib/db/scheduling-dashboard-data";

// Dynamically import heavy components with loading states
const ScheduleGenerator = dynamic(
  () =>
    import("@/components/schedule-generator").then((mod) => ({
      default: mod.ScheduleGenerator,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Schedule Generator</CardTitle>
          <CardDescription>Preparing schedule generation...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const SchedulingDashboardChartsWrapper = dynamic(
  () =>
    import("@/components/scheduling-dashboard-charts-wrapper").then((mod) => ({
      default: mod.SchedulingDashboardChartsWrapper,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Insights</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const GenerateFinalExamsButton = dynamic(
  () =>
    import("@/components/generate-final-exams-button").then((mod) => ({
      default: mod.GenerateFinalExamsButton,
    })),
  {
    loading: () => (
      <Button className="w-full justify-start" variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Generate Final Exams
      </Button>
    ),
    ssr: false,
  }
);

interface UpcomingDeadline {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  days_until_start?: number | null;
  days_until_end?: number | null;
  priority: string;
  status: string;
  requires_action: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface SchedulingDashboardClientProps {
  stats: SchedulingStats;
  scheduleStatus: ScheduleStatus;
  initialDeadlines?: UpcomingDeadline[];
  initialNotifications?: Notification[];
}

export function SchedulingDashboardClient({
  stats,
  scheduleStatus,
  initialDeadlines,
  initialNotifications,
}: SchedulingDashboardClientProps) {
  const isSystemReady =
    stats.coursesCount > 0 &&
    stats.roomsCount > 0 &&
    stats.instructorsCount > 0;

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">
          <BarChart3 className="mr-2 h-4 w-4" />
          Analytics & Insights
        </TabsTrigger>
        <TabsTrigger value="actions">Quick Actions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Timeline and Notifications Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <UpcomingDeadlinesWidget
              userRole="scheduling"
              initialData={initialDeadlines}
            />
          </ClientOnly>
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RoleNotificationsWidget
              role="scheduling"
              initialData={initialNotifications}
            />
          </ClientOnly>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sectionsCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.draftSectionsCount} draft, {stats.releasedSectionsCount}{" "}
                released
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rooms</CardTitle>
              <DoorOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.roomsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instructors</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.instructorsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.studentsCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Generation Section */}
        {isSystemReady ? (
          <div className="mb-6">
            <ClientOnly
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Generator</CardTitle>
                    <CardDescription>
                      Loading schedule generation...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              }
            >
              <ScheduleGenerator initialStatus={scheduleStatus} />
            </ClientOnly>
          </div>
        ) : (
          <Card className="mb-6 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              You need to set up courses, rooms, and instructors before
              generating schedules. Use the quick actions tab to get started.
            </CardContent>
          </Card>
        )}

        {/* Setup Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
            <CardDescription>
              Complete these steps to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                {stats.coursesCount > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Add courses</span>
              </li>
              <li className="flex items-center gap-2">
                {stats.roomsCount > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Add rooms</span>
              </li>
              <li className="flex items-center gap-2">
                {stats.instructorsCount > 0 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span>Add instructors</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span>Configure scheduling rules</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Analytics & Insights Tab */}
      <TabsContent value="analytics">
        <SchedulingDashboardChartsWrapper />
      </TabsContent>

      {/* Quick Actions Tab */}
      <TabsContent value="actions" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common scheduling tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/courses">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Manage Courses
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/sections">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Sections
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/rooms">
                  <DoorOpen className="mr-2 h-4 w-4" />
                  Manage Rooms
                </Link>
              </Button>
              <Button
                asChild
                className="w-full justify-start"
                variant="outline"
              >
                <Link href="/dashboard/instructors">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Instructors
                </Link>
              </Button>
              <GenerateFinalExamsButton />
            </CardContent>
          </Card>

          {/* Releases & Versioning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-500" />
                Releases & Versioning
              </CardTitle>
              <CardDescription>Manage schedule versions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Create Named Release
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                disabled
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                View Release History
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Generate a schedule first to create releases
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
