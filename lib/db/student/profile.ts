/**
 * Student Profile Operations
 *
 * Functions for fetching student profile data (level, number)
 * Wrapped with React.cache() for request memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";

/**
 * Get student level from student_profile table
 * Wrapped with React.cache() for request memoization
 */
export const getStudentLevel = cache(
  async (studentId: string): Promise<number | null> => {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("student_profile")
      .select("level")
      .eq("user_id", studentId)
      .single();

    if (error) {
      // PGRST116 is "not found" - expected for students without profile yet
      if (error.code !== "PGRST116") {
        console.warn("Error fetching student level:", error);
      }
      return null;
    }

    return profile?.level ?? null;
  }
);

/**
 * Get student number from student_profile table
 * Wrapped with React.cache() for request memoization
 */
export const getStudentNumber = cache(
  async (studentId: string): Promise<string | null> => {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("student_profile")
      .select("student_number")
      .eq("user_id", studentId)
      .single();

    if (error) {
      // PGRST116 is "not found" - expected for students without profile yet
      if (error.code !== "PGRST116") {
        console.warn("Error fetching student number:", error);
      }
      return null;
    }

    return profile?.student_number ?? null;
  }
);
