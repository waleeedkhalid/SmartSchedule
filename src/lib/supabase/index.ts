/**
 * Supabase Utilities - Central Export
 * ⚠️ IMPORTANT: Only export client-side code here
 * Server-only exports (server.ts) should be imported directly to avoid build errors
 */

export { createBrowserClient, supabase } from './client';
export { createMiddlewareClient } from './middleware';

// ❌ DO NOT export createServerClient here - it causes build errors
// ✅ Import server client directly: import { createServerClient } from '@/lib/supabase/server';

