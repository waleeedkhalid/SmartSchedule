/**
 * Client-Side Authentication Utilities
 * 
 * Helper functions for getting authentication tokens in client components.
 * Follows DRY principle by centralizing token extraction logic.
 * 
 * OPTIMIZATION: Caches session tokens to reduce auth requests
 */

import { createClient } from '@/supabase/client';

// Cache for session tokens (valid for 5 minutes)
let sessionTokenCache: { token: string | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Gets the authentication token from Supabase session
 * Returns null if no token is found
 * 
 * OPTIMIZATION: Uses in-memory cache to avoid repeated getSession() calls
 */
export async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check cache first
  const now = Date.now();
  if (sessionTokenCache && (now - sessionTokenCache.timestamp) < CACHE_DURATION) {
    return sessionTokenCache.token;
  }

  // Try to get Supabase session token
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!error && session?.access_token) {
      // Cache the token
      sessionTokenCache = {
        token: session.access_token,
        timestamp: now,
      };
      return session.access_token;
    } else {
      // Clear cache if session is invalid
      sessionTokenCache = null;
    }
  } catch (error) {
    // If Supabase client fails, clear cache
    sessionTokenCache = null;
  }

  // Fallback to localStorage (for legacy support)
  return localStorage.getItem('auth_token');
}

/**
 * Gets the Authorization header value for API requests
 * Returns "Bearer {token}" or empty string if no token
 * 
 * Note: This is now async because it needs to fetch the session from Supabase
 */
export async function getAuthHeader(): Promise<string> {
  const token = await getAuthToken();
  return token ? `Bearer ${token}` : '';
}

