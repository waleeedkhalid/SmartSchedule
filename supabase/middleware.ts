/**
 * Authentication Middleware
 * 
 * Handles authentication for Supabase production accounts.
 * Uses Supabase SSR pattern to automatically refresh auth sessions on every request.
 * 
 * CRITICAL: This middleware calls `supabase.auth.getUser()` which refreshes the
 * auth session automatically. This keeps the session alive and ensures cookies
 * are properly set for Server Actions.
 * 
 * Note: Redirects authenticated users from auth pages to /dashboard,
 * which will then redirect to the role-specific dashboard.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Clears all authentication cookies to reset corrupted or expired session
 * This ensures a clean signout when session expires - no errors will appear
 * Clears both custom auth cookies and all Supabase SSR cookies
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  // Get all cookies from the response to find Supabase cookies
  const allCookies = response.cookies.getAll();
  
  // Clear all auth-related cookies (both custom and Supabase)
  const cookiesToClear = [
    'auth_token',
    // Supabase SSR cookie patterns (these are the actual cookie names used by @supabase/ssr)
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'sb-auth-token-code-verifier',
  ];
  
  // Also clear any cookies that match Supabase patterns
  allCookies.forEach(cookie => {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      cookiesToClear.push(cookie.name);
    }
  });
  
  // Remove duplicates
  const uniqueCookies = [...new Set(cookiesToClear)];
  
  // Clear each cookie once with path: '/' and maxAge: 0
  // This is sufficient for cookie deletion across all paths
  uniqueCookies.forEach(cookieName => {
    response.cookies.delete(cookieName);
    response.cookies.set(cookieName, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  });
  
  return response;
}

/**
 * Automatically signs out user when session expires or cookies are invalid
 * Redirects to login with session=expired parameter
 */
function autoSignOut(request: NextRequest, reason: string): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("session", "expired");
  loginUrl.searchParams.set("reason", reason);
  
  const response = NextResponse.redirect(loginUrl);
  return clearAuthCookies(response);
}

/**
 * Copies cookies from source response to destination response
 * This ensures Supabase session cookies are preserved on redirects
 */
function copyCookiesToResponse(source: NextResponse, destination: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie.name, cookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  });
  return destination;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const url = request.nextUrl.toString();
  
  // CRITICAL: Early return for Next.js internal requests
  // This includes static assets, RSC requests, fetch-server-response, and other internal Next.js paths
  // Skip ALL Next.js internal requests to prevent infinite redirect loops when session is invalid
  
  // Check for standard Next.js internal paths
  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next({
      request,
    });
  }
  
  // Check for RSC query parameters (React Server Components)
  // These are used by Next.js for React Server Component requests
  const hasRscQuery = searchParams.has('__rsc__') || 
                      searchParams.has('_rsc') ||
                      searchParams.has('__nextjs_router_prefetch__') ||
                      url.includes('__rsc__') ||
                      url.includes('_rsc=');
  
  // Check for Next.js internal headers
  // These indicate internal Next.js requests (RSC, prefetch, etc.)
  const hasNextInternalHeader = 
    request.headers.get('rsc') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('next-action') !== null ||
    request.headers.get('x-middleware-subrequest') !== null ||
    request.headers.get('x-nextjs-data') !== null;
  
  // Check for fetch-server-response patterns
  // fetch-server-response makes internal requests that may not have RSC indicators
  // These requests typically have specific accept headers or come from Next.js internals
  const acceptHeader = request.headers.get('accept') || '';
  const refererHeader = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  // Detect fetch-server-response requests
  // These are internal Next.js requests for fetching server component responses
  // The key is to identify requests that are NOT user-initiated navigation
  const isFetchServerResponse = 
    // RSC component requests (text/x-component is the RSC content type)
    acceptHeader.includes('text/x-component') ||
    // JSON requests from Next.js internals (fetch-server-response pattern)
    (acceptHeader.includes('application/json') && 
     (refererHeader.includes('/_next/') || 
      refererHeader.includes('__rsc__') ||
      refererHeader.includes('_rsc='))) ||
    // Next.js internal requests often have specific user-agent patterns
    (userAgent.includes('Next.js') && !acceptHeader.includes('text/html')) ||
    // Requests that are clearly from Next.js internals
    // Key indicators: specific accept header (not */*), no browser navigation headers
    (request.method === 'GET' && 
     !pathname.startsWith('/api/') && // Don't block API routes
     acceptHeader && 
     acceptHeader !== '*/*' && // Browsers send */*, Next.js internals are specific
     !acceptHeader.includes('text/html') && // Not a browser page request
     !request.headers.get('x-requested-with') && // No XHR header (browser would have this)
     refererHeader && 
     refererHeader.includes(request.nextUrl.origin) && // Same origin
     (refererHeader.includes('/_next/') || refererHeader.includes('__rsc__')));
  
  // CRITICAL: Skip ALL internal Next.js requests immediately
  // This prevents fetch-server-response and RSC requests from triggering auth checks
  // This is the KEY fix for infinite redirect loops caused by Next.js internal requests
  // Without this, fetch-server-response requests trigger auth checks → redirect → more requests → loop
  if (hasRscQuery || hasNextInternalHeader || isFetchServerResponse) {
    return NextResponse.next({
      request,
    });
  }
  
  // Create response object
  // The Supabase client will update cookies on this response object
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Create Supabase client and check auth
  let supabaseUser = null;
  let authError = null;
  let hasSupabaseSession = false;
  let supabase: ReturnType<typeof createServerClient> | null = null;
  
  try {
    // Create Supabase client with request/response for cookie handling
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Only set cookies on the response object
              // Modifying request.cookies is an anti-pattern in Next.js middleware
              // The response cookies will be sent to the browser, which will include
              // them in subsequent requests automatically
              response.cookies.set(name, value, {
                ...options,
                httpOnly: options?.httpOnly ?? true,
                secure: options?.secure ?? process.env.NODE_ENV === 'production',
                sameSite: options?.sameSite ?? 'lax',
                path: options?.path ?? '/',
              });
            });
          },
        },
      }
    );
    
    // CRITICAL: Refresh the auth session by calling getUser()
    // This automatically refreshes expired tokens and updates cookies
    const authResult = await supabase.auth.getUser();
    supabaseUser = authResult.data?.user || null;
    authError = authResult.error;
    hasSupabaseSession = !!supabaseUser && !authError;
  } catch (error) {
    // Handle errors creating or using Supabase client
    // This prevents middleware from crashing if createServerClient fails
    console.error('Failed to create or use Supabase client:', error);
    // supabase remains null, which is handled gracefully by the rest of the code
    authError = error instanceof Error ? error : new Error(String(error));
    hasSupabaseSession = false;
  }
  
  // Public routes that don't require authentication
  // Note: /_next and /favicon.ico are already handled by the early return above
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/auth',
    '/error',
    '/onboarding',
    '/api',
    '/mobile/login'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // AUTOMATIC SIGNOUT: If Supabase session expired or invalid, sign out immediately
  // This prevents errors from appearing when user tries to access protected routes
  // Also clear cookies on response to prevent redirect loops
  if (authError && !isPublicRoute && pathname.startsWith('/dashboard')) {
    // Session expired or invalid - automatically sign out and clear all cookies
    console.warn('Session expired or invalid, automatically signing out:', {
      error: authError.message,
      pathname
    });
    // autoSignOut handles cookie clearing internally
    return autoSignOut(request, 'session_expired');
  }
  
  // AGGRESSIVE CLEANUP: If we have auth errors on any protected route, clear cookies
  // This prevents infinite redirect loops when session is corrupted
  if (authError && !isPublicRoute) {
    console.warn('Auth error detected on protected route, clearing session:', {
      error: authError.message,
      pathname
    });
    // Use standard autoSignOut helper for consistent behavior
    return autoSignOut(request, 'auth_error');
  }
  
  // Check if user is authenticated
  const isAuthenticated = hasSupabaseSession;
  
  // Redirect logged-in users away from auth pages
  // Redirect to /dashboard which will detect role
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    // Supabase user - redirect to /dashboard which will detect role
    // Session is already validated by getUser() call above
    // Note: hasSupabaseSession is defined as !!supabaseUser && !authError,
    // so if hasSupabaseSession is true, supabaseUser is guaranteed to exist
    
    // Create redirect response and copy Supabase session cookies
    const redirectUrl = new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    return copyCookiesToResponse(response, redirectResponse);
  }
  
  // Protect dashboard routes - require authentication
  if (!isAuthenticated && pathname.startsWith('/dashboard') && !isPublicRoute) {
    // If we have Supabase cookies but no valid session, it's corrupted - sign out immediately
    // This prevents redirect loops from corrupted sessions
    const hasSupabaseCookies = request.cookies.getAll().some(
      cookie => cookie.name.startsWith('sb-') || cookie.name.includes('supabase')
    );
    
    if (hasSupabaseCookies) {
      // Corrupted session - sign out immediately instead of redirecting
      // This happens when cookies exist but session is invalid (expired, corrupted, etc.)
      console.warn('Corrupted session detected (cookies present but no valid auth), signing out immediately:', {
        pathname,
        hasAuthError: !!authError,
        authErrorMessage: authError?.message
      });
      return autoSignOut(request, 'corrupted_session');
    }
    
    // Legitimate unauthenticated user - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Return response with updated cookies from Supabase session refresh
  // This ensures the refreshed session cookies are sent to the client
  return response;
}
