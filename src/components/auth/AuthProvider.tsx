"use client";

/**
 * Authentication Provider
 * Provides authentication state and methods throughout the app via React Context
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import AuthContext from "./auth-context";
import { supabase } from "@/lib/supabase";
import type {
  AuthContextValue,
  AuthResult,
  SignInWithPasswordOptions,
  SignUpWithPasswordOptions,
} from "./auth-types";

/**
 * Custom hook that provides authentication functionality
 */
function useProvideAuth(): AuthContextValue {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(session?.user ?? null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign in with magic link (OTP)
   */
  const signInWithOtp = useCallback(async (email: string): Promise<AuthResult> => {
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error: result.error };
  }, []);

  /**
   * Sign in with email and password
   */
  const signInWithPassword = useCallback(
    async ({ email, password }: SignInWithPasswordOptions): Promise<AuthResult> => {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: result.error };
    },
    []
  );

  /**
   * Sign up with email and password
   */
  const signUpWithPassword = useCallback(
    async ({ email, password, fullName, role }: SignUpWithPasswordOptions): Promise<AuthResult> => {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      return { error: result.error };
    },
    []
  );

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, []);

  return useMemo(
    () => ({
      session,
      user,
      isLoading,
      signInWithOtp,
      signInWithPassword,
      signUpWithPassword,
      signOut,
    }),
    [session, user, isLoading, signInWithOtp, signInWithPassword, signUpWithPassword, signOut]
  );
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context
 */
export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const value = useProvideAuth();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
