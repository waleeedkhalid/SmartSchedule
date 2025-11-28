import { redirect } from 'next/navigation'
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { getFacultyProfile, getFacultyComments, getFacultySections } from '@/lib/db/faculty-data'
import { getServerUser } from '@/lib/server-auth'
import { FacultyFeedbackForm } from '@/components/faculty-feedback-form'
import { FacultyCommentsList } from '@/components/faculty-comments-list'

// Force dynamic rendering - this page is user-specific and checks authentication
export const dynamic = 'force-dynamic';

export default async function FacultyFeedbackPage() {
  const user = await getServerUser()

  if (!user || user.role !== 'faculty') {
    redirect('/dashboard')
  }

  // Get faculty profile, comments, and sections from database
  const [instructor, comments, sections] = await Promise.all([
    getFacultyProfile(user.id),
    getFacultyComments(user.id),
    getFacultySections(user.id),
  ]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/faculty">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

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
          <>
            {/* Page Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">Schedule Feedback</CardTitle>
                    <CardDescription className="mt-1">
                      Submit feedback on your assigned sections and schedules
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Submit New Feedback */}
            <FacultyFeedbackForm sections={sections} />

            {/* Existing Comments */}
            <FacultyCommentsList comments={comments} />

            {/* Help Info */}
            <Card className="bg-gray-50 dark:bg-gray-900/50">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Note:</span> Your feedback helps the scheduling committee 
                  improve the schedule. Comments are reviewed regularly and you will be notified when 
                  your feedback is addressed.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

