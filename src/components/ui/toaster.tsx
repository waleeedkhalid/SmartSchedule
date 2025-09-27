"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToastContext } from "./toast-provider";

export function Toaster() {
  const { toasts, dismiss } = useToastContext();

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismiss(toast.id);
      }, 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-end px-4 py-6 sm:items-end">
      <div className="flex w-full flex-col gap-3 sm:max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto rounded-md border border-border bg-background/95 p-4 shadow-lg backdrop-blur"
            )}
          >
            {toast.title && (
              <p className="text-sm font-semibold text-foreground">
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {toast.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
