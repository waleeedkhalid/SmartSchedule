/**
 * Exam Management Page (Server Component)
 * For scheduling committee to manage exam schedules
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import ExamManagementClient from "./ExamManagementClient";

const getExamData = cache(async (termCode?: string) => {
  const supabase = await createServerClient();

  try {
    // Get active term if not specified
    if (!termCode) {
      const { data: activeTerm } = await supabase
        .from('academic_term')
        .select('code')
        .eq('is_active', true)
        .maybeSingle();

      termCode = activeTerm?.code;
    }

    if (!termCode) {
      return {
        exams: [],
        conflicts: [],
        termCode: null,
        error: 'No active term found',
      };
    }

    // Fetch exams
    const { data: exams } = await supabase
      .from('exam_schedules')
      .select(`
        *,
        course:course_code (
          course_code,
          course_name,
          credits
        )
      `)
      .eq('term_code', termCode)
      .order('exam_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Fetch conflicts
    const { data: conflicts } = await supabase
      .from('exam_conflicts')
      .select(`
        *,
        exam_1:exam_id_1 (
          id,
          course_code,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room_number
        ),
        exam_2:exam_id_2 (
          id,
          course_code,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room_number
        )
      `)
      .eq('resolved', false);

    return {
      exams: exams || [],
      conflicts: conflicts || [],
      termCode,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching exam data:', error);
    return {
      exams: [],
      conflicts: [],
      termCode: null,
      error: 'Failed to load exam data',
    };
  }
});

export default async function ExamManagementPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "scheduling_committee") {
    redirect(redirectByRole(role));
  }

  const examData = await getExamData();

  return (
    <ExamManagementClient
      {...examData}
    />
  );
}

