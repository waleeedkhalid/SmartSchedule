import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import {
  isProtectedPath,
  pathRequiresRole,
  redirectByRole,
  type UserRole,
} from "@/lib/auth/redirect-by-role";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // PERFORMANCE OPTIMIZATION: Get role from user metadata (cached in JWT)
  // instead of database query. Role is stored in user_metadata during sign-in.
  // This eliminates a database query on every protected route request.
  const role = user.user_metadata?.role as UserRole | undefined;

  // If no role in metadata (legacy users), fall back to database
  // This ensures backward compatibility
  if (!role) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Update user metadata with role for future requests
    if (profile?.role) {
      await supabase.auth.updateUser({
        data: { role: profile.role },
      });
    }
  }

  if (pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectByRole(role);
    return NextResponse.redirect(redirectUrl);
  }

  const requiredRole = pathRequiresRole(pathname);

  if (requiredRole && requiredRole !== role) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = redirectByRole(role);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/dashboard",
    "/student/:path*",
    "/faculty/:path*",
    "/committee/scheduler/:path*",
    "/committee/teaching-load/:path*",
    "/committee/registrar/:path*",
  ],
};
