/**
 * Auth Components Barrel Export
 * Central export point for all authentication-related components and utilities
 */

// Context and Provider
export { AuthProvider } from "./AuthProvider";
export { default as AuthContext } from "./auth-context";

// Hooks
export { useAuth } from "./use-auth";

// Components
export { AuthButtons } from "./AuthButtons";
export { AuthDialog } from "./AuthDialog";
export { default as NavAuth } from "./NavAuth";

// Types
export type {
  AuthContextValue,
  AuthResult,
  SignInWithPasswordOptions,
  SignUpWithPasswordOptions,
} from "./auth-types";

