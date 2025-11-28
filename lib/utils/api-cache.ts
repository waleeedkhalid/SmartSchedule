/**
 * API Cache Utility
 * 
 * Implements client-side caching for API requests using localStorage.
 * Prevents duplicate requests within the same session.
 * 
 * Features:
 * - localStorage persistence across page reloads
 * - TTL (Time To Live) for cache entries
 * - Automatic cache invalidation
 * - Session-based cache keys
 * - Memory cache for faster access
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  ttl?: number; // Default TTL in milliseconds
  keyPrefix?: string; // Prefix for cache keys
}

class APICache {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL: number;
  private keyPrefix: string;

  constructor(config: CacheConfig = {}) {
    this.defaultTTL = config.ttl || 5 * 60 * 1000; // Default 5 minutes
    this.keyPrefix = config.keyPrefix || 'api_cache_';
  }

  /**
   * Generate cache key from endpoint and user ID
   */
  private getCacheKey(endpoint: string, userId?: string): string {
    const baseKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
    const userPart = userId ? `_user_${userId}` : '';
    return `${this.keyPrefix}${baseKey}${userPart}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Get cached data
   */
  get<T>(endpoint: string, userId?: string): T | null {
    const key = this.getCacheKey(endpoint, userId);

    // Check memory cache first (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (this.isValid(entry)) {
          // Update memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Expired, remove it
          this.remove(endpoint, userId);
        }
      }
    } catch (error) {
      console.warn('Error reading from localStorage cache:', error);
    }

    return null;
  }

  /**
   * Set cache data
   */
  set<T>(endpoint: string, data: T, userId?: string, ttl?: number): void {
    const key = this.getCacheKey(endpoint, userId);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old cache entries');
        this.clearOldEntries();
        // Try again
        try {
          localStorage.setItem(key, JSON.stringify(entry));
        } catch (retryError) {
          console.warn('Failed to cache after cleanup:', retryError);
        }
      } else {
        console.warn('Error writing to localStorage cache:', error);
      }
    }
  }

  /**
   * Remove specific cache entry
   */
  remove(endpoint: string, userId?: string): void {
    const key = this.getCacheKey(endpoint, userId);
    
    // Remove from memory
    this.memoryCache.delete(key);
    
    // Remove from localStorage
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing from localStorage cache:', error);
    }
  }

  /**
   * Clear all cache entries for a user
   */
  clearUserCache(userId: string): void {
    // Clear memory cache
    for (const [key] of this.memoryCache) {
      if (key.includes(userId)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.keyPrefix) && key.includes(userId)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing user cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.keyPrefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error clearing all cache:', error);
    }
  }

  /**
   * Clear expired entries to free up space
   */
  private clearOldEntries(): void {
    const keysToRemove: string[] = [];

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.keyPrefix)) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const entry: CacheEntry<unknown> = JSON.parse(stored);
              if (!this.isValid(entry)) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Invalid entry, remove it
            keysToRemove.push(key);
          }
        }
      });

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        this.memoryCache.delete(key);
      });
    } catch (error) {
      console.warn('Error clearing old cache entries:', error);
    }
  }

  /**
   * Invalidate cache for specific endpoint pattern
   * Useful for invalidating related endpoints after mutations
   */
  invalidatePattern(pattern: string, userId?: string): void {
    const searchKey = userId ? `${pattern}_user_${userId}` : pattern;

    // Clear from memory
    for (const [key] of this.memoryCache) {
      if (key.includes(searchKey)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.keyPrefix) && key.includes(searchKey)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Error invalidating cache pattern:', error);
    }
  }
}

// Create singleton instance
export const apiCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes default
  keyPrefix: 'ssv2_api_',
});

/**
 * Get user ID from Supabase session
 */
async function getUserId(): Promise<string | undefined> {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const { createClient } = await import('@/supabase/client');
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id;
  } catch (error) {
    console.warn('Error getting user ID for cache:', error);
    return undefined;
  }
}

/**
 * Cached fetch wrapper
 * Automatically caches GET requests and returns cached data when available
 */
export async function cachedFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  userId?: string,
  ttl?: number
): Promise<T> {
  // Only cache GET requests
  if (options.method && options.method !== 'GET') {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  // Get user ID if not provided
  const finalUserId = userId || await getUserId();

  // Check cache first
  const cached = apiCache.get<T>(endpoint, finalUserId);
  if (cached !== null) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as T;
  
  // Cache the response
  apiCache.set(endpoint, data, finalUserId, ttl);
  
  return data;
}

/**
 * Cache TTL constants for different endpoints
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute - for frequently changing data
  MEDIUM: 5 * 60 * 1000,     // 5 minutes - default
  LONG: 15 * 60 * 1000,      // 15 minutes - for relatively static data
  VERY_LONG: 30 * 60 * 1000, // 30 minutes - for rarely changing data
} as const;

