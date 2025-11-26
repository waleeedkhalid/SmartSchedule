import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server";
import { Users, Calendar, BookOpen, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";

export default async function TeachingLoadDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // If authenticated but wrong role, redirect to dashboard (which will redirect to correct role)
  if (user.role !== 'teaching_load') {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Get instructors with their section counts
  const { data: instructors } = await supabase
    .from('instructor')
    .select(`
      id,
      name,
      max_load_per_week,
      section:section(count)
    `);

  // Get total sections and courses
  const [sectionsCount, coursesCount] = await Promise.all([
    supabase.from('section').select('*', { count: 'exact', head: true }),
    supabase.from('course').select('*', { count: 'exact', head: true }),
  ]);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instructors</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instructors?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Total faculty members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sections</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sectionsCount.count || 0}</div>
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
              <div className="text-2xl font-bold">{coursesCount.count || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Available courses
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Instructor Load Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Instructor Load Overview
              </CardTitle>
              <CardDescription>
                Teaching hours per instructor (based on sections assigned)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {instructors && instructors.length > 0 ? (
                <div className="space-y-4">
                  {instructors.map((instructor, index) => {
                    const sectionCount = Array.isArray(instructor.section) 
                      ? instructor.section.length 
                      : 0;
                    const maxLoad = instructor.max_load_per_week || 12;
                    const loadPercentage = Math.min((sectionCount / maxLoad) * 100, 100);
                    const isOverloaded = sectionCount > maxLoad;

                    return (
                      <div key={instructor.id || `instructor-${index}`} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{instructor.name}</span>
                          <span className={isOverloaded ? "text-red-600" : "text-gray-600"}>
                            {sectionCount} / {maxLoad} sections
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverloaded 
                                ? "bg-red-500" 
                                : loadPercentage > 80 
                                ? "bg-yellow-500" 
                                : "bg-green-500"
                            }`}
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No instructors found. Add instructors to track teaching loads.</p>
                </div>
              )}
            </CardContent>
          </Card>

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
                  <span>Collaborate with scheduling committee for optimal distribution</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

