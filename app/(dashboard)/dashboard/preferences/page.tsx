import { ElectivePreferenceManager } from "@/components/elective-preference-manager";
import { ElectiveCommentSection } from "@/components/elective-comment-section";
import { PreferencesTabSwitcher } from "@/components/preferences-tab-switcher";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart, MessageSquare, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getServerUser } from "@/lib/server-auth";

export default async function PreferencesPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has student role
  if (user.role !== 'student') {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Get student's current preferences
  // Uses idx_elective_preference_student index
  // Note: For demo users, this will return empty (demo users don't have DB records)
  const { data: preferences } = await supabase
    .from('elective_preference')
    .select(`
      id,
      course_code,
      rank,
      course:course!elective_preference_course_code_fkey(code, title, recommended_level, credits, is_elective)
    `)
    .eq('student_id', user.id)
    .order('rank', { ascending: true });

  // Get all available elective courses
  // Uses indexes: idx_course_is_elective, idx_course_level_elective (composite)
  const { data: electiveCourses } = await supabase
    .from('course')
    .select('*')
    .eq('is_elective', true)
    .order('recommended_level', { ascending: true, nullsFirst: false })
    .order('code', { ascending: true });

  // Get student's comments
  const { data: comments } = await supabase
    .from('elective_comment')
    .select(`
      *,
      course:course!elective_comment_course_code_fkey(code, title, recommended_level, credits)
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  // Group comments by course
  const commentsByCourse: Record<string, NonNullable<typeof comments>> = {};
  comments?.forEach((comment) => {
    if (!commentsByCourse[comment.course_code]) {
      commentsByCourse[comment.course_code] = [];
    }
    commentsByCourse[comment.course_code].push(comment);
  });

  const preferenceCount = preferences?.length || 0;
  const commentCount = comments?.length || 0;
  const recommendedMinPrefs = 3;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/dashboard/student">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Elective Preferences
          </h1>
          <p className="text-muted-foreground mt-1">
            Select and rank your preferred elective courses
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Heart className="h-3 w-3 mr-1" />
            {preferenceCount} Preferences
          </Badge>
          <Badge variant="outline" className="text-sm">
            <MessageSquare className="h-3 w-3 mr-1" />
            {commentCount} Comments
          </Badge>
        </div>
      </div>

      {/* Alert for incomplete preferences */}
      {preferenceCount < recommendedMinPrefs && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">
            Add More Preferences
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You have {preferenceCount} of {recommendedMinPrefs} recommended preferences. 
            Adding more increases your chances of enrollment!
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-4 w-4" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">1.</span>
              <span><strong>Select courses</strong> from the available electives</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">2.</span>
              <span><strong>Drag to reorder</strong> your preferences (1 = most preferred)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">3.</span>
              <span><strong>Add comments</strong> about why you&apos;re interested in specific courses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">4.</span>
              <span><strong>Save regularly</strong> - you can update until scheduling is finalized</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Manage Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>My Comments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <ElectivePreferenceManager
            initialPreferences={(preferences as any) || []}
            availableElectives={electiveCourses || []}
          />
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {preferenceCount === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No Preferences Yet</p>
                <p className="text-sm mt-1 mb-4">
                  Add some preferences first, then you can comment on them
                </p>
                <PreferencesTabSwitcher targetValue="preferences" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {preferences && preferences.map((pref: any, index) => (
                <Card key={pref.course_code}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pref.course?.code}</CardTitle>
                          <CardDescription>{pref.course?.title}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pref.course?.recommended_level && (
                          <Badge variant="secondary">Level {pref.course.recommended_level}</Badge>
                        )}
                        <Badge variant="secondary">{pref.course?.credits} cr</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ElectiveCommentSection
                      courseCode={pref.course_code}
                      courseTitle={pref.course?.title || pref.course_code}
                      initialComments={commentsByCourse[pref.course_code] || []}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

