"use client";

/**
 * Authentication Context
 * React context for providing authentication state throughout the app
 */

import { createContext } from "react";
import type { AuthContextValue } from "./auth-types";

/**
 * Context for authentication state and methods
 * @see AuthProvider for the provider component
 * @see useAuth for the consumer hook
 */
const AuthContext = createContext<AuthContextValue | null>(null);

export default AuthContext;
