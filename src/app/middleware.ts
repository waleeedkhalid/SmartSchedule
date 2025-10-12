import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/utils/supabase/middleware";
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

  const { data: profile } = await supabase
    .from("user")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

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
