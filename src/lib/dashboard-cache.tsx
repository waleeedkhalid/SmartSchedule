"use client";

/**
 * Dashboard Data Cache Context
 * 
 * Provides a simple caching layer for dashboard data to prevent
 * redundant fetching when switching between tabs/routes.
 * 
 * Uses stale-while-revalidate pattern:
 * - Returns cached data if within TTL (default 30s)
 * - Returns null if stale, triggering a fresh fetch
 */

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface DashboardCache {
  [key: string]: CacheEntry<any>;
}

interface CacheContextValue {
  get: <T>(key: string, maxAge?: number) => T | null;
  set: <T>(key: string, data: T) => void;
  clear: (key?: string) => void;
}

const CacheContext = createContext<CacheContextValue | null>(null);

/**
 * DashboardCacheProvider
 * 
 * Wraps the application to provide caching functionality for dashboard data.
 * Should be placed near the root of the application.
 * 
 * @example
 * ```tsx
 * <DashboardCacheProvider>
 *   <App />
 * </DashboardCacheProvider>
 * ```
 */
export function DashboardCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DashboardCache>({});

  /**
   * Get cached data if within TTL
   * @param key - Cache key
   * @param maxAge - Maximum age in milliseconds (default: 30000ms / 30s)
   * @returns Cached data or null if stale/missing
   */
  const get = useCallback(<T,>(key: string, maxAge = 30000): T | null => {
    const entry = cache[key];
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    if (age > maxAge) {
      // Stale data, return null to trigger fresh fetch
      return null;
    }
    
    return entry.data as T;
  }, [cache]);

  /**
   * Set data in cache
   * @param key - Cache key
   * @param data - Data to cache
   */
  const set = useCallback(<T,>(key: string, data: T) => {
    setCache((prev) => ({
      ...prev,
      [key]: { data, timestamp: Date.now() },
    }));
  }, []);

  /**
   * Clear cache entry or entire cache
   * @param key - Optional cache key. If omitted, clears entire cache
   */
  const clear = useCallback((key?: string) => {
    if (key) {
      setCache((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setCache({});
    }
  }, []);

  return (
    <CacheContext.Provider value={{ get, set, clear }}>
      {children}
    </CacheContext.Provider>
  );
}

/**
 * Hook to access dashboard cache
 * @throws {Error} If used outside DashboardCacheProvider
 * @example
 * ```tsx
 * const cache = useDashboardCache();
 * const cached = cache.get<MyData>("my-key");
 * if (cached) {
 *   setData(cached);
 * } else {
 *   // Fetch fresh data
 * }
 * ```
 */
export function useDashboardCache(): CacheContextValue {
  const ctx = useContext(CacheContext);
  if (!ctx) {
    throw new Error("useDashboardCache must be used within DashboardCacheProvider");
  }
  return ctx;
}

