import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set, skipping auth check');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // =====================================================
  // DEFINE PUBLIC ROUTES (accessible without authentication)
  // =====================================================
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
    '/favicon.ico'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // Skip auth check only for static assets that definitely don't need user info
  const skipAuthCheck = 
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico';

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: Only call getUser() when needed to reduce 403 noise
  let user = null;
  
  if (!skipAuthCheck) {
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    // Silently handle 403/auth errors - they're expected for unauthenticated users
    if (!error) {
      user = authUser;
    }
  }

  // =====================================================
  // REDIRECT LOGGED-IN USERS FROM AUTH ROUTES
  // =====================================================
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // =====================================================
  // PROTECT DASHBOARD AND OTHER PRIVATE ROUTES
  // =====================================================
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // =====================================================
  // ONBOARDING CHECK
  // =====================================================
  // If user is authenticated and trying to access dashboard routes,
  // check if they need to complete onboarding first (have role-specific profile)
  
  if (
    user &&
    request.nextUrl.pathname.startsWith("/dashboard") &&
    request.nextUrl.pathname !== "/onboarding"
  ) {
    // Check if user has a role record
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!userRole) {
      // User has no role record - redirect to onboarding
      const onboardingUrl = new URL("/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }
    
    // Check if user has role-specific profile
    // Students need student_profile, Faculty need faculty_profile
    // Other roles (scheduling, teaching_load, registrar) only need user_roles
    if (userRole.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!studentProfile) {
        // Student needs onboarding - redirect
        const onboardingUrl = new URL("/onboarding", request.url);
        return NextResponse.redirect(onboardingUrl);
      }
    } else if (userRole.role === 'faculty') {
      const { data: facultyProfile } = await supabase
        .from('faculty_profile')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!facultyProfile) {
        // Faculty needs onboarding - redirect
        const onboardingUrl = new URL("/onboarding", request.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
    // Other roles don't need separate profiles, so they're good to go
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
