/**
 * Cookie Utility Functions
 * 
 * Provides utilities for clearing authentication cookies on both client and server.
 * Ensures all cookies (custom and Supabase) are properly cleared on logout.
 */

/**
 * List of all authentication-related cookie names
 * Includes both custom cookies and Supabase SSR cookies
 */
export const AUTH_COOKIE_NAMES = [
  'auth_token',
  'onboarding_verified',
  // Supabase SSR cookie patterns
  'sb-access-token',
  'sb-refresh-token',
  'sb-auth-token',
  'sb-auth-token-code-verifier',
] as const;

/**
 * Clears all authentication cookies on the client side
 * This function should be called after logout to ensure clean state
 */
export function clearAllAuthCookies(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Clear all known auth cookies
  AUTH_COOKIE_NAMES.forEach(cookieName => {
    // Clear with path: /
    document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // Also clear with no path (some cookies might be set without explicit path)
    document.cookie = `${cookieName}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });

  // Clear any cookies that match Supabase patterns
  // This catches any other Supabase cookies we might have missed
  const allCookies = document.cookie.split('; ');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0];
    if (cookieName.startsWith('sb-') || cookieName.includes('supabase')) {
      document.cookie = `${cookieName}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${cookieName}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  });
}

/**
 * Clears all authentication cookies from localStorage
 */
export function clearAllAuthStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  // Clear any other auth-related items
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('auth_') || key.startsWith('supabase_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Comprehensive logout cleanup - clears both cookies and localStorage
 * Call this function on client-side logout
 */
export function performClientLogoutCleanup(): void {
  clearAllAuthCookies();
  clearAllAuthStorage();
}

