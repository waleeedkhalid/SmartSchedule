import { redirect } from 'next/navigation'
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { getFacultyProfile } from '@/lib/db/faculty-data'
import { getServerUser } from '@/lib/server-auth'

export const dynamic = 'force-dynamic';

export default async function FacultyFeedbackPage() {
  const user = await getServerUser()

  if (!user || user.role !== 'faculty') {
    redirect('/dashboard')
  }

  // Get faculty profile from database
  const instructor = await getFacultyProfile(user.id)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/faculty">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {!instructor ? (
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Profile Not Linked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Profile Not Found</AlertTitle>
                <AlertDescription>
                  Your account is not linked to an instructor profile. Please contact the scheduling committee.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Schedule Feedback</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Feature temporarily under maintenance
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg mb-2">
                  We&apos;re Upgrading the Feedback System
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                  We&apos;re enhancing the comment system to support feedback from all users (students, faculty, and staff). 
                  This page will be back online shortly.
                </p>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2 mb-4">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    What&apos;s being updated:
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>Multi-user comment support (students, faculty, staff)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>Enhanced feedback management interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>Improved comment resolution tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>Better section-specific feedback tools</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link href="/maintenance">
                    <Button variant="outline" size="sm">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Learn More
                    </Button>
                  </Link>
                  <Link href="/dashboard/faculty">
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <span className="font-semibold">Other features are working:</span> You can still view your schedule, 
                  update availability, and access all other faculty dashboard features.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

