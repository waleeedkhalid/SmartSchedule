/**
 * Optimized Exams Data Fetching
 * 
 * Provides server-side functions for fetching exams from Supabase
 * with pagination, search, and sorting support.
 * Uses selective column projection and proper indexing for performance.
 */

import { createClient } from "@/supabase/server";
import { Database } from "@/lib/types/database-production";

export type Exam = Database["public"]["Tables"]["exam"]["Row"];

export interface ExamsPaginatedResult {
  exams: Exam[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetches exams from Supabase with pagination, search, and sorting
 * 
 * Performance optimizations:
 * - Selects only required columns (id, course_code, date, start_time, duration_minutes, room_codes)
 * - Uses pagination with .range() to limit data transfer
 * - Uses count: 'exact' for accurate pagination
 * - Supports server-side search and sorting
 */
export async function getExamsPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = '',
  sortBy: 'course_code' | 'date' | 'start_time' | 'duration_minutes' = 'date',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<ExamsPaginatedResult> {
  const supabase = await createClient();
  
  // Calculate pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build query - select only required columns for table display
  let query = supabase
    .from("exam")
    .select("id, course_code, date, start_time, duration_minutes, room_codes", { count: 'exact' });
  
  // Apply search filter (searches in course_code)
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
    
    // Use ILIKE filter with properly escaped value
    query = query.ilike('course_code', `%${escapedSearch}%`);
  }
  
  // Apply sorting
  // Note: Database indexes should be created for these columns (see migration file)
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply pagination
  const { data, error, count } = await query.range(from, to);
  
  if (error) {
    console.error("Error fetching exams:", error);
    throw new Error(`Failed to fetch exams: ${error.message}`);
  }
  
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    exams: (data as Exam[]) || [],
    totalCount,
    totalPages,
    pageSize,
  };
}

