/**
 * Version Control Queries
 * Fetch schedule version history and changes
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

export interface VersionRecord {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  table_name: string;
  record_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  old_data: any;
  new_data: any;
  changed_fields: string[] | null;
  description: string | null;
  tags: string[] | null;
  created_at: string;
}

/**
 * Get version history for a specific table/record
 */
export const getVersionHistory = cache(
  async (tableName: string, recordId?: string) => {
    const supabase = await createServerClient();

    let query = supabase
      .from("version_control")
      .select("*")
      .eq("table_name", tableName)
      .order("created_at", { ascending: false })
      .limit(50);

    if (recordId) {
      query = query.eq("record_id", recordId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching version history:", error);
      return [];
    }

    return (data as VersionRecord[]) || [];
  }
);

/**
 * Get recent changes across all tables
 */
export const getRecentChanges = cache(async (limit: number = 20) => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("version_control")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent changes:", error);
    return [];
  }

  return (data as VersionRecord[]) || [];
});

/**
 * Get version history by user
 */
export const getVersionHistoryByUser = cache(async (userId: string) => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("version_control")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching user version history:", error);
    return [];
  }

  return (data as VersionRecord[]) || [];
});

