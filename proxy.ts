/**
 * Next.js Middleware
 *
 * Handles authentication flow using optimistic JWT session checks.
 * This middleware:
 * 1. Checks for a valid session cookie (optimistic - no DB queries)
 * 2. Refreshes the session for active users
 * 3. Redirects unauthenticated users from protected routes
 * 4. Redirects authenticated users away from auth pages
 *
 * IMPORTANT: This uses a feature flag (USE_NEW_AUTH) to allow gradual migration.
 * Set USE_NEW_AUTH=true in .env to enable the new auth flow.
 *
 * @see https://nextjs.org/docs/app/guides/authentication
 */

import { NextResponse, type NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

// Feature flag for gradual migration
const USE_NEW_AUTH = process.env.USE_NEW_AUTH === "true";

// Session configuration (must match lib/session.ts)
const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Route configuration
const protectedRoutes = ["/dashboard", "/onboarding"];
const publicRoutes = ["/login", "/register", "/"];
const authRoutes = ["/login", "/register"];

/**
 * Get the encoded secret key for JWT verification
 */
function getEncodedKey(): Uint8Array | null {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) return null;
  return new TextEncoder().encode(secretKey);
}

/**
 * Decrypt the session cookie (optimistic check - no DB query)
 */
async function decryptSession(
  session: string | undefined
): Promise<{ userId: string; role: string; expiresAt: Date } | null> {
  if (!session) return null;

  const key = getEncodedKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as string,
      role: payload.role as string,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    return null;
  }
}

/**
 * Encrypt a new session token
 */
async function encryptSession(payload: {
  userId: string;
  role: string;
  expiresAt: Date;
}): Promise<string | null> {
  const key = getEncodedKey();
  if (!key) return null;

  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

/**
 * Get dashboard path for a role
 */
function getDashboardPath(role: string): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "faculty":
      return "/dashboard/faculty";
    case "scheduling":
      return "/dashboard/scheduling";
    case "teaching_load":
      return "/dashboard/teaching-load";
    case "registrar":
      return "/dashboard/registrar";
    default:
      return "/dashboard";
  }
}

/**
 * New auth middleware using JWT session cookies
 */
async function handleNewAuth(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Get session from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decryptSession(sessionCookie);

  // Check route types
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle protected routes - redirect to login if no session
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle protected routes - redirect to login if session expired
  if (isProtectedRoute && session && new Date() > session.expiresAt) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("session", "expired");
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute && session && new Date() < session.expiresAt) {
    const dashboardPath = getDashboardPath(session.role);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Create response
  const response = NextResponse.next();

  // Refresh session if valid and not expired
  if (session && new Date() < session.expiresAt) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const newSession = await encryptSession({
      ...session,
      expiresAt: newExpiresAt,
    });

    if (newSession) {
      response.cookies.set(SESSION_COOKIE_NAME, newSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: newExpiresAt,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return response;
}

/**
 * Legacy auth middleware using Supabase session cookies
 */
async function handleLegacyAuth(request: NextRequest): Promise<NextResponse> {
  // Dynamically import to avoid loading when not needed
  const { updateSession } = await import("@/supabase/middleware");
  return updateSession(request);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  // Use feature flag to determine auth flow
  if (USE_NEW_AUTH) {
    return handleNewAuth(request);
  }

  return handleLegacyAuth(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - sw.js (service worker)
     * - Static image files (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
