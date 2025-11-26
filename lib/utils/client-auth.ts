/**
 * Client-Side Authentication Utilities
 * 
 * Helper functions for getting authentication tokens in client components.
 * Follows DRY principle by centralizing token extraction logic.
 */

/**
 * Gets the authentication token from cookies or localStorage
 * Returns null if no token is found
 * 
 * Priority:
 * 1. auth_token cookie (for Supabase users)
 * 2. demo_user_id cookie (for demo users, returns "demo:{user_id}")
 * 3. localStorage auth_token (fallback)
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get auth_token from cookies first (Supabase)
  const authTokenCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];

  if (authTokenCookie) {
    return authTokenCookie;
  }

  // Try to get demo_user_id from cookies (Demo users)
  const demoUserIdCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('demo_user_id='))
    ?.split('=')[1];

  if (demoUserIdCookie) {
    return `demo:${demoUserIdCookie}`;
  }

  // Fallback to localStorage
  return localStorage.getItem('auth_token');
}

/**
 * Gets the Authorization header value for API requests
 * Returns "Bearer {token}" or empty string if no token
 */
export function getAuthHeader(): string {
  const token = getAuthToken();
  return token ? `Bearer ${token}` : '';
}

