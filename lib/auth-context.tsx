"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import type { UserRoleRow } from "@/lib/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRoleRow | null;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  isLoading: true,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRoleRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache to prevent duplicate fetches for the same user
  const fetchingRef = useRef<Set<string>>(new Set());
  const cachedRoleRef = useRef<Map<string, UserRoleRow | null>>(new Map());

  // 1. Centralized logic to fetch role based on user ID
  // CACHED: Prevents duplicate requests for the same user ID
  const fetchUserRole = useCallback(async (userId: string) => {
    // If we already have cached data for this user, use it
    if (cachedRoleRef.current.has(userId)) {
      const cached = cachedRoleRef.current.get(userId);
      if (cached !== undefined) {
        setUserRole(cached);
      }
      return;
    }

    // If we're already fetching for this user, skip duplicate request
    if (fetchingRef.current.has(userId)) {
      return;
    }

    // Mark as fetching
    fetchingRef.current.add(userId);

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, name, email, created_at, updated_at, onboarding_completed")
        .eq("user_id", userId)
        .single();

      if (data && !error) {
        // Cache the result
        cachedRoleRef.current.set(userId, data as UserRoleRow);
        setUserRole(data as UserRoleRow);
      } else {
        // Cache null result to prevent repeated failed fetches
        cachedRoleRef.current.set(userId, null);
        // Fallback or handle error (e.g. user exists in auth but not in table)
        // PGRST116 is "not found" - expected for new users, don't log
        if (error?.code !== 'PGRST116') {
          console.warn("Error fetching user role:", {
            code: error?.code,
            message: error?.message,
          });
        }
        setUserRole(null);
      }
    } catch (err) {
      // Cache null result on error
      cachedRoleRef.current.set(userId, null);
      console.error("Error fetching role:", err);
      setUserRole(null);
    } finally {
      // Remove from fetching set
      fetchingRef.current.delete(userId);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    // 2. Initial Session Fetch
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn("Error getting session:", error);
        }
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchUserRole(currentSession.user.id);
          } else {
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setUserRole(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // 3. Real-time Subscription (The "Production" Way)
    // This automatically updates state on login, logout, or token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Only fetch role if the user changed or we don't have it cached
        const userId = newSession.user.id;
        if (userId !== user?.id || !cachedRoleRef.current.has(userId)) {
          await fetchUserRole(userId);
        } else {
          // Use cached value
          const cached = cachedRoleRef.current.get(userId);
          if (cached !== undefined) {
            setUserRole(cached);
          }
        }
      } else {
        // Clear cache and state on logout
        cachedRoleRef.current.clear();
        fetchingRef.current.clear();
        setUserRole(null);
        // Optional: Redirect to login on sign out
        // router.push('/login'); 
      }
      
      setIsLoading(false);
      
      // If the session expired/refreshed, we might want to refresh router
      if (event === 'TOKEN_REFRESHED') {
        router.refresh(); 
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router, user?.id, fetchUserRole]);

  const signOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all cookies and localStorage on client side
      if (typeof window !== 'undefined') {
        // Clear all auth cookies
        const { performClientLogoutCleanup } = await import('@/lib/utils/cookie-utils');
        performClientLogoutCleanup();
      }
      
      // Clear cache and state
      cachedRoleRef.current.clear();
      fetchingRef.current.clear();
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if signOut fails, clear local state and redirect
      if (typeof window !== 'undefined') {
        const { performClientLogoutCleanup } = await import('@/lib/utils/cookie-utils');
        performClientLogoutCleanup();
      }
      // Clear cache and state
      cachedRoleRef.current.clear();
      fetchingRef.current.clear();
      setUser(null);
      setSession(null);
      setUserRole(null);
      router.push("/login");
    }
  }, [supabase, router]);

  // Memoize values to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    userRole,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    signOut
  }), [user, session, userRole, isLoading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
