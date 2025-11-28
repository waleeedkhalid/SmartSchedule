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
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, CheckCircle2, Clock, Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import { useAcademicPlan } from "@/hooks/use-academic-plan";
import { useEffect, useMemo } from "react";
import React from "react";
import { 
  getElectivePackageCourseCodes,
  getPackagesWithCompletion
} from "@/lib/utils/elective-packages";

interface Course {
  code: string;
  name: string;
  credits: number;
  level: number;
  course_type: "required" | "elective";
}

interface CoursesByLevel {
  [level: number]: Course[];
}

export function AcademicPlanView({ 
  studentLevel,
  completedCourseCodes = [],
  initialCourses = []
}: { 
  studentLevel: number;
  completedCourseCodes?: string[];
  initialCourses?: Array<{
    code: string;
    name: string;
    credits: number;
    level: number;
    course_type: "required" | "elective";
  }>;
}) {
  // Use server-fetched data if available, otherwise fall back to client hook
  const { coursesByLevel: clientCoursesByLevel, isLoading, error } = useAcademicPlan();
  
  // Transform initial courses to coursesByLevel format if provided
  const serverCoursesByLevel = useMemo<CoursesByLevel>(() => {
    if (!initialCourses || initialCourses.length === 0) {
      return {};
    }
    
    const grouped: CoursesByLevel = {};
    initialCourses.forEach((course) => {
      const level = Number(course.level) || 0;
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push({
        code: course.code,
        name: course.name,
        credits: course.credits,
        level: course.level,
        course_type: course.course_type,
      });
    });
    
    // Sort courses within each level by code
    Object.keys(grouped).forEach((level) => {
      grouped[Number(level)].sort((a, b) => a.code.localeCompare(b.code));
    });
    
    return grouped;
  }, [initialCourses]);
  
  // Prefer server data, fall back to client data
  // Only show loading/error if we don't have server data
  const hasServerData = initialCourses.length > 0;
  const coursesByLevel = hasServerData ? serverCoursesByLevel : clientCoursesByLevel;
  const isActuallyLoading = !hasServerData && isLoading;
  const hasError = !hasServerData && error;

  // Get elective package course codes to filter them out
  const electivePackageCodes = useMemo(() => getElectivePackageCourseCodes(), []);

  // Filter out elective package courses from level-based courses
  const filteredCoursesByLevel = useMemo(() => {
    const filtered: typeof coursesByLevel = {};
    Object.keys(coursesByLevel).forEach((levelStr) => {
      const level = Number(levelStr);
      if (level > 0) {
        // Filter out courses that belong to elective packages
        filtered[level] = (coursesByLevel[level] || []).filter(
          (course) => !electivePackageCodes.has(course.code)
        );
      }
    });
    return filtered;
  }, [coursesByLevel, electivePackageCodes]);

  // Separate electives (level 0 or no level) - also filter out package courses
  const electives = useMemo(() => {
    return (coursesByLevel[0] || []).filter(
      (course) => !electivePackageCodes.has(course.code)
    );
  }, [coursesByLevel, electivePackageCodes]);

  // Get packages with completion status
  const packagesWithCompletion = useMemo(() => {
    const completedSet = new Set(completedCourseCodes);
    return getPackagesWithCompletion(completedSet);
  }, [completedCourseCodes]);

  // Show error toast if fetch fails (only for client-side errors)
  useEffect(() => {
    if (hasError) {
      toast.error('Failed to load academic plan');
    }
  }, [hasError]);

  if (isActuallyLoading) {
    return (
      <div className="space-y-8 pb-8">
        {/* Skeleton for Level Cards */}
        {[1, 2, 3, 4].map((level) => (
          <Card key={level} className="shadow-md">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((course) => (
                  <div
                    key={course}
                    className="p-5 border rounded-xl bg-card"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-5 w-20" />
                          </div>
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Skeleton for Elective Courses Section */}
        <Card className="shadow-md">
          <CardHeader className="pb-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3].map((course) => (
                <div
                  key={course}
                  className="p-5 border rounded-xl bg-card"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              ))}
        </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-destructive text-lg font-semibold">Failed to load academic plan</p>
            <p className="text-sm text-muted-foreground">
              {hasError && error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get all levels and sort them
  const levels = Object.keys(filteredCoursesByLevel)
    .map(Number)
    .sort((a, b) => a - b)
    .filter(level => level > 0); // Filter out level 0 (electives)

  return (
    <div className="space-y-8 pb-8">
      {/* Required Courses by Level */}
      <div className="space-y-6">
      {levels.map((level) => {
        const courses = filteredCoursesByLevel[level] || [];
        const isCurrentLevel = level === studentLevel;
        const isPastLevel = level < studentLevel;
        const isFutureLevel = level > studentLevel;

        return (
          <Card 
            key={level}
              className={`transition-all duration-200 shadow-md hover:shadow-lg ${
                isCurrentLevel 
                  ? "border-2 border-primary shadow-primary/10 bg-primary/5" 
                  : "border"
              }`}
          >
              <CardHeader className="pb-4 border-b bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      isPastLevel 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : isCurrentLevel
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-sans">Level {level}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                {isPastLevel && (
                      <Badge 
                        variant="outline" 
                        className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-semibold px-3 py-1"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                    Completed
                  </Badge>
                )}
                    {isCurrentLevel && (
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1"
                      >
                        <Clock className="h-3 w-3 mr-1.5" />
                        In Progress
                      </Badge>
                    )}
                {isFutureLevel && (
                      <Badge 
                        variant="outline" 
                        className="bg-muted border-muted-foreground/20 text-muted-foreground font-semibold px-3 py-1"
                      >
                        <Calendar className="h-3 w-3 mr-1.5" />
                    Upcoming
                  </Badge>
                )}
                  </div>
                </div>
            </CardHeader>
              <CardContent className="pt-6">
              {courses.length === 0 ? (
                  <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No courses at this level</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {courses.map((course) => (
                    <div
                      key={course.code}
                        className="group relative p-5 border rounded-xl bg-card hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-blue-500/10 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:-translate-y-0.5"
                    >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-8 w-8 rounded-lg bg-brand-blue-100 dark:bg-brand-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue-200 dark:group-hover:bg-brand-blue-800/60 transition-colors">
                                  <BookOpen className="h-4 w-4 text-brand-blue-600 dark:text-brand-blue-400" />
                                </div>
                                <span className="font-bold text-base text-foreground font-mono tracking-tight group-hover:text-brand-blue-700 dark:group-hover:text-brand-blue-300 transition-colors">
                                  {course.code}
                                </span>
                          </div>
                              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/80 transition-colors">
                            {course.name}
                          </p>
                        </div>
                      </div>
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t group-hover:border-brand-blue-200 dark:group-hover:border-brand-blue-700/50 transition-colors">
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium px-2.5 py-0.5"
                            >
                          {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                        </Badge>
                        {course.course_type === 'required' ? (
                              <Badge 
                                variant="default" 
                                className="text-xs font-medium px-2.5 py-0.5 bg-brand-blue-600 dark:bg-brand-blue-500 hover:bg-brand-blue-700 dark:hover:bg-brand-blue-400 transition-colors"
                              >
                            Required
                          </Badge>
                        ) : (
                              <Badge 
                                variant="outline" 
                                className="text-xs font-medium px-2.5 py-0.5"
                              >
                            Elective
                          </Badge>
                        )}
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      </div>

      {/* Elective Courses Section (non-package electives) */}
      {electives.length > 0 && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-4 border-b bg-muted/30">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-sans">Elective Courses</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {electives.map((course) => (
                <div
                  key={course.code}
                  className="group relative p-5 border rounded-xl bg-card hover:bg-brand-blue-50 dark:hover:bg-brand-blue-900/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-blue-500/10 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors">
                            <BookOpen className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          </div>
                          <span className="font-bold text-base text-foreground font-mono tracking-tight group-hover:text-brand-blue-700 dark:group-hover:text-brand-blue-300 transition-colors">
                            {course.code}
                          </span>
                      </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/80 transition-colors">
                        {course.name}
                      </p>
                    </div>
                  </div>
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t group-hover:border-brand-blue-200 dark:group-hover:border-brand-blue-700/50 transition-colors">
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-medium px-2.5 py-0.5"
                      >
                      {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                    </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs font-medium px-2.5 py-0.5 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 group-hover:border-brand-blue-300 dark:group-hover:border-brand-blue-600 transition-colors"
                      >
                      Elective
                    </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elective Packages Section */}
      {packagesWithCompletion.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold">Elective Packages</h2>
          </div>
          {packagesWithCompletion.map((pkg) => (
            <Card 
              key={pkg.group_name}
              className="shadow-md hover:shadow-lg transition-shadow duration-200 border-purple-200 dark:border-purple-800"
            >
              <CardHeader className="pb-4 border-b bg-purple-50/50 dark:bg-purple-950/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                      <Package className="h-5 w-5" />
                    </div>
                    <span className="font-sans">{pkg.group_name}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold px-3 py-1"
                    >
                      Required: {pkg.required_credit_hours} credits
                    </Badge>
                    {pkg.completedCredits > 0 && (
                      <Badge 
                        variant="outline" 
                        className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-semibold px-3 py-1"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1.5" />
                        Completed: {pkg.completedCredits} credits
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pkg.courses.map((course) => {
                    const isCompleted = pkg.completedCourses.includes(course.code);
                    return (
                      <div
                        key={course.code}
                        className={`group relative p-5 border rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                          isCompleted
                            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                            : "bg-card hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isCompleted
                                    ? "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800/60"
                                    : "bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60"
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-700 dark:text-green-400" />
                                  ) : (
                                    <BookOpen className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                                  )}
                                </div>
                                <span className={`font-bold text-base font-mono tracking-tight transition-colors ${
                                  isCompleted
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300"
                                }`}>
                                  {course.code}
                                </span>
                                {isCompleted && (
                                  <Badge 
                                    variant="outline" 
                                    className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs"
                                  >
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-sm line-clamp-3 leading-relaxed transition-colors ${
                                isCompleted
                                  ? "text-green-700/80 dark:text-green-400/80"
                                  : "text-muted-foreground group-hover:text-foreground/80"
                              }`}>
                                {course.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-muted group-hover:border-purple-200 dark:group-hover:border-purple-700/50 transition-colors">
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium px-2.5 py-0.5"
                            >
                              {course.credit_hours} {course.credit_hours === 1 ? 'credit' : 'credits'}
                            </Badge>
                            {course.prerequisite && (
                              <Badge 
                                variant="outline" 
                                className="text-xs font-medium px-2.5 py-0.5"
                              >
                                Prereq: {course.prerequisite}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {levels.length === 0 && electives.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <BookOpen className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">No Courses Available</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Course information will appear here once it&apos;s added to the system.
              </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

