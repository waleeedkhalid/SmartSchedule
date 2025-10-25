"use client";

/**
 * Use Auth Hook
 * Custom hook to access authentication context
 */

import { useContext } from "react";
import AuthContext from "./auth-context";
import type { AuthContextValue } from "./auth-types";

/**
 * Hook to access authentication state and methods
 * @returns Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signOut } = useAuth();
 *   return <button onClick={signOut}>{user?.email}</button>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
