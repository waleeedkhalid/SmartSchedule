"use client";

/**
 * Faculty Dashboard Client Component
 *
 * Client Component that handles the faculty dashboard UI with interactivity.
 * Receives server-fetched data as props to minimize client bundle size.
 *
 * Following Next.js 15 best practices:
 * - Server Component (page.tsx) fetches data
 * - Client Component (this file) handles interactivity
 * - Data passed as serializable props
 * - Heavy components dynamically imported for code splitting
 */

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import type { FacultyProfile, FacultySection } from "@/lib/db/faculty/types";

// Lazy load heavy components to reduce initial bundle size
const SectionCard = dynamic(
  () =>
    import("@/components/faculty/section-card").then((mod) => ({
      default: mod.SectionCard,
    })),
  { ssr: false }
);

const FacultyScheduleGrid = dynamic(
  () =>
    import("@/components/faculty-schedule-grid").then((mod) => ({
      default: mod.FacultyScheduleGrid,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const UpcomingDeadlinesWidget = dynamic(
  () =>
    import("@/components/upcoming-deadlines-widget").then((mod) => ({
      default: mod.UpcomingDeadlinesWidget,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const RoleNotificationsWidget = dynamic(
  () =>
    import("@/components/role-notifications-widget").then((mod) => ({
      default: mod.RoleNotificationsWidget,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

// Dynamically import heavy chart component
const FacultyDashboardChartsWrapper = dynamic(
  () =>
    import("@/components/faculty-dashboard-charts-wrapper").then((mod) => ({
      default: mod.FacultyDashboardChartsWrapper,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Faculty Analytics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
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

interface FacultyDashboardClientProps {
  userEmail: string;
  profile: FacultyProfile | null;
  sections: FacultySection[];
  uniqueCoursesCount: number;
  initialDeadlines?: UpcomingDeadline[];
  initialNotifications?: Notification[];
}

export function FacultyDashboardClient({
  userEmail,
  profile,
  sections,
  uniqueCoursesCount,
  initialDeadlines,
  initialNotifications,
}: FacultyDashboardClientProps) {
  if (!profile) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5" />
            Profile Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-400">
          <p>Your faculty profile is not set up.</p>
          <p className="mt-2">
            Please complete onboarding to set up your profile. If you have
            already completed onboarding, please contact the scheduling
            committee with your email: <strong>{userEmail || "N/A"}</strong>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Timeline and Notifications Section */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
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
            userRole="faculty"
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
            role="faculty"
            initialData={initialNotifications}
          />
        </ClientOnly>
      </div>

      {/* Charts Section */}
      <div className="mb-8">
        <FacultyDashboardChartsWrapper />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Sections
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-gray-500 mt-1">Current semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Load</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sections.length} / {profile.max_load_per_week || 12}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sections per week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCoursesCount}</div>
            <p className="text-xs text-gray-500 mt-1">Unique courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="mb-8">
        <FacultyScheduleGrid sections={sections} />
      </div>

      {/* My Timetable */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            My Teaching Schedule
          </CardTitle>
          <CardDescription>
            Your assigned sections and meeting times
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sections assigned yet</p>
              <p className="text-sm mt-1">
                Check back after the schedule is published
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your teaching profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/faculty/feedback">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submit Feedback
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/faculty/availability">
                <Clock className="mr-2 h-4 w-4" />
                Update Availability
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/notifications">
                <AlertCircle className="mr-2 h-4 w-4" />
                View Notifications
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Your teaching preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Max Load
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.max_load_per_week || 12} sections per week
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Preferred Times
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {Array.isArray(profile.preferred_times) &&
                  profile.preferred_times.length > 0
                    ? "Configured"
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Unavailable Times
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {Array.isArray(profile.unavailable_times) &&
                  profile.unavailable_times.length > 0
                    ? "Configured"
                    : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Schedule Feedback
          </CardTitle>
          <CardDescription>
            Submit and track your schedule feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Share Your Feedback
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Help improve the schedule by sharing your feedback on assigned
                  sections, timing preferences, or any concerns you may have.
                </p>
                <div className="mt-3">
                  <Link
                    href="/dashboard/faculty/feedback"
                    className="text-sm text-blue-700 dark:text-blue-300 hover:underline font-medium"
                  >
                    Submit or view feedback →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
