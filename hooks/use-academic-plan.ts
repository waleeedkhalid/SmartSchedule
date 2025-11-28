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

interface ApiSuccessResponse {
  data: Course[];
  message?: string;
}

interface ApiErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

const ONE_HOUR = 1000 * 60 * 60; // 1 hour in milliseconds
const FETCH_TIMEOUT = 10000; // 10 seconds timeout (reduced from 30s)

export function useAcademicPlan(): UseAcademicPlanResult {
  const queryKey = useMemo(() => ['academic-plan', 'courses'], []);

  const { data, isLoading, error } = useQuery<Course[], Error>({
    queryKey,
    queryFn: async () => {
        try {
          // OPTIMIZATION: Get auth header with timeout to prevent hanging
          let authHeader: string;
          try {
            const authHeaderPromise = getAuthHeader();
            const authTimeoutPromise = new Promise<string>((_, reject) => 
              setTimeout(() => reject(new Error('Auth timeout')), 5000) // Increased timeout to 5s
            );
            
            authHeader = await Promise.race([authHeaderPromise, authTimeoutPromise]);
          } catch (authError) {
            // If auth fails or times out, provide a more helpful error message
            const errorMessage = authError instanceof Error 
              ? authError.message 
              : 'Authentication failed';
            
            // Check if it's a timeout or actual auth failure
            if (errorMessage.includes('timeout')) {
              throw new Error('Authentication timeout: Please refresh the page and try again');
            }
            throw new Error(`Authentication failed: ${errorMessage}`);
          }
          
          // Ensure we have an auth header before proceeding
          if (!authHeader || authHeader.trim() === '' || authHeader === 'Bearer ') {
            throw new Error('Authentication required: No auth token available. Please log in again.');
          }
        
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        let response: Response;
        try {
          // OPTIMIZATION: Try academic-plan endpoint first, fall back to courses
          // Use the dedicated academic-plan endpoint which has proper student role checking
          response = await fetch('/api/v1/academic-plan', {
            headers: { Authorization: authHeader },
            signal: controller.signal,
            // Note: Browser will respect Cache-Control headers from API response
          });
          clearTimeout(timeoutId);
          
          // If academic-plan endpoint fails with 403/404, try courses endpoint as fallback
          if (response.status === 403 || response.status === 404) {
            response = await fetch('/api/v1/courses', {
              headers: { Authorization: authHeader },
              signal: controller.signal,
            });
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Request timeout: Failed to fetch courses within 10 seconds');
          }
          throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
        }

        // Check if response is ok
      if (!response.ok) {
          let errorMessage = `Failed to fetch courses (${response.status})`;
          try {
            const errorData: ApiErrorResponse = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If JSON parsing fails, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
      }

        // Parse response JSON
        let result: ApiSuccessResponse | ApiErrorResponse;
        try {
          result = await response.json();
        } catch (parseError) {
          throw new Error('Failed to parse API response: Invalid JSON');
        }

        // Check if response is an error response
        if ('error' in result) {
          throw new Error(result.error || 'API returned an error');
        }

        // Validate that data exists and is an array
        if (!result.data) {
          throw new Error('API response missing data field');
        }

        if (!Array.isArray(result.data)) {
          throw new Error('API response data is not an array');
        }

        // Map and validate courses
        const courses: Course[] = [];
        for (const course of result.data) {
          // Validate required fields
          if (!course || typeof course !== 'object') {
            console.warn('Skipping invalid course entry:', course);
            continue;
          }

          if (!course.code || !course.name || course.credits === undefined || course.level === undefined) {
            console.warn('Skipping course with missing required fields:', course);
            continue;
          }

          courses.push({
            code: String(course.code),
            name: String(course.name),
            credits: Number(course.credits),
            level: Number(course.level),
            course_type: course.course_type === 'elective' ? 'elective' : 'required',
          });
        }

      return courses;
      } catch (error) {
        // Ensure error is always an Error object
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`Unknown error: ${String(error)}`);
      }
    },
    staleTime: ONE_HOUR, // Data is fresh for 1 hour
    gcTime: ONE_HOUR, // Keep in cache for 1 hour (same as staleTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data is fresh
    refetchOnReconnect: false, // Don't refetch on reconnect
    retry: 1, // Retry once on failure
    retryDelay: 1000, // Wait 1 second before retry
  });

  // Transform data: group courses by level
  const coursesByLevel = useMemo<CoursesByLevel>(() => {
    if (!data || !Array.isArray(data)) {
      return {};
    }

    const grouped: CoursesByLevel = {};
    data.forEach((course) => {
      const level = Number(course.level) || 0;
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

