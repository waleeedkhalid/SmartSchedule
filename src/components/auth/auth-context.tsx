"use client";

// PRD: Feature 1 - Role-Based Authentication (Supabase)
// React context for Supabase auth.

import { createContext } from "react";
import type { AuthContextValue } from "./auth-types";

const AuthContext = createContext<AuthContextValue | null>(null);
export default AuthContext;
