// PRD: Feature 1 - Role-Based Authentication (Supabase)
// Auth context value contract.

import type { AuthError, Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  readonly session: Session | null;
  readonly user: User | null;
  readonly isLoading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}
