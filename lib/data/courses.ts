/**
 * Optimized Courses Data Fetching
 * 
 * Provides server-side functions for fetching courses from Supabase
 * with pagination, search, and sorting support.
 * Uses selective column projection and proper indexing for performance.
 * 
 * Wrapped with React.cache() for request memoization - ensures the same
 * data is only fetched once per request, even if called multiple times
 * in the same render tree.
 */

import { cache } from 'react';
import { createClient } from "@/supabase/server";
import { Database } from "@/lib/types/database";

// Course type - database has recommended_level (nullable for electives)
// We add level property for backward compatibility (maps to recommended_level ?? 0)
type CourseRow = Database["public"]["Tables"]["course"]["Row"] & {
  recommended_level: number | null;
};

export type Course = Omit<CourseRow, never> & {
  // For backward compatibility, add level property that maps from recommended_level
  level: number; // Maps to recommended_level ?? 0
};

export interface CoursesPaginatedResult {
  courses: Course[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetches courses from Supabase with pagination, search, and sorting
 * 
 * Performance optimizations:
 * - Selects only required columns (code, title, level, credits, weekly_hours, is_elective)
 * - Uses pagination with .range() to limit data transfer
 * - Uses count: 'exact' for accurate pagination
 * - Supports server-side search and sorting
 * - Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getCoursesPaginated = cache(async (
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = '',
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<CoursesPaginatedResult> => {
  const supabase = await createClient();
  
  // Calculate pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build query - select required columns for table display
  let query = supabase
    .from("course")
    .select("code, title, recommended_level, credits, weekly_hours, is_elective, created_at, updated_at, created_by", { count: 'exact' });
  
  // Apply search filter (searches in code and title)
  // Security: Escape special characters to prevent filter injection
  if (searchTerm) {
    // Escape PostgREST special characters to prevent filter injection
    // Escape backslashes first, then percent and underscore (ILIKE wildcards)
    // Remove commas to prevent breaking OR syntax (comma is OR separator in PostgREST)
    const escapedSearch = searchTerm
      .toLowerCase()
      .replace(/\\/g, '\\\\')  // Escape backslashes first (must be first)
      .replace(/%/g, '\\%')    // Escape percent signs (ILIKE wildcard)
      .replace(/_/g, '\\_')    // Escape underscores (ILIKE wildcard)
      .replace(/,/g, '');       // Remove commas (PostgREST OR syntax separator)
    
    // Use OR filter with properly escaped values
    // PostgREST OR syntax: "column1.ilike.value1,column2.ilike.value2"
    // The comma separates OR conditions, so we remove commas from search term
    query = query.or(`code.ilike.%${escapedSearch}%,title.ilike.%${escapedSearch}%`);
  }
  
  // Apply sorting
  // Note: Uses indexes for recommended_level, title, credits, weekly_hours
  // For composite sorts, use the most selective column first to leverage composite indexes
  if (sortBy === 'level' && searchTerm) {
    // When filtering by recommended_level, use composite index
    query = query.order('recommended_level', { ascending: sortOrder === 'asc', nullsFirst: false })
                 .order('code', { ascending: true });
  } else if (sortBy === 'level') {
    // Sort by recommended_level (NULL values last for electives)
    query = query.order('recommended_level', { ascending: sortOrder === 'asc', nullsFirst: false });
  } else {
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  }
  
  // Apply pagination
  const { data, error, count } = await query.range(from, to);
  
  if (error) {
    console.error("Error fetching courses:", error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
  
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Map database results to Course type with level property for backward compatibility
  type QueryResult = {
    code: string;
    title: string;
    credits: number;
    weekly_hours: number;
    is_elective: boolean;
    recommended_level: number | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
  };
  
  const courses: Course[] = (data || []).map((course: QueryResult) => ({
    code: course.code,
    title: course.title,
    credits: course.credits,
    weekly_hours: course.weekly_hours,
    is_elective: course.is_elective,
    recommended_level: course.recommended_level,
    created_at: course.created_at,
    updated_at: course.updated_at,
    created_by: course.created_by,
    // For backward compatibility, add level property that maps from recommended_level
    level: course.recommended_level ?? 0, // Map NULL to 0 for electives
  }));
  
  return {
    courses,
    totalCount,
    totalPages,
    pageSize,
  };
});

