/**
 * Faculty Schedule Feedback Page
 * Allows faculty to provide feedback on their assigned teaching schedule
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import FacultyScheduleFeedbackClient from "./FacultyScheduleFeedbackClient";

const getScheduleFeedbackData = cache(async (userId: string) => {
  const supabase = await createServerClient();

  try {
    // Check if feedback period is open
    const { data: activeTerm } = await supabase
      .from("academic_term")
      .select("is_faculty_feedback_visible, code")
      .eq("is_active", true)
      .maybeSingle();

    if (!activeTerm?.is_faculty_feedback_visible) {
      return {
        locked: true,
        message: "Schedule feedback will be available after the schedule is published.",
        sections: [],
        existingFeedback: [],
      };
    }

    // Fetch faculty sections
    const { data: sections } = await supabase
      .from("section")
      .select(`
        section_id,
        course_code,
        capacity,
        room_number,
        course:course_code (
          course_code,
          course_name,
          credits
        )
      `)
      .eq("instructor_id", userId);

    // Fetch existing feedback
    const { data: existingFeedback } = await supabase
      .from("faculty_feedback")
      .select("*")
      .eq("faculty_id", userId)
      .order("created_at", { ascending: false });

    return {
      locked: false,
      sections: sections || [],
      existingFeedback: existingFeedback || [],
      termCode: activeTerm.code,
    };
  } catch (error) {
    console.error("Error fetching schedule feedback data:", error);
    return {
      locked: true,
      message: "Error loading schedule data",
      sections: [],
      existingFeedback: [],
    };
  }
});

export default async function FacultyScheduleFeedbackPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  const feedbackData = await getScheduleFeedbackData(user.id);

  return (
    <FacultyScheduleFeedbackClient
      {...feedbackData}
    />
  );
}

