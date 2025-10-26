/**
 * Course Management Tab
 * Activate/deactivate SWE courses
 * 
 * REFACTORED:
 * - Uses custom hook for data management
 * - Improved performance with memoization
 * - Better code organization
 * - Extracted reusable components
 */

"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { useCourseManagement } from "@/hooks/scheduler/useCourseManagement";
import type { Course } from "@/types/scheduler";

interface CourseManagementTabProps {
  termCode: string;
  termName: string;
}

/**
 * Memoized course summary stats component
 */
const CourseSummaryStats = memo(function CourseSummaryStats({
  total,
  active,
  inactive,
  typeCount,
}: {
  total: number;
  active: number;
  inactive: number;
  typeCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          SWE Course Management
        </CardTitle>
        <CardDescription>Activate or deactivate courses for the term</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-primary">{total}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Courses</div>
          </div>
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
            <div className="text-3xl font-bold text-green-600">{active}</div>
            <div className="text-sm text-muted-foreground mt-1">Active</div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-muted-foreground">{inactive}</div>
            <div className="text-sm text-muted-foreground mt-1">Inactive</div>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-3xl font-bold text-primary">{typeCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Course Types</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Memoized course card component
 */
const CourseCard = memo(function CourseCard({
  course,
  updating,
  onToggle,
}: {
  course: Course;
  updating: boolean;
  onToggle: (code: string, status: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-base">{course.code}</span>
          <Badge variant="outline" className="text-xs">
            {course.credits} credits
          </Badge>
          <Badge variant="outline" className="text-xs">
            Level {course.level}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground mt-1">{course.name}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {course.is_active ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm">{course.is_active ? "Active" : "Inactive"}</span>
        </div>
        <Switch
          checked={course.is_active}
          disabled={updating}
          onCheckedChange={() => onToggle(course.code, course.is_active)}
        />
      </div>
    </div>
  );
});

/**
 * Memoized course type group component
 */
const CourseTypeGroup = memo(function CourseTypeGroup({
  type,
  courses,
  updating,
  onToggle,
}: {
  type: string;
  courses: Course[];
  updating: string | null;
  onToggle: (code: string, status: boolean) => void;
}) {
  const activeCount = courses.filter((c) => c.is_active).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{type}</span>
          <Badge variant="secondary">
            {activeCount} / {courses.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard
              key={course.code}
              course={course}
              updating={updating === course.code}
              onToggle={onToggle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export function CourseManagementTab({ termCode, termName }: CourseManagementTabProps) {
  // Use custom hook for data management
  const {
    courses,
    loading,
    updating,
    error,
    toggleCourse,
    activeCourses,
    inactiveCourses,
    coursesByType,
  } = useCourseManagement({
    termCode,
    autoLoad: true,
  });

  // Loading state with skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (courses.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No SWE courses found. Make sure courses are properly configured in the system.
        </AlertDescription>
      </Alert>
    );
  }

  // Main content with memoized components
  return (
    <div className="space-y-6">
      <CourseSummaryStats
        total={courses.length}
        active={activeCourses}
        inactive={inactiveCourses}
        typeCount={Object.keys(coursesByType).length}
      />

      {Object.entries(coursesByType).map(([type, typeCourses]) => (
        <CourseTypeGroup
          key={type}
          type={type}
          courses={typeCourses}
          updating={updating}
          onToggle={toggleCourse}
        />
      ))}
    </div>
  );
}

