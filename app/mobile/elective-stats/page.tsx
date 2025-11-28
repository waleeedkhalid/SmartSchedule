/**
 * Elective Stats Page (Mobile)
 * 
 * Displays aggregated elective preference statistics for scheduling role.
 * Shows course-by-course breakdown of student preferences.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import {
  electiveStatsRepository,
  type ElectivePreferenceStat,
  type ElectiveStatsSummary,
} from "@/app/mobile/lib/repositories/elective-stats.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Heart, TrendingUp, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ElectiveStatsPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [stats, setStats] = useState<ElectivePreferenceStat[]>([]);
  const [summary, setSummary] = useState<ElectiveStatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/mobile/login");
      return;
    }

    if (user?.role !== "scheduling") {
      router.push("/mobile/schedule");
      return;
    }

    loadStats();
  }, [isAuthenticated, user, router]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await electiveStatsRepository.getStats();
      setStats(data.stats || []);
      setSummary(data.summary || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load elective stats";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user || user.role !== "scheduling") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/mobile/schedule")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <div>
                  <CardTitle>Elective Analytics</CardTitle>
                  <CardDescription>
                    Student preference statistics for elective courses
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-8 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={loadStats}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Content */}
        {!isLoading && !error && summary && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-l-4 border-l-pink-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Total Preferences</CardTitle>
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalRequests}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all electives</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">First Choices</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalFirstChoice}</div>
                  <p className="text-xs text-muted-foreground mt-1">#1 ranked</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Elective Courses</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.totalCourses}</div>
                  <p className="text-xs text-muted-foreground mt-1">With preferences</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Avg Requests</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.avgRequestsPerCourse}</div>
                  <p className="text-xs text-muted-foreground mt-1">Per course</p>
                </CardContent>
              </Card>
            </div>

            {/* Course-by-Course Breakdown */}
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {stat.course_code}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {stat.course_title}
                            </p>
                            {stat.level && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                Level {stat.level}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right ml-3">
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {stat.total_requests}
                            </div>
                            <p className="text-xs text-muted-foreground">Total</p>
                          </div>
                        </div>

                        {/* Preference Breakdown */}
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {stat.first_choice}
                            </div>
                            <p className="text-xs text-muted-foreground">1st</p>
                          </div>
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {stat.second_choice}
                            </div>
                            <p className="text-xs text-muted-foreground">2nd</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {stat.third_choice}
                            </div>
                            <p className="text-xs text-muted-foreground">3rd</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                              {stat.other_choice}
                            </div>
                            <p className="text-xs text-muted-foreground">Other</p>
                          </div>
                        </div>

                        {/* Visual Bar */}
                        {stat.total_requests > 0 && (
                          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                            {stat.first_choice > 0 && (
                              <div
                                className="bg-green-500"
                                style={{
                                  width: `${(stat.first_choice / stat.total_requests) * 100}%`,
                                }}
                              />
                            )}
                            {stat.second_choice > 0 && (
                              <div
                                className="bg-blue-500"
                                style={{
                                  width: `${(stat.second_choice / stat.total_requests) * 100}%`,
                                }}
                              />
                            )}
                            {stat.third_choice > 0 && (
                              <div
                                className="bg-purple-500"
                                style={{
                                  width: `${(stat.third_choice / stat.total_requests) * 100}%`,
                                }}
                              />
                            )}
                            {stat.other_choice > 0 && (
                              <div
                                className="bg-gray-500"
                                style={{
                                  width: `${(stat.other_choice / stat.total_requests) * 100}%`,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Insights Card */}
            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-base">📊 Scheduling Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                  <li>• High first-choice counts indicate popular courses</li>
                  <li>• May need multiple sections for high-demand courses</li>
                  <li>• Use this data to inform section creation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/mobile/schedule")}
            className="flex-1"
          >
            Back to Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

