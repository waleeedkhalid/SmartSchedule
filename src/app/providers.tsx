"use client";

import { SWRConfig } from "swr";
import { jsonFetcher } from "@/lib/fetcher";
import { ThemeProvider } from "../components/ui/theme-provider";
import { ToastProvider } from "../components/ui/toast-provider";
import { Toaster } from "../components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
