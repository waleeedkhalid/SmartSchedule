// Server-side Supabase client for API routes
// PRD: Feature 1 - Role-Based Authentication (Supabase)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _adminClient: SupabaseClient<Database> | null = null;

export const hasSupabaseAdmin: boolean = Boolean(
  supabaseUrl && supabaseServiceKey
);

// Returns a Supabase admin client or null if env is missing.
export function tryGetSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!hasSupabaseAdmin) return null;
  if (_adminClient) return _adminClient;
  _adminClient = createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _adminClient;
}

// Backwards-compatible export: obtain the admin client or throw with a clear message.
export function getSupabaseAdminOrThrow(): SupabaseClient<Database> {
  const client = tryGetSupabaseAdmin();
  if (!client) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return client;
}

// For legacy imports expecting `supabaseAdmin`, export a getter proxy.
export const supabaseAdmin: SupabaseClient<Database> =
  getSupabaseAdminOrThrow();

// Helper function to get student by user_id (legacy - use new student profile system)
export async function getStudentByUserId(userId: string) {
  const { data, error } = await getSupabaseAdminOrThrow()
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No profile found
    }
    throw error;
  }
  return data;
}

// Helper function to get student profile (updated to use new system)
export async function getStudentProfile(userId: string) {
  const { data, error } = await getSupabaseAdminOrThrow()
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No profile found
    }
    throw error;
  }
  return data;
}

// Helper function to get student by email (updated to use new system)
export async function getStudentByEmail(email: string) {
  const { data, error } = await getSupabaseAdminOrThrow()
    .from("students")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No profile found
    }
    throw error;
  }
  return data;
}

// New helper function to get user by email (for authentication)
export async function getUserByEmail(email: string) {
  const { data, error } = await getSupabaseAdminOrThrow()
    .from("user")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No user found
    }
    throw error;
  }
  return data;
}
