"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children: React.ReactNode;
}

/**
 * React Query Provider - Only include where React Query hooks are needed
 * 
 * This provider should NOT be in the root layout to avoid forcing
 * all pages to be client-side rendered. Instead, wrap only the specific
 * components or pages that use React Query hooks (useQuery, useMutation).
 * 
 * Default settings:
 * - retry: 1 (retry failed requests once)
 * - staleTime: 5 minutes (data considered fresh for 5 minutes)
 * - gcTime: 10 minutes (cache garbage collection after 10 minutes)
 * - refetchOnWindowFocus: false (don't refetch when window regains focus)
 */
const queryClientConfig = {
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
};

export default function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
