"use client";

import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  AlertCircle,
  Table2,
  DoorOpen,
} from "lucide-react";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import type {
  NormalizedSection,
  InstructorForTable,
  RoomForTable,
} from "@/lib/db/teaching-load-dashboard-data";

// Dynamic imports for heavy components - loaded on client only
const TeachingLoadDashboardCharts = dynamic(
  () =>
    import("@/components/teaching-load-dashboard-charts").then(
      (mod) => mod.TeachingLoadDashboardCharts
    ),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Loading Charts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading teaching load analytics...
            </p>
          </div>
        </CardContent>
      </Card>
    ),
  }
);

const TeachingLoadSectionsTable = dynamic(
  () =>
    import("@/components/teaching-load-sections-table").then(
      (mod) => mod.TeachingLoadSectionsTable
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    ),
  }
);

const TeachingLoadRoomsTable = dynamic(
  () =>
    import("@/components/teaching-load-rooms-table").then(
      (mod) => mod.TeachingLoadRoomsTable
    ),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    ),
  }
);

const UpcomingDeadlinesWidget = dynamic(
  () =>
    import("@/components/upcoming-deadlines-widget").then(
      (mod) => mod.UpcomingDeadlinesWidget
    ),
  {
    ssr: false,
    loading: () => (
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
    ),
  }
);

const RoleNotificationsWidget = dynamic(
  () =>
    import("@/components/role-notifications-widget").then(
      (mod) => mod.RoleNotificationsWidget
    ),
  {
    ssr: false,
    loading: () => (
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
    ),
  }
);

interface TeachingLoadDashboardClientProps {
  instructorsCount: number;
  sectionsCount: number;
  coursesCount: number;
  normalizedSections: NormalizedSection[];
  instructorsList: InstructorForTable[];
  roomsList: RoomForTable[];
}

export function TeachingLoadDashboardClient({
  instructorsCount,
  sectionsCount,
  coursesCount,
  normalizedSections,
  instructorsList,
  roomsList,
}: TeachingLoadDashboardClientProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Teaching Load Committee Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review and balance instructor teaching loads
        </p>
      </div>

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
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <UpcomingDeadlinesWidget userRole="teaching_load" />
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
          <RoleNotificationsWidget role="teaching_load" />
        </ClientOnly>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructorsCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total faculty members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sectionsCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total sections assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
            <p className="text-xs text-gray-500 mt-1">Available courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Assignment Tables */}
      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics & Charts
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Table2 className="mr-2 h-4 w-4" />
            Instructor Assignments
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <DoorOpen className="mr-2 h-4 w-4" />
            Room Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Loading Charts...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Loading teaching load analytics...
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <TeachingLoadDashboardCharts />
          </ClientOnly>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-blue-500" />
                Section Instructor Assignments
              </CardTitle>
              <CardDescription>
                Edit instructor assignments for sections. Click the edit icon to
                change assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientOnly
                fallback={
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                }
              >
                <TeachingLoadSectionsTable
                  sections={normalizedSections}
                  instructors={instructorsList}
                />
              </ClientOnly>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5 text-blue-500" />
                Section Room Assignments
              </CardTitle>
              <CardDescription>
                Edit room assignments for sections. Click the edit icon to
                change room assignments. Rooms are filtered by activity type
                (Lab sections show Lab rooms, Lecture sections show Lecture
                rooms).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientOnly
                fallback={
                  <div className="space-y-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                }
              >
                <TeachingLoadRoomsTable
                  sections={normalizedSections}
                  rooms={roomsList}
                />
              </ClientOnly>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage teaching assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/instructors">
                <Users className="mr-2 h-4 w-4" />
                View All Instructors
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/sections">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Section Assignments
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/dashboard/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                View Courses
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Load Balancing Guidelines</CardTitle>
            <CardDescription>Best practices for assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Green: Instructor under 80% capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Yellow: Instructor at 80-100% capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <span>Red: Instructor over capacity (reassign sections)</span>
              </li>
              <li className="flex items-start gap-2 mt-3">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>
                  Collaborate with scheduling committee for optimal distribution
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
