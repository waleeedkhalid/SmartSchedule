/**
 * Custom hook for fetching Academic Plan data
 * 
 * Uses React Query with aggressive caching (1 hour) since course data
 * is static and rarely changes during a user session.
 * 
 * @returns React Query result with courses grouped by level
 */

import { useQuery } from "@tanstack/react-query";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { useMemo } from "react";

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

interface UseAcademicPlanResult {
  coursesByLevel: CoursesByLevel;
  isLoading: boolean;
  error: Error | null;
}

const ONE_HOUR = 1000 * 60 * 60; // 1 hour in milliseconds

export function useAcademicPlan(): UseAcademicPlanResult {
  const queryKey = useMemo(() => ['academic-plan', 'courses'], []);

  const { data, isLoading, error } = useQuery<Course[], Error>({
    queryKey,
    queryFn: async () => {
      const authHeader = await getAuthHeader();
      const response = await fetch('/api/v1/courses', {
        headers: authHeader ? { Authorization: authHeader } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const result = await response.json();
      const courses = (result.data || []).map((course: Course) => ({
        code: course.code,
        name: course.name,
        credits: course.credits,
        level: course.level,
        course_type: course.course_type as "required" | "elective",
      }));

      return courses;
    },
    staleTime: ONE_HOUR, // Data is fresh for 1 hour
    gcTime: ONE_HOUR, // Keep in cache for 1 hour (same as staleTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Transform data: group courses by level
  const coursesByLevel = useMemo<CoursesByLevel>(() => {
    if (!data) return {};

    const grouped: CoursesByLevel = {};
    data.forEach((course) => {
      const level = course.level;
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
  }, [data]);

  return {
    coursesByLevel,
    isLoading,
    error: error || null,
  };
}

