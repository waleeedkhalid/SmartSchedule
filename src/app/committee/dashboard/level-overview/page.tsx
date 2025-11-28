/**
 * Level Overview Dashboard
 * Shows per-level statistics and visualizations
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { getActiveTerm } from "@/lib/queries/cached-queries";
import { getLevelStatistics } from "@/lib/queries/dashboard-queries";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, BookOpen, User as UserIcon, TrendingUp } from "lucide-react";
import { LevelOverviewCharts } from "@/components/committee/LevelOverviewCharts";

export default async function LevelOverviewPage() {
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
            <h1 className="text-3xl font-bold mb-2">Level Overview</h1>
            <p className="text-muted-foreground">
              Statistics and enrollment data by academic level
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active Term</p>
            <p className="font-semibold">{activeTerm.name}</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <LevelOverviewContent termCode={activeTerm.code} />
      </Suspense>
    </div>
  );
}

async function LevelOverviewContent({ termCode }: { termCode: string }) {
  const stats = await getLevelStatistics(termCode);

  // Calculate totals
  const totals = stats.reduce(
    (acc, level) => ({
      students: acc.students + level.studentCount,
      sections: acc.sections + level.sectionCount,
      instructors: acc.instructors + level.instructorCount,
      capacity: acc.capacity + level.totalCapacity,
      enrolled: acc.enrolled + level.enrolledCount,
    }),
    { students: 0, sections: 0, instructors: 0, capacity: 0, enrolled: 0 }
  );

  const overallUtilization = totals.capacity > 0 
    ? ((totals.enrolled / totals.capacity) * 100).toFixed(1) 
    : "0";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.students}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.length} levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.sections}</div>
            <p className="text-xs text-muted-foreground">
              {totals.capacity} total capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.instructors}</div>
            <p className="text-xs text-muted-foreground">
              Teaching this term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallUtilization}%</div>
            <p className="text-xs text-muted-foreground">
              {totals.enrolled} / {totals.capacity} enrolled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <LevelOverviewCharts stats={stats} />

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Level Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Level</th>
                  <th className="text-right p-2">Students</th>
                  <th className="text-right p-2">Sections</th>
                  <th className="text-right p-2">Instructors</th>
                  <th className="text-right p-2">Capacity</th>
                  <th className="text-right p-2">Enrolled</th>
                  <th className="text-right p-2">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((level) => {
                  const utilization = level.totalCapacity > 0
                    ? ((level.enrolledCount / level.totalCapacity) * 100).toFixed(1)
                    : "0";
                  
                  return (
                    <tr key={level.level} className="border-b">
                      <td className="p-2 font-medium">Level {level.level}</td>
                      <td className="text-right p-2">{level.studentCount}</td>
                      <td className="text-right p-2">{level.sectionCount}</td>
                      <td className="text-right p-2">{level.instructorCount}</td>
                      <td className="text-right p-2">{level.totalCapacity}</td>
                      <td className="text-right p-2">{level.enrolledCount}</td>
                      <td className="text-right p-2">{utilization}%</td>
                    </tr>
                  );
                })}
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

