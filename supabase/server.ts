/**
 * Server-Side Supabase Client Factory
 * 
 * Creates a Supabase client for Server Actions and Server Components.
 * Properly handles cookies to maintain authentication state across requests.
 * 
 * IMPORTANT: This client automatically reads and writes Supabase auth cookies
 * from the request, ensuring sessions persist across Server Action calls.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for use in Server Actions and Server Components.
 * 
 * This client:
 * - Automatically reads auth cookies from the request
 * - Handles session refresh transparently
 * - Gracefully handles cookie setting errors (which occur in Server Components)
 * 
 * @returns A configured Supabase client instance
 * 
 * @example
 * ```typescript
 * const supabase = await createClient();
 * const { data: { user }, error } = await supabase.auth.getUser();
 * if (error || !user) throw new Error("Unauthorized");
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Get all cookies from the request
         * This allows Supabase to read the auth session cookies
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Set cookies in the response
         * 
         * CRITICAL: In Server Components, cookies cannot be set after the
         * response has been sent. This is expected behavior and is handled
         * gracefully - the middleware will refresh the session on the next request.
         */
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Ensure cookies are set with proper security settings
                httpOnly: options?.httpOnly ?? true,
                secure: options?.secure ?? process.env.NODE_ENV === 'production',
                sameSite: options?.sameSite ?? 'lax',
                path: options?.path ?? '/',
              });
            });
          } catch (error) {
            // This error occurs in Server Components when trying to set cookies
            // after the response has been sent. This is expected and safe to ignore.
            // The middleware will handle session refresh on the next request.
            // 
            // In Server Actions, cookies can be set successfully.
            if (error instanceof Error && error.message.includes('cookies')) {
              // Silently handle cookie setting errors - middleware will refresh session
              return;
            }
            // Re-throw unexpected errors
            throw error;
          }
        },
      },
    }
  );
}
