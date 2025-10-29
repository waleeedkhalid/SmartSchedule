import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/supabase/server'
import { Calendar, Clock, BookOpen, MessageSquare, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCommentStats } from '@/lib/db/schedule-comments'
import { getFacultyProfile, getFacultySections, getFacultyStats } from '@/lib/db/faculty'
import { SectionCard } from '@/components/faculty/section-card'

export default async function FacultyDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user has faculty role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (userRole?.role !== 'faculty') {
    redirect('/dashboard')
  }

  // Get faculty profile using database access layer
  const instructor = await getFacultyProfile(user.id)

  // Get sections and comment stats in parallel
  const [sections, commentStats] = instructor 
    ? await Promise.all([
        getFacultySections(instructor.id),
        getCommentStats(user.id),
      ])
    : [[], await getCommentStats(user.id)]

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
            Welcome, {userRole.name}
          </p>
        </div>

        {!instructor ? (
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-5 w-5" />
                Profile Not Linked
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              <p>Your account is not yet linked to an instructor profile.</p>
              <p className="mt-2">Please contact the scheduling committee to link your account with email: <strong>{user.email}</strong></p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                    {sections.length} / {instructor.max_load_per_week || 12}
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
                        {instructor.max_load_per_week || 12} sections per week
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Preferred Times</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(instructor.preferred_times) && instructor.preferred_times.length > 0
                          ? 'Configured'
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Unavailable Times</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {Array.isArray(instructor.unavailable_times) && instructor.unavailable_times.length > 0
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
                  Schedule Feedback Summary
                </CardTitle>
                <CardDescription>Your submitted comments and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                    <p className="text-2xl font-bold">{commentStats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                    <p className="text-2xl font-bold text-amber-600">{commentStats.unresolved}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{commentStats.resolved}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">General Feedback</p>
                    <p className="text-2xl font-bold">{commentStats.general}</p>
                  </div>
                </div>
                {commentStats.total > 0 && (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/faculty/feedback">
                        View All Comments
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

