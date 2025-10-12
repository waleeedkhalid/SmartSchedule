"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./use-auth";
import { redirectByRole } from "@/lib/auth/redirect-by-role";

// Navbar auth widget: exposes login/register for guests and dashboard/sign-out for authenticated users
export default function NavAuth(): React.ReactElement {
  const { user, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-9 w-16 animate-pulse rounded-md bg-muted/60" />
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted/40" />
      </div>
    );
  }

  if (user) {
    const role = (user.user_metadata?.role as string | undefined) ?? null;
    const dashboardHref = redirectByRole(role) ?? "/dashboard";

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
          onClick={async () => {
            setIsSigningOut(true);
            try {
              await fetch("/api/auth/sign-out", { method: "POST" });
            } catch {
              // Ignore sign-out network errors; local state still clears.
            }
            await signOut();
            setIsSigningOut(false);
          }}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    );
  }

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
