/**
 * Custom Hook: Course Management
 * Reusable hook for fetching and managing SWE courses
 * Follows patterns from data-fetching.mdc
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Course, ApiResponse } from "@/types/scheduler";

interface UseCourseManagementOptions {
  termCode: string;
  autoLoad?: boolean;
}

interface UseCourseManagementReturn {
  courses: Course[];
  loading: boolean;
  updating: string | null;
  error: string | null;
  loadCourses: () => Promise<void>;
  toggleCourse: (courseCode: string, currentStatus: boolean) => Promise<void>;
  refetch: () => Promise<void>;
  // Computed values
  activeCourses: number;
  inactiveCourses: number;
  coursesByType: Record<string, Course[]>;
}

export function useCourseManagement({
  termCode,
  autoLoad = true,
}: UseCourseManagementOptions): UseCourseManagementReturn {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    if (!termCode) {
      setError("Term code is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/committee/courses/swe?term_code=${encodeURIComponent(termCode)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load courses");
      }

      const result: ApiResponse<Course[]> = await response.json();
      setCourses(result.data || []);
    } catch (err) {
      console.error("Error loading courses:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load courses";
      setError(errorMessage);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [termCode]);

  const toggleCourse = useCallback(
    async (courseCode: string, currentStatus: boolean) => {
      try {
        setUpdating(courseCode);

        const response = await fetch(
          `/api/committee/courses/swe/toggle`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              course_code: courseCode,
              is_active: !currentStatus,
              term_code: termCode,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to update course status");
        }

        // Optimistic update
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course.code === courseCode
              ? { ...course, is_active: !currentStatus }
              : course
          )
        );

        toast({
          title: "Course Updated",
          description: `${courseCode} ${!currentStatus ? "activated" : "deactivated"} successfully.`,
        });
      } catch (err) {
        console.error("Error toggling course:", err);
        toast({
          title: "Error",
          description:
            err instanceof Error
              ? err.message
              : "Failed to update course status",
          variant: "destructive",
        });

        // Reload courses to get correct state
        await loadCourses();
      } finally {
        setUpdating(null);
      }
    },
    [termCode, toast, loadCourses]
  );

  // Auto-load on mount and when termCode changes
  useEffect(() => {
    if (autoLoad) {
      loadCourses();
    }
  }, [autoLoad, loadCourses]);

  // Computed values with useMemo for performance
  const activeCourses = courses.filter((c) => c.is_active).length;
  const inactiveCourses = courses.filter((c) => !c.is_active).length;

  const coursesByType = courses.reduce(
    (acc, course) => {
      if (!acc[course.type]) {
        acc[course.type] = [];
      }
      acc[course.type].push(course);
      return acc;
    },
    {} as Record<string, Course[]>
  );

  return {
    courses,
    loading,
    updating,
    error,
    loadCourses,
    toggleCourse,
    refetch: loadCourses,
    activeCourses,
    inactiveCourses,
    coursesByType,
  };
}

