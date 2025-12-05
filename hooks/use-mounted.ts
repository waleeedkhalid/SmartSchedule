"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Hook to detect if the component has been hydrated on the client.
 * This is useful for preventing hydration mismatches when rendering
 * content that depends on browser APIs or current time.
 *
 * @returns boolean - true if the component is mounted on the client
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

/**
 * Alternative hook using useSyncExternalStore for SSR-safe mounting detection.
 * This is the recommended approach for Next.js 15+ as it properly handles
 * the hydration boundary.
 *
 * @returns boolean - true if running on the client, false during SSR
 */
function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
