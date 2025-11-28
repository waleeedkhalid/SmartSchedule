/**
 * Academic Plan Page (Mobile)
 * 
 * Displays the student's academic plan showing courses organized by level.
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { academicPlanRepository, type AcademicPlanCourse } from "@/app/mobile/lib/repositories/academic-plan.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface CoursesByLevel {
  [level: number]: AcademicPlanCourse[];
}

export default function AcademicPlanPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [courses, setCourses] = useState<AcademicPlanCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentLevel, setStudentLevel] = useState<number>(1);

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

    if (user?.role !== "student") {
      router.push("/mobile/schedule");
      return;
    }

    loadAcademicPlan();
  }, [isAuthenticated, user, router]);

  const loadAcademicPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await academicPlanRepository.getCourses();
      setCourses(data);
      
      // Get student level from user data if available
      if (user?.level) {
        setStudentLevel(user.level);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load academic plan";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Group courses by level
  const coursesByLevel = useMemo<CoursesByLevel>(() => {
    const grouped: CoursesByLevel = {};
    courses.forEach((course) => {
      const level = course.level || 0;
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(course);
    });

    // Sort courses within each level by code
    Object.keys(grouped).forEach((level) => {
      grouped[Number(level)].sort((a, b) => a.code.localeCompare(b.code));
    });

    return grouped;
  }, [courses]);

  // Get level numbers sorted
  const levels = useMemo(() => {
    return Object.keys(coursesByLevel)
      .map(Number)
      .filter((level) => level > 0)
      .sort((a, b) => a - b);
  }, [coursesByLevel]);

  if (!isAuthenticated || !user || user.role !== "student") {
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
                <GraduationCap className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Academic Plan</CardTitle>
                  <CardDescription>
                    Your complete course roadmap
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={loadAcademicPlan}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Academic Plan Content */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {/* Current Level Indicator */}
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-2xl font-bold">Level {studentLevel}</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {studentLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Courses by Level */}
            {levels.map((level) => {
              const levelCourses = coursesByLevel[level] || [];
              const requiredCourses = levelCourses.filter((c) => c.course_type === "required");
              const electiveCourses = levelCourses.filter((c) => c.course_type === "elective");
              const isCurrentLevel = level === studentLevel;

              return (
                <Card
                  key={level}
                  className={isCurrentLevel ? "border-blue-500 border-2" : ""}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Level {level}
                        {isCurrentLevel && (
                          <Badge variant="default" className="ml-2">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline">
                        {levelCourses.length} courses
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Required Courses */}
                    {requiredCourses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Required Courses ({requiredCourses.length})
                        </h4>
                        <div className="space-y-2">
                          {requiredCourses.map((course) => (
                            <div
                              key={course.code}
                              className="p-3 border rounded-lg bg-card"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">
                                    {course.code}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {course.name}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                  {course.credits} cr
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Elective Courses */}
                    {electiveCourses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                          Elective Courses ({electiveCourses.length})
                        </h4>
                        <div className="space-y-2">
                          {electiveCourses.map((course) => (
                            <div
                              key={course.code}
                              className="p-3 border rounded-lg bg-card"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">
                                    {course.code}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {course.name}
                                  </p>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  {course.credits} cr
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Electives (Level 0) */}
            {coursesByLevel[0] && coursesByLevel[0].length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    General Electives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coursesByLevel[0].map((course) => (
                      <div
                        key={course.code}
                        className="p-3 border rounded-lg bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {course.code}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {course.name}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {course.credits} cr
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {levels.length === 0 && coursesByLevel[0]?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-muted-foreground">No courses found</p>
                </CardContent>
              </Card>
            )}
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
          {user.role === "student" && (
            <Button
              variant="outline"
              onClick={() => router.push("/mobile/preferences")}
              className="flex-1"
            >
              Elective Preferences
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

