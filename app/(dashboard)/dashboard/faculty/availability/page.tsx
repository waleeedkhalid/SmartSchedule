import { redirect } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { FacultyAvailabilityGrid } from '@/components/faculty-availability-grid'
import { getFacultyProfile } from '@/lib/db/faculty-data'
import { getServerUser, getDashboardPath } from '@/lib/server-auth'

export default async function FacultyAvailabilityPage() {
  const user = await getServerUser()

  if (!user || user.role !== 'faculty') {
    redirect('/dashboard')
  }

  // Get faculty profile from database
  const instructor = await getFacultyProfile(user.id)

  if (!instructor) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/dashboard/faculty">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <Alert variant="destructive">
            <AlertTitle>Profile Not Found</AlertTitle>
            <AlertDescription>
              Your account is not linked to an instructor profile. Please contact the scheduling committee.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Get current availability from instructor record
  const availability = {
    preferred_times: instructor.preferred_times || [],
    unavailable_times: instructor.unavailable_times || [],
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard/faculty">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Availability Preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Set your preferred and unavailable teaching times
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-base text-blue-900 dark:text-blue-100">
              How This Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>Preferred Times:</strong> Mark times when you prefer to teach. The scheduling system will try to assign your sections during these times.
            </p>
            <p>
              <strong>Unavailable Times:</strong> Mark times when you are absolutely unavailable (meetings, other commitments, etc.). The system will avoid scheduling you during these times.
            </p>
            <p>
              <strong>Note:</strong> These are preferences, not guarantees. The final schedule depends on multiple constraints including room availability, student schedules, and department requirements.
            </p>
          </CardContent>
        </Card>

        {/* Current Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Current Settings</CardTitle>
            <CardDescription>Your teaching load configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Load Per Week</p>
                <p className="text-2xl font-bold">{instructor.max_load_per_week || 12} sections</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preferred Times Set</p>
                <p className="text-2xl font-bold text-green-600">
                  {Array.isArray(availability?.preferred_times) 
                    ? availability.preferred_times.reduce((sum: number, d: any) => sum + (d.slots?.length || 0), 0)
                    : 0} slots
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unavailable Times Set</p>
                <p className="text-2xl font-bold text-red-600">
                  {Array.isArray(availability?.unavailable_times)
                    ? availability.unavailable_times.reduce((sum: number, d: any) => sum + (d.slots?.length || 0), 0)
                    : 0} slots
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Grid */}
        <FacultyAvailabilityGrid
          instructorId={instructor.id}
          initialPreferredTimes={Array.isArray(availability?.preferred_times) ? availability.preferred_times : []}
          initialUnavailableTimes={Array.isArray(availability?.unavailable_times) ? availability.unavailable_times : []}
          maxLoadPerWeek={instructor.max_load_per_week || 12}
        />
      </div>
    </div>
  );
}

