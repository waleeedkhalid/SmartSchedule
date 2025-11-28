import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server";
import { Users, Calendar, BookOpen, BarChart3, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser, getDashboardPath, validateOnboardingAndProfile } from "@/lib/server-auth";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";

export default async function TeachingLoadDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== 'teaching_load') {
    // If role is missing, user needs onboarding
    if (!user.role) {
      redirect("/onboarding");
    }
    // Otherwise redirect to their correct dashboard
    const correctDashboard = getDashboardPath(user.role);
    redirect(correctDashboard);
  }

  // Validate onboarding and profile status
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(user.id, user.role)
  
  if (needsOnboarding || !profileExists) {
    redirect('/onboarding')
  }

  const supabase = await createClient();

  // Get faculty profiles with their section counts
  const { data: instructors } = await supabase
    .from('faculty_profile')
    .select(`
      user_id,
      name,
      max_load_per_week,
      section:section!section_instructor_id_fkey(count)
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

        {/* Timeline and Notifications Section - Wrapped in ClientOnly to prevent hydration errors from date-fns */}
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
          {/* Instructor Load Overview - Wrapped in ClientOnly to prevent hydration errors from floating point calculations and style mismatches */}
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
              <ClientOnly
                fallback={
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                }
              >
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
                        <div key={instructor.user_id || `instructor-${index}`} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{instructor.name || "Unknown"}</span>
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
              </ClientOnly>
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

