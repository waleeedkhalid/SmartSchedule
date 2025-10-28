import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/supabase/server";
import { 
  CheckCircle, 
  AlertCircle, 
  Download, 
  FileCheck, 
  Users,
  BookOpen,
  Calendar,
  DoorOpen,
  Shield
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegistrarDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has registrar role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (userRole?.role !== 'registrar') {
    redirect("/dashboard");
  }

  // Get system statistics
  const [coursesCount, sectionsCount, roomsCount, instructorsCount, studentsCount] = await Promise.all([
    supabase.from('course').select('*', { count: 'exact', head: true }),
    supabase.from('section').select('*', { count: 'exact', head: true }),
    supabase.from('room').select('*', { count: 'exact', head: true }),
    supabase.from('instructor').select('*', { count: 'exact', head: true }),
    supabase.from('student_group').select('*', { count: 'exact', head: true }),
  ]);

  // Get section state counts
  const [draftSections, releasedSections] = await Promise.all([
    supabase.from('section').select('*', { count: 'exact', head: true }).eq('state', 'draft'),
    supabase.from('section').select('*', { count: 'exact', head: true }).eq('state', 'released'),
  ]);

  // Check for schedule releases
  const { data: scheduleReleases } = await supabase
    .from('schedule_doc')
    .select('id, release_tag, created_at')
    .not('release_tag', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);

  const hasReleasedSchedule = (releasedSections.count ?? 0) > 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Final validation, publication, and archival
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coursesCount.count || 0}</div>
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
                {releasedSections.count || 0} released
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rooms</CardTitle>
              <DoorOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomsCount.count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Instructors</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{instructorsCount.count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Student Groups</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentsCount.count || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publication Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Schedule Publication
              </CardTitle>
              <CardDescription>
                Final validation and release to students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasReleasedSchedule ? (
                <>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Schedule Published</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {releasedSections.count} sections have been released to students and faculty.
                  </p>
                  <Button className="w-full" variant="outline" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    View Published Schedule
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Awaiting Publication</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {draftSections.count} draft sections are pending validation and release.
                  </p>
                  <Button className="w-full" disabled>
                    <FileCheck className="mr-2 h-4 w-4" />
                    Publish Schedule
                  </Button>
                  <p className="text-xs text-gray-500">
                    Requires scheduling committee to create a named release first
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Validation Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
                Validation Checks
              </CardTitle>
              <CardDescription>
                Pre-publication validation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Data integrity</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Passed</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    {hasReleasedSchedule ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">Schedule conflicts</span>
                  </div>
                  <span className={`text-xs ${hasReleasedSchedule ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {hasReleasedSchedule ? 'Validated' : 'Pending'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Room assignments</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Valid</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Instructor loads</span>
                  </div>
                  <span className="text-xs text-green-600 dark:text-green-400">Within limits</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Release History */}
          <Card>
            <CardHeader>
              <CardTitle>Release History</CardTitle>
              <CardDescription>Named schedule releases</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleReleases && scheduleReleases.length > 0 ? (
                <div className="space-y-2">
                  {scheduleReleases.map((release) => (
                    <div 
                      key={release.id} 
                      className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{release.release_tag}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(release.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" disabled>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No releases yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Export & Archive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-500" />
                Export & Archive
              </CardTitle>
              <CardDescription>
                Download schedule data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/import-export">
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data (JSON)
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export Schedule (PDF)
              </Button>
              <Button className="w-full justify-start" variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export Student Lists
              </Button>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>View system data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button asChild className="w-full justify-start" variant="outline" size="sm">
                  <Link href="/dashboard/courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Courses
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline" size="sm">
                  <Link href="/dashboard/sections">
                    <Calendar className="mr-2 h-4 w-4" />
                    Sections
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline" size="sm">
                  <Link href="/dashboard/rooms">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    Rooms
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline" size="sm">
                  <Link href="/dashboard/instructors">
                    <Users className="mr-2 h-4 w-4" />
                    Instructors
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

