"use client";

/**
 * Navigation Auth Component
 * Displays authentication controls in the navigation bar
 * Shows login/register buttons for guests, dashboard/sign-out for authenticated users
 */

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "./use-auth";
import { redirectByRole } from "@/lib/auth/redirect-by-role";

export default function NavAuth(): React.ReactElement {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted/60" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />
      </div>
    );
  }

  // Authenticated state
  if (user) {
    const role = (user.user_metadata?.role as string | undefined) ?? null;
    const dashboardHref = redirectByRole(role);

    const handleSignOut = async () => {
      setIsSigningOut(true);
      try {
        // Call API to clear server-side session
        await fetch("/api/auth/sign-out", { method: "POST" });
      } catch (error) {
        console.warn("Sign-out API error (non-critical):", error);
      }
      
      // Clear client-side session
      await signOut();
      
      // Redirect to home page
      router.push("/");
      setIsSigningOut(false);
    };

    return (
      <div className="flex items-center gap-3">
        <span
          className="hidden max-w-[200px] truncate text-sm text-muted-foreground sm:inline"
          title={user.email ?? undefined}
        >
          {user.email}
        </span>
        <Link href={dashboardHref}>
          <Button variant="secondary" size="sm">
            Dashboard
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    );
  }

  // Guest state
  return (
    <div className="flex items-center gap-3">
      <Link href="/login">
        <Button variant="outline" size="sm">
          Log in
        </Button>
      </Link>
      <Link href="/sign-up">
        <Button size="sm">Register</Button>
      </Link>
    </div>
  );
}
