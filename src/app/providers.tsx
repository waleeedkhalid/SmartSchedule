"use client";

import { SWRConfig } from "swr";
import { jsonFetcher } from "@/lib/fetcher";
import { ThemeProvider } from "../components/ui/theme-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DashboardCacheProvider } from "@/lib/dashboard-cache";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DashboardCacheProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <SWRConfig
              value={{
                fetcher: jsonFetcher,
                shouldRetryOnError: false,
                revalidateOnFocus: false,
              }}
            >
              {children}
            </SWRConfig>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </DashboardCacheProvider>
  );
}
