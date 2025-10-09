"use client";

// PRD: Feature 1 - Role-Based Authentication (Supabase)
// Minimal auth buttons with magic link sign-in and sign-out.

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "./use-auth";

export function AuthButtons(): React.ReactElement {
  const { user, isLoading, signInWithOtp, signOut } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{user.email}</span>
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  const handleSend = async (): Promise<void> => {
    setMessage("");
    if (!email) {
      setMessage("Enter your email to receive a magic link.");
      return;
    }
    setIsSending(true);
    const { error } = await signInWithOtp(email);
    setIsSending(false);
    setMessage(error ? error.message : "Magic link sent. Check your inbox.");
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-56"
        aria-label="Email for sign in"
      />
      <Button size="sm" onClick={() => void handleSend()} disabled={isSending}>
        {isSending ? "Sending..." : "Send magic link"}
      </Button>
      {message && (
        <span className="text-xs text-muted-foreground">{message}</span>
      )}
    </div>
  );
}
