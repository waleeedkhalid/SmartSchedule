"use client";

import { useIsClient } from "@/hooks/use-mounted";
import { format } from "date-fns";

interface HydrationSafeDateProps {
  date: Date | string;
  formatStr?: string;
  fallback?: string;
  className?: string;
}

/**
 * A component that safely renders formatted dates without hydration mismatches.
 * During SSR and initial hydration, it renders a fallback string.
 * After hydration, it renders the formatted date.
 *
 * @param date - The date to format (Date object or ISO string)
 * @param formatStr - The format string for date-fns (default: 'MMM d, h:mm a')
 * @param fallback - The fallback text to show during SSR (default: '')
 * @param className - Optional className for the span element
 */
export function HydrationSafeDate({
  date,
  formatStr = "MMM d, h:mm a",
  fallback = "",
  className,
}: HydrationSafeDateProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return <span className={className}>{fallback}</span>;
  }

  // Calculate the formatted date outside of JSX
  let formattedDate = fallback || "Invalid date";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!isNaN(dateObj.getTime())) {
      formattedDate = format(dateObj, formatStr);
    }
  } catch {
    // Keep fallback value
  }

  return <span className={className}>{formattedDate}</span>;
}

/**
 * Hook to get the current date safely for use in state initialization.
 * Returns null during SSR, and the current date after hydration.
 *
 * Usage:
 * const now = useHydrationSafeDate();
 * // now is null on server, Date on client
 */
export function useHydrationSafeNow(): Date | null {
  const isClient = useIsClient();
  return isClient ? new Date() : null;
}

/**
 * Format a date string safely without hydration issues.
 * Returns the fallback during SSR.
 *
 * @param date - The date to format
 * @param formatStr - The format string
 * @param fallback - The fallback value for SSR
 */
export function useFormattedDate(
  date: Date | string | null | undefined,
  formatStr: string = "MMM d, h:mm a",
  fallback: string = ""
): string {
  const isClient = useIsClient();

  if (!isClient || !date) {
    return fallback;
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return fallback || "Invalid date";
    }
    return format(dateObj, formatStr);
  } catch {
    return fallback || "Invalid date";
  }
}
