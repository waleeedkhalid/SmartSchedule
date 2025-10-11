"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./use-auth";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/AuthDialog";

// Small navbar auth widget: shows Sign in/Register or current user + Sign out
export default function NavAuth(): React.ReactElement {
  const { user, isLoading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className="h-9 w-24 rounded-md bg-muted/50 animate-pulse"
        aria-hidden
      />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span
          className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[180px]"
          title={user.email ?? undefined}
        >
          {user.email}
        </span>
        <Link href="/student">
          <Button variant="secondary" size="sm">
            Dashboard
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Sign in / Register
      </Button>
      <AuthDialog
        open={open}
        onOpenChange={setOpen}
        roleTitle="portal"
        redirectPath="/student"
      />
    </>
  );
}
