/**
 * Authentication Types
 * Type definitions for authentication context and auth-related data
 */

import type { AuthError, Session, User } from "@supabase/supabase-js";

/**
 * Options for signing in with password
 */
export interface SignInWithPasswordOptions {
  email: string;
  password: string;
}

/**
 * Options for signing up with email/password
 */
export interface SignUpWithPasswordOptions {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

/**
 * Result of authentication operations
 */
export interface AuthResult {
  error: AuthError | null;
}

/**
 * Authentication context value provided to the app
 */
export interface AuthContextValue {
  /** Current session object */
  readonly session: Session | null;
  /** Current authenticated user */
  readonly user: User | null;
  /** Whether auth state is being determined */
  readonly isLoading: boolean;
  
  /**
   * Sign in with magic link (OTP)
   * @param email - User's email address
   * @returns Promise with potential error
   */
  signInWithOtp: (email: string) => Promise<AuthResult>;
  
  /**
   * Sign in with email and password
   * @param options - Email and password credentials
   * @returns Promise with potential error
   */
  signInWithPassword: (options: SignInWithPasswordOptions) => Promise<AuthResult>;
  
  /**
   * Sign up a new user with email and password
   * @param options - Registration details
   * @returns Promise with potential error
   */
  signUpWithPassword: (options: SignUpWithPasswordOptions) => Promise<AuthResult>;
  
  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   */
  signOut: () => Promise<void>;
}
