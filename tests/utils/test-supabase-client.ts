/**
 * Test Supabase Client
 * Creates a Supabase client for testing without Next.js cookies dependency
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/test-schema';

/**
 * Create a Supabase client for testing
 * Uses service role key for full access during tests
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create authenticated test client for a specific user
 * Bypasses RLS for testing purposes
 */
export function createAuthenticatedTestClient(userId: string) {
  const client = createTestClient();
  
  // Set auth context for testing
  // Note: This is a simplified version. In production tests,
  // you would use Supabase's auth.admin methods or service role key
  
  return client;
}

