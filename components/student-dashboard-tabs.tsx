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
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, BookOpen, MessageSquare, GraduationCap, CreditCard } from "lucide-react";
import Link from "next/link";
import { ElectiveRegistrationManager } from "@/components/elective-registration-manager";
import { StudentScheduleView } from "@/components/student-schedule-view";
import { StudentExamTimetable } from "@/components/student-exam-timetable";
import { StudentDashboardChartsWrapper } from "@/components/student-dashboard-charts-wrapper";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";

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
}

export function StudentDashboardTabs({
  studentLevel,
  creditStats,
  totalEnrollments,
  upcomingExams,
  totalExams,
  initialDeadlines,
  initialNotifications,
}: StudentDashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="registration">Registration</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <UpcomingDeadlinesWidget userRole="student" initialData={initialDeadlines} />
          </ClientOnly>
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RoleNotificationsWidget role="student" initialData={initialNotifications} />
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
                  <p className="text-sm text-muted-foreground">Loading charts...</p>
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
              <CardTitle className="text-sm font-medium">Academic Level</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {studentLevel ? `Level ${studentLevel}` : 'Not Set'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current academic standing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creditStats?.total || 0} / 20
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {creditStats?.required_credits || 0} required, {creditStats?.elective_credits || 0} elective
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
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
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
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
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">1</div>
              <div>
                <p className="font-medium">Register for Electives</p>
                <p className="text-sm text-muted-foreground">
                  Browse available elective sections and register (max 20 credits total)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">2</div>
              <div>
                <p className="font-medium">View Your Schedule</p>
                <p className="text-sm text-muted-foreground">
                  See your complete weekly schedule (required courses + registered electives)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">3</div>
              <div>
                <p className="font-medium">Check Exam Dates</p>
                <p className="text-sm text-muted-foreground">
                  Review your exam timetable and check for conflicts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">4</div>
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
        <ElectiveRegistrationManager />
      </TabsContent>

      {/* Schedule Tab - Weekly Schedule View - Wrapped in ClientOnly for consistency and to prevent any potential hydration issues */}
      <TabsContent value="schedule">
        <ClientOnly
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading schedule...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <StudentScheduleView />
        </ClientOnly>
      </TabsContent>

      {/* Exams Tab - Exam Timetable - Wrapped in ClientOnly to prevent hydration errors from timezone-dependent date formatting */}
      <TabsContent value="exams">
        <ClientOnly
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Exam Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading exam schedule...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <StudentExamTimetable />
        </ClientOnly>
      </TabsContent>

      {/* Feedback Tab - Comment System - TEMPORARILY DISABLED */}
      <TabsContent value="feedback">
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-yellow-500" />
              Schedule Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg mb-1">
                      Feature Under Maintenance
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      We&apos;re upgrading the feedback system to support comments from all users (students, faculty, and staff). 
                      This feature will be back online shortly.
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      What&apos;s being updated:
                    </p>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>Multi-user comment support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>Enhanced feedback management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>Improved comment resolution tracking</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link href="/maintenance">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </Link>
                    <Link href="/dashboard/student">
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        Use Other Features
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

