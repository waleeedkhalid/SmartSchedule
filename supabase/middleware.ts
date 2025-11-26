/**
 * Authentication Middleware
 * 
 * Handles authentication for both demo accounts and Supabase production accounts.
 * Uses Supabase SSR pattern to automatically refresh auth sessions on every request.
 * 
 * CRITICAL: This middleware calls `supabase.auth.getUser()` which refreshes the
 * auth session automatically. This keeps the session alive and ensures cookies
 * are properly set for Server Actions.
 * 
 * Note: Redirects authenticated users from auth pages to /dashboard,
 * which will then redirect to the role-specific dashboard.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { mockUsers } from "@/lib/demo-data";

/**
 * Gets user role from demo cookie (synchronous, for middleware)
 * Returns role string or null if not a demo user
 */
function getDemoUserRole(demoUserId: string | undefined): string | null {
  if (!demoUserId) {
    return null;
  }
  
  const user = mockUsers.find(u => u.id === demoUserId);
  return user ? user.role : null;
}

/**
 * Gets the dashboard path for a given role
 */
function getDashboardPath(role: string): string {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'faculty':
      return '/dashboard/faculty';
    case 'scheduling':
      return '/dashboard/scheduling';
    case 'teaching_load':
      return '/dashboard/teaching-load';
    case 'registrar':
      return '/dashboard/registrar';
    default:
      return '/dashboard'; // Let dashboard page handle role detection
  }
}

/**
 * Clears authentication cookies to reset corrupted session
 */
function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete('auth_token');
  response.cookies.delete('demo_user_id');
  // Also clear Supabase auth cookies
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  response.cookies.set('demo_user_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
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

/**
 * Creates a Supabase client for use in middleware
 * This client automatically reads and writes cookies from the request/response
 */
function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
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
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  
  // CRITICAL: Early return for Next.js internal requests to prevent RSC payload leaks
  // This includes RSC requests (?_rsc=), static assets, and other internal Next.js paths
  // Dashboard routes can receive RSC requests, so we must check for _rsc before any redirects
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    searchParams.has('_rsc')
  ) {
    // Pass through without modification to preserve RSC payload integrity
    // Pass request as-is to avoid stripping important metadata
    return NextResponse.next({
      request,
    });
  }
  
  // Create response object for Supabase to write cookies to
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Create Supabase client with request/response for cookie handling
  const supabase = createSupabaseClient(request, response);
  
  // CRITICAL: Refresh the auth session by calling getUser()
  // This automatically refreshes expired tokens and updates cookies
  // This must be called on every request to keep the session alive
  const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
  
  const demoUserId = request.cookies.get('demo_user_id')?.value;
  const hasSupabaseSession = !!supabaseUser && !authError;
  
  // Detect redirect loops: if user is being redirected to dashboard multiple times
  // Check for redirect loop indicator in query params
  const redirectCount = parseInt(searchParams.get('_redirect_count') || '0');
  if (redirectCount > 2) {
    // Too many redirects - likely a cookie issue causing a loop
    console.warn('Redirect loop detected, clearing cookies:', { pathname, redirectCount });
    const loginResponse = NextResponse.redirect(new URL("/login?session=expired", request.url));
    return clearAuthCookies(loginResponse);
  }
  
  // Check if user is authenticated (either demo or Supabase)
  const isAuthenticated = !!demoUserId || hasSupabaseSession;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/auth',
    '/error',
    '/onboarding',
    '/demo',
    '/api',
    '/_next',
    '/favicon.ico',
    '/mobile/login'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Redirect logged-in users away from auth pages
  // For demo users, redirect to role-specific dashboard
  // For Supabase users, redirect to /dashboard which will detect role
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    // Try to get demo user role (synchronous)
    const demoRole = getDemoUserRole(demoUserId);
    if (demoRole) {
      // Demo user - redirect to role-specific dashboard
      const dashboardPath = getDashboardPath(demoRole);
      const redirectUrl = new URL(dashboardPath, request.url);
      redirectUrl.searchParams.set('_redirect_count', '0'); // Reset redirect count
      return NextResponse.redirect(redirectUrl);
    }
    
    // Supabase user - redirect to /dashboard which will detect role
    // Session is already validated by getUser() call above
    if (hasSupabaseSession && !supabaseUser) {
      // Session refresh failed - clear cookies
      console.warn('Session refresh failed on auth page redirect, clearing cookies');
      const loginResponse = NextResponse.redirect(new URL("/login?session=expired", request.url));
      return clearAuthCookies(loginResponse);
    }
    
    // Create redirect response and copy Supabase session cookies
    const redirectUrl = new URL("/dashboard", request.url);
    redirectUrl.searchParams.set('_redirect_count', '0'); // Reset redirect count
    const redirectResponse = NextResponse.redirect(redirectUrl);
    return copyCookiesToResponse(response, redirectResponse);
  }
  
  // Protect dashboard routes - require authentication
  if (!isAuthenticated && pathname.startsWith('/dashboard') && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check onboarding status for authenticated users trying to access dashboard
  // Skip this check if already on onboarding page or if it's a demo user
  if (isAuthenticated && pathname.startsWith('/dashboard') && !isPublicRoute && !demoUserId) {
    // Only check for Supabase users (demo users skip onboarding)
    if (hasSupabaseSession && supabaseUser) {
      try {
          // Check onboarding status
          // Uses idx_user_roles_onboarding partial index when onboarding_completed = FALSE
          const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select('onboarding_completed, role')
            .eq('user_id', supabaseUser.id)
            .single();
          
          // If user_roles doesn't exist for this user, clear cookies (cookie mismatch)
          if (roleError || !userRole) {
            console.warn('User role not found - possible cookie mismatch, clearing cookies:', {
              userId: supabaseUser.id,
              error: roleError?.message,
              pathname
            });
            const loginResponse = NextResponse.redirect(new URL("/login?session=expired", request.url));
            return clearAuthCookies(loginResponse);
          }
          
          if (userRole) {
            // Check if onboarding is needed
            let needsOnboarding = !userRole.onboarding_completed;
            
            // Also check if role-specific profile exists
            if (!needsOnboarding) {
              if (userRole.role === 'student') {
                // Students need student_profile
                const { data: studentProfile } = await supabase
                  .from('student_profile')
                  .select('user_id')
                  .eq('user_id', supabaseUser.id)
                  .single();
                
                if (!studentProfile) {
                  needsOnboarding = true;
                }
              } else if (userRole.role === 'faculty') {
                // Faculty need faculty_profile
                const { data: facultyProfile } = await supabase
                  .from('faculty_profile')
                  .select('user_id')
                  .eq('user_id', supabaseUser.id)
                  .single();
                
                if (!facultyProfile) {
                  needsOnboarding = true;
                }
              } else if (['scheduling', 'teaching_load', 'registrar'].includes(userRole.role)) {
                // Committee roles need committee_profile
                const { data: committeeProfile } = await supabase
                  .from('committee_profile')
                  .select('user_id')
                  .eq('user_id', supabaseUser.id)
                  .single();
                
                if (!committeeProfile) {
                  needsOnboarding = true;
                }
              }
            }
            
            // Redirect to onboarding if needed
            if (needsOnboarding) {
              const onboardingResponse = NextResponse.redirect(new URL("/onboarding", request.url));
              return copyCookiesToResponse(response, onboardingResponse);
            }
          }
        } catch (error) {
          // If error checking onboarding/auth, clear cookies to prevent loops
          console.error("Error checking authentication/onboarding status, clearing cookies:", error);
          const loginResponse = NextResponse.redirect(new URL("/login?session=expired", request.url));
          return clearAuthCookies(loginResponse);
        }
      } else if (!hasSupabaseSession) {
        // Session refresh failed - clear cookies and redirect to login
        console.warn('Session refresh failed, clearing cookies:', {
          error: authError instanceof Error ? authError.message : String(authError),
          pathname
        });
        const loginResponse = NextResponse.redirect(new URL("/login?session=expired", request.url));
        return clearAuthCookies(loginResponse);
      }
    }
  
  // Return response with updated cookies from Supabase session refresh
  // This ensures the refreshed session cookies are sent to the client
  return response;
}
