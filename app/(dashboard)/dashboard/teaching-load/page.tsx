import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/supabase/server";
import { Users, Calendar, BookOpen, BarChart3, AlertCircle, Table2, DoorOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerUser, getDashboardPath, validateOnboardingAndProfile } from "@/lib/server-auth";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";
import { TeachingLoadDashboardCharts } from "@/components/teaching-load-dashboard-charts";
import { TeachingLoadSectionsTable } from "@/components/teaching-load-sections-table";
import { TeachingLoadRoomsTable } from "@/components/teaching-load-rooms-table";
import { getAllInstructors, getAllRoomsList } from "@/lib/data/sections-helpers";

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

  // Get current active term
  const { data: currentTerm } = await supabase
    .from('academic_term')
    .select('id')
    .in('status', ['draft', 'released'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get sections for the current term with related data
  let sectionIds: string[] | null = null;
  if (currentTerm) {
    const { data: scheduleSections } = await supabase
      .from('schedule')
      .select('section_id')
      .eq('term_id', currentTerm.id);
    
    sectionIds = (scheduleSections || []).map((s: { section_id: string }) => s.section_id);
  }

  // Build sections query
  let sectionsQuery = supabase
    .from('section')
    .select(`
      *,
      course:course!section_course_code_fkey(code, title, credits),
      instructor:faculty_profile!section_instructor_id_fkey(user_id, name, email),
      room:room!section_room_code_fkey(code, type)
    `);

  if (currentTerm && sectionIds && sectionIds.length > 0) {
    sectionsQuery = sectionsQuery.in('id', sectionIds);
  } else if (currentTerm && sectionIds && sectionIds.length === 0) {
    // Term exists but has no sections
  }

  const { data: sections } = await sectionsQuery.order('course_code', { ascending: true });

  // Get instructors and rooms lists for the tables
  const instructorsList = await getAllInstructors();
  const roomsList = await getAllRoomsList();

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
            {/* Teaching Load Charts */}
            <ClientOnly
              fallback={
                <Card>
                  <CardHeader>
                    <CardTitle>Loading Charts...</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Loading teaching load analytics...</p>
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
                  Edit instructor assignments for sections. Click the edit icon to change assignments.
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
                    sections={sections || []} 
                    instructors={instructorsList.map(i => ({ user_id: i.id, name: i.name }))}
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
                  Edit room assignments for sections. Click the edit icon to change room assignments. Rooms are filtered by activity type (Lab sections show Lab rooms, Lecture sections show Lecture rooms).
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
                    sections={sections || []} 
                    rooms={roomsList.map(r => ({ code: r.code, type: r.type, capacity: r.capacity }))}
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
                  <span>Collaborate with scheduling committee for optimal distribution</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

