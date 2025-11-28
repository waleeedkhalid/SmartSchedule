/**
 * Client-side data fetching hook for Supabase
 * 
 * Use only in client components. Creates a new Supabase client instance
 * for each query to avoid sharing state across components.
 * 
 * @param key - Base query key (will be combined with table and filters)
 * @param table - Supabase table name
 * @param cache - Cache time in milliseconds (0 = no cache)
 * @param filters - Optional function to apply filters to the query
 * @returns React Query result with data, loading, and error states
 */
import { createClient } from "@/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useClientFetch<T>(
  key: string,
  table: string,
  cache?: number,
  filters?: (query: any) => any,
  selectColumns?: string // OPTIMIZATION: Allow specifying columns instead of *
) {
  // Create structured query key for better cache management
  const queryKey = useMemo(() => {
    return ['supabase', key, table];
  }, [key, table]);

  return useQuery<T[]>({
    queryKey,
    queryFn: async () => {
      // Create new client instance for each query
      // This prevents sharing state across different hook calls
      const supabase = createClient();
      
      // OPTIMIZATION: Use specific columns if provided, otherwise use *
      // This reduces data transfer and improves performance
      const selectClause = selectColumns || "*";
      let query = supabase.from(table).select(selectClause);
      if (filters) query = filters(query);

      const { data, error } = await query;
      if (error) throw error;

      return data as T[];
    },
    // OPTIMIZATION: Default to 5 minutes cache if not specified (instead of 0)
    // This reduces unnecessary database requests
    staleTime: cache ?? 5 * 60 * 1000, // Default 5 minutes cache
    gcTime: (cache ?? 5 * 60 * 1000) * 2, // Keep in cache for 2x staleTime
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
