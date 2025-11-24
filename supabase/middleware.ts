/**
 * DEMO MODE: Authentication Middleware
 * 
 * Handles demo account authentication using cookies.
 */

import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const demoUserId = request.cookies.get('demo_user_id')?.value;
  const pathname = request.nextUrl.pathname;
  
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
  if (demoUserId && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Protect dashboard routes - require authentication
  if (!demoUserId && pathname.startsWith('/dashboard') && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow all other routes
  return NextResponse.next({
    request,
  });
}
