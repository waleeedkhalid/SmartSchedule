/**
 * Optimized Registrar Dashboard Data Fetching
 *
 * This module provides a single optimized function to fetch all registrar dashboard data
 * in parallel with minimal database round-trips.
 *
 * Performance optimizations:
 * 1. Single Supabase client creation
 * 2. Parallel Promise.all for all queries
 * 3. React.cache() for request-level memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";

export interface RegistrarDashboardData {
  deadlines: Array<{
    id: string;
    title: string;
    description: string | null;
    event_type: string;
    start_date: string;
    end_date: string;
    days_until_start?: number | null;
    days_until_end?: number | null;
    priority: string;
    status: string;
    requires_action: boolean;
  }>;
  notifications: Array<{
    id: string;
    user_id: string;
    type: string;
    payload: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  }>;
}

/**
 * Fetch all registrar dashboard data in a single optimized call
 * Uses a single Supabase client and parallel queries
 */
export const getRegistrarDashboardData = cache(
  async (userId: string): Promise<RegistrarDashboardData> => {
    const supabase = await createClient();

    // Execute all queries in parallel with a single client
    const [deadlinesResult, notificationsResult] = await Promise.all([
      // Get upcoming deadlines for registrar role
      supabase.rpc("get_upcoming_deadlines_for_role", {
        role_name: "registrar",
        days_ahead: 30,
      }),

      // Get recent notifications
      supabase
        .from("notification")
        .select("id, user_id, type, payload, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      deadlines: deadlinesResult.data || [],
      notifications: notificationsResult.data || [],
    };
  }
);
