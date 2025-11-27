/**
 * Academic Plan View Component
 * 
 * Displays courses organized by level in a grid layout
 * Shows required and elective courses with visual distinction
 * 
 * OPTIMIZATION: Uses React Query with aggressive caching (1 hour)
 * to prevent redundant refetching when navigating away and returning.
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useAcademicPlan } from "@/hooks/use-academic-plan";
import { useEffect } from "react";

export function AcademicPlanView({ studentLevel }: { studentLevel: number }) {
  const { coursesByLevel, isLoading, error } = useAcademicPlan();

  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast.error('Failed to load academic plan');
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading academic plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-destructive">Failed to load academic plan</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Get all levels and sort them
  const levels = Object.keys(coursesByLevel)
    .map(Number)
    .sort((a, b) => a - b)
    .filter(level => level > 0); // Filter out level 0 (electives)

  // Separate electives (level 0 or no level)
  const electives = coursesByLevel[0] || [];

  return (
    <div className="space-y-6">
      {/* Required Courses by Level */}
      {levels.map((level) => {
        const courses = coursesByLevel[level] || [];
        const isCurrentLevel = level === studentLevel;
        const isPastLevel = level < studentLevel;
        const isFutureLevel = level > studentLevel;

        return (
          <Card 
            key={level}
            className={isCurrentLevel ? "border-blue-500 border-2" : ""}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Level {level}
                {isCurrentLevel && (
                  <Badge variant="default" className="ml-2">
                    Current Level
                  </Badge>
                )}
                {isPastLevel && (
                  <Badge variant="secondary" className="ml-2">
                    Completed
                  </Badge>
                )}
                {isFutureLevel && (
                  <Badge variant="outline" className="ml-2">
                    Upcoming
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses at this level</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {courses.map((course) => (
                    <div
                      key={course.code}
                      className="p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">{course.code}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                        </Badge>
                        {course.course_type === 'required' ? (
                          <Badge variant="default" className="text-xs">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Elective
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Elective Courses Section */}
      {electives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Elective Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {electives.map((course) => (
                <div
                  key={course.code}
                  className="p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{course.code}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Elective
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {levels.length === 0 && electives.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">No Courses Available</p>
              <p className="text-sm text-muted-foreground">
                Course information will appear here once it&apos;s added to the system.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

