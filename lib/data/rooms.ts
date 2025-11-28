/**
 * Optimized Rooms Data Fetching
 * 
 * Provides server-side functions for fetching rooms from Supabase
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

export type Room = Database["public"]["Tables"]["room"]["Row"];

export interface RoomsPaginatedResult {
  rooms: Room[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Fetches rooms from Supabase with pagination, search, and sorting
 * 
 * Performance optimizations:
 * - Selects only required columns (code, type, capacity)
 * - Uses pagination with .range() to limit data transfer
 * - Uses count: 'exact' for accurate pagination
 * - Supports server-side search and sorting
 * - Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getRoomsPaginated = cache(async (
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = '',
  sortBy: 'code' | 'type' | 'capacity' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<RoomsPaginatedResult> => {
  const supabase = await createClient();
  
  // Calculate pagination range
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build query - select only required columns for table display
  let query = supabase
    .from("room")
    .select("code, type, capacity", { count: 'exact' });
  
  // Apply search filter (searches in code)
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
    query = query.ilike('code', `%${escapedSearch}%`);
  }
  
  // Apply sorting
  // Note: Database indexes should be created for these columns (see migration file)
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });
  
  // Apply pagination
  const { data, error, count } = await query.range(from, to);
  
  if (error) {
    console.error("Error fetching rooms:", error);
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }
  
  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    rooms: (data as Room[]) || [],
    totalCount,
    totalPages,
    pageSize,
  };
});

