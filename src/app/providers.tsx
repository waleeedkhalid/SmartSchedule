"use client";

import { SWRConfig } from "swr";
import { jsonFetcher } from "@/lib/fetcher";
import { ThemeProvider } from "../components/ui/theme-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
