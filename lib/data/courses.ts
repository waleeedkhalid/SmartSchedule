/**
 * Optimized Courses Data Fetching
 * 
 * Provides server-side functions for fetching courses from Supabase
 * with pagination, search, and sorting support.
 * Uses selective column projection and proper indexing for performance.
 */

import { createClient } from "@/supabase/server";
import { Database } from "@/lib/types/database";

export type Course = Database["public"]["Tables"]["course"]["Row"];

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
 */
export async function getCoursesPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = '',
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<CoursesPaginatedResult> {
  const supabase = await createClient();
  
  // Calculate pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build query - select only required columns for table display
  let query = supabase
    .from("course")
    .select("code, title, level, credits, weekly_hours, is_elective", { count: 'exact' });
  
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
  // Note: Uses indexes idx_course_level, idx_course_title, idx_course_credits, idx_course_weekly_hours
  // For composite sorts, use the most selective column first to leverage composite indexes
  if (sortBy === 'level' && searchTerm) {
    // When filtering by level, use composite index idx_course_level_code
    query = query.order('level', { ascending: sortOrder === 'asc' })
                 .order('code', { ascending: true });
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
  
  return {
    courses: (data as Course[]) || [],
    totalCount,
    totalPages,
    pageSize,
  };
}

