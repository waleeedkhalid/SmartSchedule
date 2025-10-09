"use client";

// PRD: Feature 1 - Role-Based Authentication (Supabase)
// Convenience hook to consume Supabase auth context.

import { useContext } from "react";
import AuthContext from "./auth-context";
import type { AuthContextValue } from "./auth-types";

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
