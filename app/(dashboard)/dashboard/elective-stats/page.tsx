import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { BarChart3, Heart, TrendingUp, Users, MessageSquare } from "lucide-react";
import { getElectivePreferenceStats } from "@/lib/db/elective-preferences";
import { getElectiveCommentStats, getElectiveComments } from "@/lib/db/elective-comments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ElectiveStatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has scheduling role with error handling
  let userRole;
  let roleError;

  try {
    const result = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    userRole = result.data;
    roleError = result.error;
  } catch (error) {
    // Catch any unexpected errors (network issues, etc.)
    console.warn('Unexpected error fetching user role in elective-stats:', error);
    redirect("/dashboard");
  }

  // Handle errors gracefully
  if (roleError) {
    // Handle PGRST errors specifically - these are query/RLS issues
    if (roleError.code?.startsWith('PGRST')) {
      console.warn('user_roles query error (PGRST) in elective-stats:', {
        code: roleError.code,
        message: roleError.message,
      });
    } else if (roleError.code !== 'PGRST116') {
      // PGRST116 is "not found" - expected, don't log
      console.warn('Error fetching user role in elective-stats:', {
        code: roleError.code,
        message: roleError.message,
      });
    }
    redirect("/dashboard");
  }

  if (!userRole || userRole.role !== 'scheduling') {
    redirect("/dashboard");
  }

  const stats = await getElectivePreferenceStats();
  const commentStats = await getElectiveCommentStats();
  const allComments = await getElectiveComments();

  // Calculate totals
  const totalRequests = stats.reduce((sum, s) => sum + s.total_requests, 0);
  const totalFirstChoice = stats.reduce((sum, s) => sum + s.first_choice, 0);
  const avgRequestsPerCourse = stats.length > 0 ? (totalRequests / stats.length).toFixed(1) : 0;
  const totalComments = commentStats.reduce((sum, s) => sum + s.total_comments, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Elective Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          View aggregated student preferences and feedback for elective courses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Preferences</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all electives
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">First Choices</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFirstChoice}</div>
            <p className="text-xs text-muted-foreground mt-1">
              #1 ranked preferences
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Elective Courses</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With preferences
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Student Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalComments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total feedback
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Requests</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRequestsPerCourse}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per course
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">Student Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Detailed Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course-by-Course Breakdown</CardTitle>
              <CardDescription>
                See how many students ranked each elective course
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No preferences submitted yet</p>
                  <p className="text-sm mt-1">Students haven&apos;t submitted elective preferences</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.course_code}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{stat.course_code}</h3>
                          <p className="text-sm text-muted-foreground">{stat.course_title}</p>
                          <Badge variant="outline" className="mt-1">
                            Level {stat.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stat.total_requests}
                          </div>
                          <p className="text-xs text-muted-foreground">Total Requests</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-3 rounded-lg">
                          <div className="text-lg font-bold text-green-700 dark:text-green-300">
                            {stat.first_choice}
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-400">1st Choice</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 rounded-lg">
                          <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {stat.second_choice}
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400">2nd Choice</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-3 rounded-lg">
                          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {stat.third_choice}
                          </div>
                          <p className="text-xs text-purple-600 dark:text-purple-400">3rd Choice</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                            {stat.other_choice}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Other</p>
                        </div>
                      </div>

                      {/* Visual bar */}
                      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        {stat.first_choice > 0 && (
                          <div
                            className="bg-green-500"
                            style={{ width: `${(stat.first_choice / stat.total_requests) * 100}%` }}
                          />
                        )}
                        {stat.second_choice > 0 && (
                          <div
                            className="bg-blue-500"
                            style={{ width: `${(stat.second_choice / stat.total_requests) * 100}%` }}
                          />
                        )}
                        {stat.third_choice > 0 && (
                          <div
                            className="bg-purple-500"
                            style={{ width: `${(stat.third_choice / stat.total_requests) * 100}%` }}
                          />
                        )}
                        {stat.other_choice > 0 && (
                          <div
                            className="bg-gray-500"
                            style={{ width: `${(stat.other_choice / stat.total_requests) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              📊 Scheduling Insights
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
              <li>• High first-choice counts indicate popular courses that may need multiple sections</li>
              <li>• Low total requests may indicate courses that could be cut or consolidated</li>
              <li>• Use this data to inform section creation and instructor assignments</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Student Comments</CardTitle>
              <CardDescription>
                Feedback and requests from students regarding elective courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allComments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No comments submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{comment.course_code}</h4>
                          <p className="text-sm text-muted-foreground">{comment.course?.title}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

