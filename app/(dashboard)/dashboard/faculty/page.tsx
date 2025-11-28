import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, BookOpen, MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getFacultyProfile, getFacultySections } from '@/lib/db/faculty-data'
import { SectionCard } from '@/components/faculty/section-card'
import { FacultyDashboardChartsWrapper } from '@/components/faculty-dashboard-charts-wrapper'
import { getServerUser, getDashboardPath, validateOnboardingAndProfile } from '@/lib/server-auth'
import { UpcomingDeadlinesWidget } from '@/components/upcoming-deadlines-widget'
import { RoleNotificationsWidget } from '@/components/role-notifications-widget'
import { ClientOnly } from '@/components/client-only'

export default async function FacultyDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser()

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect('/login')
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== 'faculty') {
    // If role is missing, user needs onboarding
    if (!user.role) {
      redirect('/onboarding')
    }
    // Otherwise redirect to their correct dashboard
    const correctDashboard = getDashboardPath(user.role)
    redirect(correctDashboard)
  }

  // Validate onboarding and profile status
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(user.id, user.role)
  
  if (needsOnboarding || !profileExists) {
    redirect('/onboarding')
  }

  // Get faculty profile from database
  const facultyProfile = await getFacultyProfile(user.id)
  
  // If profile doesn't exist, still allow access (they'll see warning)

  // Get sections assigned to this faculty member
  const sections = facultyProfile 
    ? await getFacultySections(facultyProfile.user_id)
    : []

  // Calculate stats from sections
  const uniqueCourses = new Set(sections.map(s => s.course_code)).size

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Faculty Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome, {user?.name || 'Faculty Member'}
          </p>
        </div>

        {!facultyProfile ? (
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
                Please complete onboarding to set up your profile. 
                If you have already completed onboarding, please contact the scheduling committee with your email: <strong>{user?.email || 'N/A'}</strong>
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                <UpcomingDeadlinesWidget userRole="faculty" />
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
                <RoleNotificationsWidget role="faculty" />
              </ClientOnly>
            </div>

            {/* Charts Section - Wrapped in ClientOnly to prevent hydration errors from Chart.js */}
            <div className="mb-8">
              <ClientOnly
                fallback={
                  <Card>
                    <CardHeader>
                      <CardTitle>Faculty Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Loading charts...</p>
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <FacultyDashboardChartsWrapper />
              </ClientOnly>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Sections</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sections.length}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Current semester
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Weekly Load</CardTitle>
                  <Clock className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sections.length} / {facultyProfile.max_load_per_week || 12}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Sections per week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {uniqueCourses}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique courses
                  </p>
                </CardContent>
              </Card>
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
                    <p className="text-sm mt-1">Check back after the schedule is published</p>
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
                      <p className="font-medium text-gray-700 dark:text-gray-300">Max Load</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {facultyProfile.max_load_per_week || 12} sections per week
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Preferred Times</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(facultyProfile.preferred_times) && facultyProfile.preferred_times.length > 0
                          ? 'Configured'
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Unavailable Times</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(facultyProfile.unavailable_times) && facultyProfile.unavailable_times.length > 0
                          ? 'Configured'
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                  Schedule Feedback
                </CardTitle>
                <CardDescription>Submit and track your schedule feedback</CardDescription>
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
                        Help improve the schedule by sharing your feedback on assigned sections, 
                        timing preferences, or any concerns you may have.
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
        )}
      </div>
    </div>
  );
}

