import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'
import { logWarning, logError } from '@/lib/utils/logger'

/**
 * Singleton instance storage
 * This ensures we only create the client once on the client side
 */
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Creates a Proxy-based dummy client that handles method chaining.
 * 
 * This client accepts ANY method call (`.eq()`, `.order()`, `.filter()`, etc.)
 * without crashing, ensuring the app loads even without environment variables.
 * 
 * Example: supabase.from('table').select('*').eq('id', 1).order('name') will not crash.
 * When awaited, it returns { data: [], error: {...} } to prevent .map() crashes.
 */
function createSafeDummyClient(): ReturnType<typeof createBrowserClient<Database>> {
  logWarning(
    '⚠️ Using Dummy Supabase Client - Database operations will fail safely.\n' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  )

  // Create a Proxy that intercepts all property accesses and method calls
  // This allows infinite method chaining without crashing
  const dummyQueryBuilder = new Proxy(() => {}, {
    get: (_target, prop) => {
      // If code tries to await the result (accessing .then), return the error structure
      // This prevents "data.map is not a function" errors
      if (prop === 'then') {
        return (resolve: (value: {
          data: unknown[]
          error: { message: string }
          count: number
          status: number
          statusText: string
        }) => void) => {
          resolve({
            data: [], // Return empty array to prevent .map() crashes
            error: { message: 'Missing Supabase environment variables' },
            count: 0,
            status: 500,
            statusText: 'Misconfigured',
          })
        }
      }

      // Handle other Promise methods
      if (prop === 'catch' || prop === 'finally') {
        return () => dummyQueryBuilder
      }

      // For any other method (select, eq, order, filter, etc.), return the proxy itself
      // This allows infinite chaining: .select().eq().order().single() etc.
      return () => dummyQueryBuilder
    },
    // Handle function calls (when the proxy is called as a function)
    apply: () => dummyQueryBuilder,
  })

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      }),
    },
    // Any call to .from('...') returns our chainable proxy
    from: () => dummyQueryBuilder,
    // Handle storage/rpc if needed
    storage: {
      from: () => dummyQueryBuilder,
    },
    rpc: () => dummyQueryBuilder,
  } as unknown as ReturnType<typeof createBrowserClient<Database>>
}

/**
 * Creates a Supabase client for browser/client-side use
 * 
 * CRITICAL: This function uses a Singleton pattern to ensure we only create
 * the client once, preventing memory leaks and connection resets.
 * 
 * The `createBrowserClient` from `@supabase/ssr` is designed to handle server-side
 * rendering safely. It will work on both server and client, but will only have access
 * to cookies/localStorage when running in the browser.
 * 
 * Safety measures:
 * 1. Returns existing instance if available (Singleton pattern)
 * 2. Validates environment variables on both server and client
 * 3. Wraps createBrowserClient in try-catch to handle synchronous crashes
 * 4. Returns a safe dummy client only if env vars are missing or initialization fails
 * 
 * If environment variables are missing or createBrowserClient crashes,
 * it returns a dummy client that will fail gracefully when actual database operations are attempted.
 */
export function createClient() {
  // 1. Return existing instance if available (Singleton)
  if (clientInstance) {
    return clientInstance
  }

  // 2. Validate environment variables (runs on both server and client)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // ⚠️ CRITICAL: Log error instead of throwing synchronously
    // This prevents the _rsc loop by allowing React to hydrate successfully
    // The error will surface when actual database operations are attempted
    logError(
      '❌ SUPABASE SETUP ERROR: Missing required environment variables!\n' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.\n' +
      'The application will continue to load but database operations will fail.'
    )
    
    // Return a safe dummy client that won't crash hydration
    return createSafeDummyClient()
  }

  // 3. Initialize the client
  // createBrowserClient is safe to run on the server - it simply won't have access
  // to cookies/localStorage until it hits the browser, but it won't cause hydration mismatches
  try {
    clientInstance = createBrowserClient<Database>(url, key)
    return clientInstance
  } catch (error) {
    // If createBrowserClient crashes synchronously (e.g., unexpected storage errors),
    // log the error and return a safe dummy client to prevent crashes
    logError(
      '❌ SUPABASE CLIENT INITIALIZATION ERROR:\n' +
      'createBrowserClient crashed during initialization. This may be due to:\n' +
      '- Browser APIs not being available during hydration\n' +
      '- localStorage/cookies being blocked\n' +
      '- Other browser environment issues\n\n' +
      'Error details:',
      error
    )
    
    // Return safe dummy client to prevent the synchronous crash from triggering HMR loop
    return createSafeDummyClient()
  }
}
