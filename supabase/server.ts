/**
 * Re-export Supabase server client
 * This file maintains compatibility with existing imports using @/supabase/server
 * while the actual implementation is in utils/supabase/server.ts
 */
export { createClient } from '@/utils/supabase/server'

