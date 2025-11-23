import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calendar, 
  DoorOpen, 
  Users, 
  AlertCircle, 
  GitBranch,
  CheckCircle,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScheduleGenerator } from "@/components/schedule-generator";
import { SchedulingDashboardChartsNew } from "@/components/scheduling-dashboard-charts-new";
import { getMockUserRole, getMockSchedulingStats, getMockScheduleStatus } from "@/lib/demo-data";

export default async function SchedulingDashboardPage() {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole || userRole.role !== 'scheduling') {
    redirect("/dashboard");
  }

  // Get statistics using mock data
  const stats = await getMockSchedulingStats();
  const scheduleStatus = await getMockScheduleStatus();

  const isSystemReady = stats.coursesCount > 0 && 
                        stats.roomsCount > 0 && 
                        stats.instructorsCount > 0 &&
                        stats.groupsCount > 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scheduling Committee Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Generate schedules, manage conflicts, and visualize data insights
          </p>
        </div>

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
                {stats.draftSectionsCount} draft, {stats.releasedSectionsCount} released
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
              <CardTitle className="text-sm font-medium">Student Groups</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.groupsCount}</div>
            </CardContent>
          </Card>
        </div>

            {/* Schedule Generation Section */}
            {isSystemReady ? (
              <div className="mb-6">
                <ScheduleGenerator initialStatus={scheduleStatus} />
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
                  You need to set up courses, rooms, instructors, and student groups before generating schedules.
                  Use the quick actions tab to get started.
                </CardContent>
              </Card>
            )}

            {/* Setup Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Checklist</CardTitle>
                <CardDescription>Complete these steps to get started</CardDescription>
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
                    {stats.groupsCount > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span>Add student groups</span>
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
            <SchedulingDashboardChartsNew />
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
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Courses
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/sections">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Sections
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/rooms">
                      <DoorOpen className="mr-2 h-4 w-4" />
                      Manage Rooms
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/instructors">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Instructors
                    </Link>
                  </Button>
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
                  <Button className="w-full justify-start" variant="outline" disabled>
                    <GitBranch className="mr-2 h-4 w-4" />
                    Create Named Release
                  </Button>
                  <Button className="w-full justify-start" variant="outline" disabled>
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
      </div>
    </div>
  );
}

