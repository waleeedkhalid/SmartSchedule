/**
 * Faculty Profile Operations
 *
 * Functions for fetching and updating faculty profile data
 */

import { createClient } from "@/supabase/server";
import type { FacultyProfile, DayAvailability } from "./types";

/**
 * Get faculty profile by user ID
 * Now queries faculty_profile directly (no need to join with instructor table)
 */
export async function getFacultyProfile(
  userId: string
): Promise<FacultyProfile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("faculty_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !profile) {
    if (error?.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected for new users
    }
    return null;
  }

  return {
    id: profile.id,
    name: profile.name || "",
    email: profile.email,
    user_id: profile.user_id,
    max_load_per_week: profile.max_load_per_week,
    preferred_times: profile.preferred_times as DayAvailability[] | null,
    unavailable_times: profile.unavailable_times as DayAvailability[] | null,
    department: profile.department,
  };
}

/**
 * Update faculty availability preferences
 */
export async function updateFacultyAvailability(
  userId: string,
  preferredTimes: DayAvailability[],
  unavailableTimes: DayAvailability[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faculty_profile")
    .update({
      preferred_times: preferredTimes,
      unavailable_times: unavailableTimes,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update faculty max load per week
 */
export async function updateFacultyMaxLoad(
  userId: string,
  maxLoadPerWeek: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faculty_profile")
    .update({
      max_load_per_week: maxLoadPerWeek,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create or update faculty profile with instructor information
 *
 * This function:
 * 1. Creates or updates faculty_profile with name, email, and other instructor data
 * 2. No longer needs to link to a separate instructor table
 *
 * @param userId - The user ID from auth.users
 * @param userName - The user's name from user_roles
 * @param userEmail - The user's email from auth.users
 * @returns The user_id if successful, null otherwise
 * @throws Error with descriptive message if creation/update fails due to RLS or other constraints
 */
export async function linkFacultyProfileToInstructor(
  userId: string,
  userName: string,
  userEmail: string
): Promise<string | null> {
  const supabase = await createClient();

  try {
    // Check if faculty_profile already exists
    const { data: existingProfile, error: findError } = await supabase
      .from("faculty_profile")
      .select("user_id, name, email, max_load_per_week")
      .eq("user_id", userId)
      .maybeSingle();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected for new profiles
      const errorMessage = findError.message || "Unknown error";
      const errorCode = findError.code || "UNKNOWN";

      // Check for RLS violations
      if (findError.code?.startsWith("PGRST")) {
        throw new Error(
          `Permission denied: Unable to search for faculty profile. ` +
            `This may be due to Row Level Security policies. Error: ${errorMessage} (${errorCode})`
        );
      }

      throw new Error(
        `Failed to search for faculty profile: ${errorMessage} (${errorCode})`
      );
    }

    if (existingProfile) {
      // Profile exists - update it with instructor information
      const { error: updateError } = await supabase
        .from("faculty_profile")
        .update({
          name: userName,
          email: userEmail,
          max_load_per_week: existingProfile.max_load_per_week || 12, // Keep existing or default
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        const errorMessage = updateError.message || "Unknown error";
        const errorCode = updateError.code || "UNKNOWN";

        // Check for RLS violations
        if (updateError.code?.startsWith("PGRST")) {
          throw new Error(
            `Permission denied: Unable to update faculty profile. ` +
              `This may be due to Row Level Security policies. ` +
              `Please ensure you have the faculty role. Error: ${errorMessage} (${errorCode})`
          );
        }

        throw new Error(
          `Failed to update faculty profile: ${errorMessage} (${errorCode})`
        );
      }

      return userId;
    } else {
      // Profile doesn't exist - this shouldn't happen during onboarding
      // (profile should be created first), but handle it gracefully
      const { error: createError } = await supabase
        .from("faculty_profile")
        .insert({
          user_id: userId,
          department: "Software Engineering",
          name: userName,
          email: userEmail,
          max_load_per_week: 12,
          preferred_times: [], // Empty array for JSONB
          unavailable_times: [], // Empty array for JSONB
        })
        .select("user_id")
        .single();

      if (createError) {
        const errorMessage = createError.message || "Unknown error";
        const errorCode = createError.code || "UNKNOWN";

        // Check for RLS violations or constraint violations
        if (createError.code?.startsWith("PGRST")) {
          throw new Error(
            `Permission denied: Unable to create faculty profile. ` +
              `This may be due to Row Level Security policies. ` +
              `Please ensure you have the faculty role. Error: ${errorMessage} (${errorCode})`
          );
        }

        // Check for unique constraint violations
        if (createError.code === "23505") {
          throw new Error(
            `Faculty profile with user_id ${userId} or email ${userEmail} already exists. ` +
              `Please contact support if you believe this is an error.`
          );
        }

        throw new Error(
          `Failed to create faculty profile: ${errorMessage} (${errorCode})`
        );
      }

      return userId;
    }
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }

    // Otherwise wrap in Error
    console.error("Unexpected error updating faculty profile:", error);
    throw new Error(
      `Unexpected error updating faculty profile: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
