/**
 * Student Notifications & Deadlines
 *
 * Functions for fetching notifications, deadlines, and registration status
 * Wrapped with React.cache() for request memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import type { RegistrationStatus } from "./types";

/**
 * Get upcoming deadlines for a specific role
 * Wrapped with React.cache() for request memoization
 */
export const getUpcomingDeadlines = cache(
  async (role: string, daysAhead: number = 30) => {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "get_upcoming_deadlines_for_role",
      {
        role_name: role,
        days_ahead: daysAhead,
      }
    );

    if (error) {
      console.error("Error fetching upcoming deadlines:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get recent notifications for a user
 * Wrapped with React.cache() for request memoization
 */
export const getUserNotifications = cache(
  async (userId: string, limit: number = 10) => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("notification")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  }
);

/**
 * Get registration status for the active semester
 * Wrapped with React.cache() for request memoization
 */
export const getRegistrationStatus = cache(
  async (): Promise<RegistrationStatus> => {
    const supabase = await createClient();

    // 1. Get the active academic term (draft or released)
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("code, name, status")
      .in("status", ["draft", "released"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!activeTerm) {
      return {
        is_open: false,
        semester: null,
        message: "No active semester found.",
      };
    }

    // 2. Check for a registration event in the timeline for this term
    const { data: registrationEvent } = await supabase
      .from("semester_timeline")
      .select("start_date, end_date, status")
      .eq("term_code", activeTerm.code)
      .eq("event_type", "registration")
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    if (registrationEvent) {
      const now = new Date();
      const startDate = new Date(registrationEvent.start_date);
      const endDate = new Date(registrationEvent.end_date);

      // Registration is open if:
      // 1. Current time is within the event window
      // 2. Event is not cancelled
      const isOpen =
        now >= startDate &&
        now <= endDate &&
        registrationEvent.status !== "cancelled";

      return {
        is_open: isOpen,
        semester: {
          code: activeTerm.code,
          name: activeTerm.name,
        },
        message: isOpen
          ? "Registration is currently open"
          : "Registration is closed. Check the timeline for registration dates.",
      };
    }

    // Default if no registration event found
    return {
      is_open: false,
      semester: {
        code: activeTerm.code,
        name: activeTerm.name,
      },
      message:
        "Registration is closed. Check the timeline for registration dates.",
    };
  }
);
