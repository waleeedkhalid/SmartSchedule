import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, MessageSquare, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'
import { getFacultyProfile, getFacultySections } from '@/lib/db/faculty'
import { getUserComments, getCommentStats } from '@/lib/db/schedule-comments'
import { SectionCard } from '@/components/faculty/section-card'
import { CommentFormWrapper } from '@/components/faculty/comment-form-wrapper'
import { CommentListWrapper } from '@/components/faculty/comment-list-wrapper'

export const dynamic = 'force-dynamic';

export default async function FacultyFeedbackPage() {
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
    .single()

  if (userRole?.role !== 'faculty') {
    redirect('/dashboard')
  }

  // Get faculty profile
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

  // Fetch all data in parallel for better performance
  const [sections, comments, stats] = await Promise.all([
    getFacultySections(instructor.id),
    getUserComments(user.id),
    getCommentStats(user.id),
  ])

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Schedule Feedback
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Share feedback on your teaching schedule
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="text-base py-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                {stats.total} Comments
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unresolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.unresolved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assigned Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sections.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="submit">
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Feedback
            </TabsTrigger>
            <TabsTrigger value="my-comments">
              My Comments ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="sections">
              <BookOpen className="h-4 w-4 mr-2" />
              My Sections ({sections.length})
            </TabsTrigger>
          </TabsList>

          {/* Submit Feedback Tab */}
          <TabsContent value="submit" className="space-y-6">
            <CommentFormWrapper
              sections={sections.map(s => ({
                id: s.id,
                course_code: s.course_code,
                course_title: s.course_title,
                section_no: s.section_no,
              }))}
            />
          </TabsContent>

          {/* My Comments Tab */}
          <TabsContent value="my-comments">
            <CommentListWrapper comments={comments as any[]} />
          </TabsContent>

          {/* My Sections Tab */}
          <TabsContent value="sections" className="space-y-4">
            {sections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No Sections Assigned</p>
                  <p className="text-sm mt-1">
                    You will see your teaching assignments here once the schedule is published
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <SectionCard key={section.id} section={section} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

