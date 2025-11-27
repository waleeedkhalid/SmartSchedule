//this hook nade to (insert, update, delete) in supabase -> used in client side components only.

import { createClient } from "@/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type MutationPayload = Record<string, unknown> & { id?: number | string };

/**
 * Helper function to safely compare IDs regardless of type (string vs number)
 * Handles temporary IDs created during optimistic updates
 */
function compareIds(id1: unknown, id2: unknown): boolean {
  if (id1 === id2) return true;
  // Convert both to strings for comparison to handle type mismatches
  // e.g., "temp-1234567890" vs 1234567890 or "123" vs 123
  return String(id1) === String(id2);
}

/**
 * CRITICAL FIX: createClient() is now called inside mutationFn instead of module level.
 * 
 * Module-level initialization (const supabase = createClient()) executes during
 * module import, which can happen during SSR or initial hydration, causing
 * synchronous crashes when createBrowserClient tries to access browser APIs.
 * 
 * By moving it inside mutationFn, we ensure it only runs:
 * 1. After React has hydrated (hooks only run in browser)
 * 2. When the mutation actually executes (not during module initialization)
 * 3. In a browser environment where window/localStorage are available
 */
export function useClientMutate(
  table: string,
  action: "insert" | "update" | "delete"
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MutationPayload) => {
      // Create client instance per mutation to avoid sharing state
      // This also prevents synchronous crashes during module initialization
      const supabase = createClient();
      
      // Use type assertion to work with dynamic table names
      // The actual type safety comes from runtime validation
      const tableClient = supabase.from(table) as ReturnType<typeof supabase.from>;
      
      let response: { data: unknown; error: { message: string } | null };

      if (action === "insert") {
        response = await tableClient.insert(payload as never).select();
      } else if (action === "update") {
        response = await tableClient
          .update(payload as never)
          .match({ id: payload.id })
          .select();
      } else {
        // delete
        response = await tableClient
          .delete()
          .match({ id: payload.id })
          .select();
      }

      if (response.error) throw response.error;
      
      // Return the first item for single operations, or array for bulk
      return Array.isArray(response.data) && response.data.length === 1
        ? response.data[0]
        : response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      // This ensures the temporary optimistic update is replaced with server data
      queryClient.invalidateQueries({ queryKey: [table], exact: false });
    },
    onMutate: async (newData: MutationPayload) => {
      // Cancel outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: [table] });
      
      // Snapshot current data for rollback on error
      const currentData = queryClient.getQueryData([table]);
      
      type CacheData = unknown[] | Record<string, unknown> | null | undefined;
      
      // Only perform optimistic updates for insert operations
      // Update/delete operations are better handled by invalidation
      if (action === "insert") {
        queryClient.setQueryData([table], (dataBeforeMutate: CacheData) => {
          // FIX: Handle different data structures safely
          // If data is an array, append to it
          if (Array.isArray(dataBeforeMutate)) {
            // Use temporary ID that will be replaced by server response
            // Store as string to match type of potential numeric IDs from server
            // The onSuccess invalidation will replace this with actual data
            return [...dataBeforeMutate, { id: `temp-${Date.now()}`, ...newData }];
          }
          
          // If data is an object, convert to array
          if (dataBeforeMutate && typeof dataBeforeMutate === 'object' && !Array.isArray(dataBeforeMutate)) {
            return [dataBeforeMutate, { id: `temp-${Date.now()}`, ...newData }];
          }
          
          // If data is null/undefined, create new array
          return [{ id: `temp-${Date.now()}`, ...newData }];
        });
      } else if (action === "update" && newData.id) {
        // Optimistic update for update operations
        // FIX: Use type-safe ID comparison to handle string vs number mismatches
        queryClient.setQueryData([table], (dataBeforeMutate: CacheData) => {
          if (Array.isArray(dataBeforeMutate)) {
            return dataBeforeMutate.map((item) => {
              const record = item as Record<string, unknown>;
              // Use compareIds to handle type mismatches (string "temp-123" vs number 123)
              return compareIds(record.id, newData.id) ? { ...record, ...newData } : item;
            });
          }
          
          // If single object, update it
          if (dataBeforeMutate && typeof dataBeforeMutate === 'object' && !Array.isArray(dataBeforeMutate)) {
            const item = dataBeforeMutate as Record<string, unknown>;
            return compareIds(item.id, newData.id)
              ? { ...item, ...newData }
              : dataBeforeMutate;
          }
          
          return dataBeforeMutate;
        });
      } else if (action === "delete" && newData.id) {
        // Optimistic update for delete operations
        // FIX: Use type-safe ID comparison to handle string vs number mismatches
        queryClient.setQueryData([table], (dataBeforeMutate: CacheData) => {
          if (Array.isArray(dataBeforeMutate)) {
            return dataBeforeMutate.filter((item) => {
              const record = item as Record<string, unknown>;
              // Use compareIds to handle type mismatches (string "temp-123" vs number 123)
              return !compareIds(record.id, newData.id);
            });
          }
          
          // If single object and it matches, return null
          if (dataBeforeMutate && typeof dataBeforeMutate === 'object' && !Array.isArray(dataBeforeMutate)) {
            const item = dataBeforeMutate as Record<string, unknown>;
            return compareIds(item.id, newData.id) ? null : dataBeforeMutate;
          }
          
          return dataBeforeMutate;
        });
      }

      return { currentData };
    },

    onError: (_error, _variables, context) => {
      // Rollback optimistic update on error
      // FIX: Always rollback if context exists, even if currentData was undefined (empty cache)
      // This prevents stale optimistic updates from remaining in cache after failed mutations
      if (context) {
        queryClient.setQueryData([table], context.currentData);
      }
    },
  });
}
