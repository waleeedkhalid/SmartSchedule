/**
 * Optimized Student Dashboard Data Fetching
 *
 * This module provides a single optimized function to fetch all student dashboard data
 * in parallel with minimal database round-trips.
 *
 * Performance optimizations:
 * 1. Single Supabase client creation
 * 2. Parallel Promise.all for all queries
 * 3. Minimal data selection (only what's needed for initial render)
 * 4. React.cache() for request-level memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import type { CreditStats, RegistrationStatus } from "./types";

export interface StudentDashboardData {
  creditStats: CreditStats;
  enrollmentCount: number;
  upcomingExamsCount: number;
  totalExamsCount: number;
  studentLevel: number | null;
  studentNumber: string | null;
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
  registrationStatus: RegistrationStatus;
}

/**
 * Fetch all student dashboard data in a single optimized call
 * Uses a single Supabase client and parallel queries
 */
export const getStudentDashboardData = cache(
  async (userId: string): Promise<StudentDashboardData> => {
    const supabase = await createClient();

    // Execute all queries in parallel with a single client
    const [
      profileResult,
      enrollmentsResult,
      examsResult,
      deadlinesResult,
      notificationsResult,
      registrationResult,
    ] = await Promise.all([
      // 1. Student profile (level + number) - single query
      supabase
        .from("student_profile")
        .select("level, student_number")
        .eq("user_id", userId)
        .single(),

      // 2. Enrollments with course data for credit stats
      supabase
        .from("student_enrollment")
        .select(
          `
          id,
          section:section!student_enrollment_section_id_fkey(
            course_code,
            course:course!section_course_code_fkey(credits, is_elective)
          )
        `
        )
        .eq("student_id", userId)
        .eq("status", "registered"),

      // 3. Exams for enrolled courses - get course codes first, then exams
      supabase
        .from("student_enrollment")
        .select(
          `
          section:section!student_enrollment_section_id_fkey(course_code)
        `
        )
        .eq("student_id", userId)
        .eq("status", "registered"),

      // 4. Upcoming deadlines
      supabase.rpc("get_upcoming_deadlines_for_role", {
        role_name: "student",
        days_ahead: 30,
      }),

      // 5. Recent notifications (limit to 10)
      supabase
        .from("notification")
        .select("id, user_id, type, payload, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),

      // 6. Registration status - get active term
      supabase
        .from("academic_term")
        .select("code, name, status")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    // Process profile data
    const studentLevel = profileResult.data?.level ?? null;
    const studentNumber = profileResult.data?.student_number ?? null;

    // Process credit stats from enrollments
    let totalCredits = 0;
    let requiredCredits = 0;
    let electiveCredits = 0;
    const enrollmentCount = enrollmentsResult.data?.length || 0;

    if (enrollmentsResult.data) {
      for (const enrollment of enrollmentsResult.data as Array<{
        section?: { course?: { credits?: number; is_elective?: boolean } };
      }>) {
        const course = enrollment.section?.course;
        if (course) {
          const credits = course.credits || 0;
          totalCredits += credits;
          if (course.is_elective) {
            electiveCredits += credits;
          } else {
            requiredCredits += credits;
          }
        }
      }
    }

    // Get exam counts
    let upcomingExamsCount = 0;
    let totalExamsCount = 0;

    if (examsResult.data && examsResult.data.length > 0) {
      // Extract course codes
      const courseCodes = (
        examsResult.data as Array<{ section?: { course_code?: string } }>
      )
        .map((e) => e.section?.course_code)
        .filter((code): code is string => !!code);

      if (courseCodes.length > 0) {
        // Get exam counts
        const { data: exams } = await supabase
          .from("exam")
          .select("id, date, start_time")
          .in("course_code", courseCodes);

        if (exams) {
          totalExamsCount = exams.length;
          upcomingExamsCount = exams.filter((e) => {
            const examDate = new Date(`${e.date}T${e.start_time}`);
            return examDate > new Date();
          }).length;
        }
      }
    }

    // Process registration status
    let registrationStatus: RegistrationStatus = {
      is_open: false,
      semester: null,
      message: "No active semester found.",
    };

    if (registrationResult.data) {
      const activeTerm = registrationResult.data;

      // Check for registration event
      const { data: registrationEvent } = await supabase
        .from("semester_timeline")
        .select("start_date, end_date, status")
        .eq("term_code", activeTerm.code)
        .eq("event_type", "registration")
        .order("start_date", { ascending: false })
        .limit(1)
        .single();

      if (registrationEvent) {
        const nowDate = new Date();
        const startDate = new Date(registrationEvent.start_date);
        const endDate = new Date(registrationEvent.end_date);

        const isOpen =
          nowDate >= startDate &&
          nowDate <= endDate &&
          registrationEvent.status !== "cancelled";

        registrationStatus = {
          is_open: isOpen,
          semester: { code: activeTerm.code, name: activeTerm.name },
          message: isOpen
            ? "Registration is currently open"
            : "Registration is closed. Check the timeline for registration dates.",
        };
      } else {
        registrationStatus = {
          is_open: false,
          semester: { code: activeTerm.code, name: activeTerm.name },
          message:
            "Registration is closed. Check the timeline for registration dates.",
        };
      }
    }

    return {
      creditStats: {
        total: totalCredits,
        required_credits: requiredCredits,
        elective_credits: electiveCredits,
        completed_credits: totalCredits,
      },
      enrollmentCount,
      upcomingExamsCount,
      totalExamsCount,
      studentLevel,
      studentNumber,
      deadlines: deadlinesResult.data || [],
      notifications: notificationsResult.data || [],
      registrationStatus,
    };
  }
);
