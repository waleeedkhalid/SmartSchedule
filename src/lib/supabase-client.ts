import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@/utils/supabase/client";

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient();
  }

  return client;
}

export const supabase = getSupabaseClient();
