"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import AuthContext from "./auth-context";

interface AuthContextValue {
  readonly session: Session | null;
  readonly user: User | null;
  readonly isLoading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

function useProvideAuth(): AuthContextValue {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [isLoading, setIsLoading] = useState(!session);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  return useMemo(
    () => ({ session, user, isLoading, signInWithOtp, signOut }),
    [session, user, isLoading, signInWithOtp, signOut]
  );
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
