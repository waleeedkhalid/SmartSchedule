// PRD: Feature 1 - Role-Based Authentication (Supabase)
// Supabase client singleton for browser usage

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Intentionally console.warn (not throw) to avoid crashing prototype when env is missing
  // Configure env vars to enable Supabase Auth and persistence.
  console.warn(
    "Supabase env vars are missing. Auth/Persistence will be disabled."
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
