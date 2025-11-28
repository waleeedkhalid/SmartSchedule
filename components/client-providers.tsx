"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: React.ReactNode;
}

/**
 * Client Providers - Root-level providers for React Query and Auth
 * 
 * This component MUST be placed in the root layout (app/layout.tsx) to ensure:
 * - Single instance of QueryClient (prevents cache loss on navigation)
 * - Single instance of AuthContext (prevents nested provider issues)
 * - Consistent state across all pages and components
 * 
 * Architecture:
 * - Creates the client boundary for React Query and Auth Context
 * - Only the component tree below this boundary becomes client-side
 * - This is the standard pattern for Next.js App Router with React Query
 * - Wrapped in ErrorBoundary to prevent _rsc loops from uncaught errors
 * 
 * Production React Query Config:
 * - retry: 1 - Don't retry immediately on error (fails fast)
 * - staleTime: 60 * 1000 - Data remains fresh for 1 minute
 * - refetchOnWindowFocus: false - Stop refetching when window loses focus (saves battery/data)
 */
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Don't retry immediately on error (fails fast)
      retry: 1,
      // Data remains fresh for 1 minute
      staleTime: 60 * 1000,
      // Stop refetching when window loses focus (saves battery/data)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
};

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/20">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-4">
          💥 Application Initialization Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          A critical error occurred during the initial setup. This is often due to 
          missing configuration or environment variables.
        </p>
        <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-left overflow-auto mb-4">
          {error.message}
        </pre>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={resetErrorBoundary}
          >
            Try Reloading
          </button>
          <button
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => window.location.reload()}
          >
            Full Page Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export function ClientProviders({ children }: Props) {
  // Use state to ensure QueryClient is stable across re-renders
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        // Log the error to an external service (e.g., Sentry) here
        console.error("Root ClientProviders Crash:", error, info);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
