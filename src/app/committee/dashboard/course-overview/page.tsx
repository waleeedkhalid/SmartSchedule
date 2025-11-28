/**
 * Course Overview Dashboard
 * Shows course-level statistics and room usage
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { getActiveTerm } from "@/lib/queries/cached-queries";
import { getCourseStatistics, getRoomStatistics } from "@/lib/queries/dashboard-queries";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, MapPin, Users, TrendingUp } from "lucide-react";
import { CourseOverviewCharts } from "@/components/committee/CourseOverviewCharts";

export default async function CourseOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const allowedRoles = ["scheduling_committee", "teaching_load_committee", "registrar"];

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    redirect(redirectByRole(profile?.role));
  }

  const activeTerm = await getActiveTerm();
  if (!activeTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>No active term found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/committee/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Course Overview</h1>
            <p className="text-muted-foreground">
              Course statistics, room usage, and capacity analysis
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Term</p>
            <p className="font-semibold">{activeTerm.name}</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <CourseOverviewContent termCode={activeTerm.code} />
      </Suspense>
    </div>
  );
}

async function CourseOverviewContent({ termCode }: { termCode: string }) {
  const [courses, rooms] = await Promise.all([
    getCourseStatistics(termCode),
    getRoomStatistics(termCode),
  ]);

  // Calculate totals
  const totalCourses = courses.length;
  const totalSections = courses.reduce((sum, c) => sum + c.sectionCount, 0);
  const totalRooms = rooms.length;
  const avgUtilization = courses.length > 0
    ? (courses.reduce((sum, c) => sum + c.utilization, 0) / courses.length).toFixed(1)
    : "0";

  // Get top utilized courses
  const topUtilized = [...courses]
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 5);

  // Get underutilized courses
  const underUtilized = [...courses]
    .sort((a, b) => a.utilization - b.utilization)
    .filter((c) => c.utilization < 70)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {totalSections} sections total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms in Use</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Active classrooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.reduce((sum, c) => sum + c.totalCapacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Seats available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <CourseOverviewCharts courses={courses} rooms={rooms} />

      {/* Top and Underutilized Courses */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Most Utilized */}
        <Card>
          <CardHeader>
            <CardTitle>Top Utilized Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUtilized.map((course) => (
                <div key={course.courseCode} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{course.courseCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.enrolledCount}/{course.totalCapacity} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {course.utilization.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.sectionCount} sections
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Underutilized */}
        <Card>
          <CardHeader>
            <CardTitle>Underutilized Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {underUtilized.length > 0 ? (
              <div className="space-y-3">
                {underUtilized.map((course) => (
                  <div key={course.courseCode} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{course.courseCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.enrolledCount}/{course.totalCapacity} students
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-600">
                        {course.utilization.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.sectionCount} sections
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                All courses are well utilized
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Course</th>
                  <th className="text-right p-2">Sections</th>
                  <th className="text-right p-2">Capacity</th>
                  <th className="text-right p-2">Enrolled</th>
                  <th className="text-right p-2">Utilization</th>
                  <th className="text-right p-2">Rooms</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.courseCode} className="border-b">
                    <td className="p-2">
                      <p className="font-medium">{course.courseCode}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.courseName}
                      </p>
                    </td>
                    <td className="text-right p-2">{course.sectionCount}</td>
                    <td className="text-right p-2">{course.totalCapacity}</td>
                    <td className="text-right p-2">{course.enrolledCount}</td>
                    <td className="text-right p-2">
                      <span
                        className={
                          course.utilization >= 90
                            ? "text-green-600 font-semibold"
                            : course.utilization < 70
                              ? "text-yellow-600"
                              : ""
                        }
                      >
                        {course.utilization.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-2">
                      {course.rooms.join(", ") || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

