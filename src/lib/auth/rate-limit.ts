/**
 * Rate Limiting Utility
 * Implements IP-based rate limiting to prevent brute force attacks
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Check if an identifier has exceeded the rate limit
 * @param identifier - Unique identifier (email, IP address, etc.)
 * @returns Object with success status and retry information
 */
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  resetAt: number;
  error?: string;
}> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No previous attempts or window expired
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      success: true,
      remaining: MAX_ATTEMPTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Within rate limit window
  if (entry.count < MAX_ATTEMPTS) {
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
      success: true,
      remaining: MAX_ATTEMPTS - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Rate limit exceeded
  const minutesUntilReset = Math.ceil((entry.resetAt - now) / 60000);
  return {
    success: false,
    remaining: 0,
    resetAt: entry.resetAt,
    error: `Too many login attempts. Please try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 * @param identifier - Unique identifier to check
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    return {
      remaining: MAX_ATTEMPTS,
      resetAt: now + WINDOW_MS,
    };
  }

  return {
    remaining: Math.max(0, MAX_ATTEMPTS - entry.count),
    resetAt: entry.resetAt,
  };
}

