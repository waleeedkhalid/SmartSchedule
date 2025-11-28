/**
 * Logging Utility
 * 
 * Provides environment-aware logging that respects production settings.
 * Console statements are only shown in development to prevent performance
 * impact and log clutter in production.
 */

/**
 * Logs a warning message (only in development)
 */
export function logWarning(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, ...args);
  }
}

/**
 * Logs an error message (only in development)
 */
export function logError(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, ...args);
  }
  // In production, consider sending to error tracking service (Sentry, etc.)
}

/**
 * Logs an info message (only in development)
 */
export function logInfo(message: string, ...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
}

