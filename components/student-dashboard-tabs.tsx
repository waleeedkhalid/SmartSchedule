"use client";

/**
 * Student Dashboard Tabs Component
 *
 * Client Component that handles the tabbed interface for the student dashboard.
 * Receives server-fetched data as props to minimize client bundle size.
 *
 * Following Next.js 15 best practices:
 * - Server Component (page.tsx) fetches data
 * - Client Component (this file) handles interactivity
 * - Data passed as serializable props
 * - Heavy components dynamically imported for code splitting
 */

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  BookOpen,
  MessageSquare,
  GraduationCap,
  CreditCard,
  Lock,
  Loader2,
} from "lucide-react";
import { StudentDashboardChartsWrapper } from "@/components/student-dashboard-charts-wrapper";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Dynamically import heavy components with loading states
const ElectiveRegistrationManager = dynamic(
  () =>
    import("@/components/elective-registration-manager").then((mod) => ({
      default: mod.ElectiveRegistrationManager,
    })),
  {
    loading: () => (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const StudentScheduleView = dynamic(
  () =>
    import("@/components/student-schedule-view").then((mod) => ({
      default: mod.StudentScheduleView,
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

const StudentExamTimetable = dynamic(
  () =>
    import("@/components/student-exam-timetable").then((mod) => ({
      default: mod.StudentExamTimetable,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Exam Timetable</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const StudentFeedbackManager = dynamic(
  () =>
    import("@/components/student-feedback-manager").then((mod) => ({
      default: mod.StudentFeedbackManager,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Schedule Feedback
          </CardTitle>
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

interface StudentDashboardTabsProps {
  userId: string;
  studentLevel: number | null;
  creditStats: {
    total: number;
    required_credits: number;
    elective_credits: number;
  } | null;
  totalEnrollments: number;
  upcomingExams: number;
  totalExams: number;
  initialDeadlines?: UpcomingDeadline[];
  initialNotifications?: Notification[];
  isRegistrationOpen: boolean;
}

export function StudentDashboardTabs({
  userId,
  studentLevel,
  creditStats,
  totalEnrollments,
  upcomingExams,
  totalExams,
  initialDeadlines,
  initialNotifications,
  isRegistrationOpen,
}: StudentDashboardTabsProps) {
  return (
    <TooltipProvider>
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>

          {isRegistrationOpen ? (
            <TabsTrigger value="registration">Registration</TabsTrigger>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full h-full">
                  <TabsTrigger
                    value="registration"
                    disabled
                    className="w-full h-full opacity-50 cursor-not-allowed"
                  >
                    Registration <Lock className="ml-2 h-3 w-3" />
                  </TabsTrigger>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Registration is currently closed. Check the timeline for
                  upcoming dates.
                </p>
              </TooltipContent>
            </Tooltip>
          )}

          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Quick Summary */}
        <TabsContent value="overview" className="space-y-6">
          {/* Timeline and Notifications Section - Wrapped in ClientOnly to prevent hydration errors from date-fns */}
          <div className="grid gap-4 md:grid-cols-2">
            <ClientOnly
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Loading...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <UpcomingDeadlinesWidget
                userRole="student"
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
                      <p className="text-sm text-muted-foreground">
                        Loading...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <RoleNotificationsWidget
                role="student"
                initialData={initialNotifications}
              />
            </ClientOnly>
          </div>

          {/* Charts Section - Wrapped in ClientOnly to prevent hydration errors from chart libraries */}
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Loading charts...
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <StudentDashboardChartsWrapper />
          </ClientOnly>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Academic Level
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentLevel ? `Level ${studentLevel}` : "Not Set"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current academic standing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Credits
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creditStats?.total || 0} / 20
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {creditStats?.required_credits || 0} required,{" "}
                  {creditStats?.elective_credits || 0} elective
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Enrollments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active course sections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Exams
                </CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingExams}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalExams} total exams scheduled
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Register for Electives</p>
                  <p className="text-sm text-muted-foreground">
                    Browse available elective sections and register (max 20
                    credits total)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">View Your Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    See your complete weekly schedule (required courses +
                    registered electives)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Check Exam Dates</p>
                  <p className="text-sm text-muted-foreground">
                    Review your exam timetable and check for conflicts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Provide Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    Share comments about your schedule or specific sections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Tab - Elective Section Enrollment */}
        <TabsContent value="registration">
          {isRegistrationOpen ? (
            <ElectiveRegistrationManager userId={userId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Registration Closed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Elective registration is currently closed. Please check the
                  timeline for the next registration period.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schedule Tab - Weekly Schedule View */}
        <TabsContent value="schedule">
          <StudentScheduleView />
        </TabsContent>

        {/* Exams Tab - Exam Timetable */}
        <TabsContent value="exams">
          <StudentExamTimetable />
        </TabsContent>

        {/* Feedback Tab - Student Schedule Feedback */}
        <TabsContent value="feedback">
          <StudentFeedbackManager userId={userId} />
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  );
}
