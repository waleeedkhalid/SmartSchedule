// Server-side Supabase client for API routes
// PRD: Feature 1 - Role-Based Authentication (Supabase)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
}

// Create a Supabase client with the service role key
// This bypasses RLS and should only be used in API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get student by user_id
export async function getStudentByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get student with completed courses
export async function getStudentProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

// Helper function to get student by email
export async function getStudentByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw error;
  return data;
}
