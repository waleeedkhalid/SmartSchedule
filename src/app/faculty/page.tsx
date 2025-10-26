/**
 * Faculty Dashboard Page (Unified & Optimized)
 * 
 * Performance Optimizations:
 * - Server-side data fetching with React.cache()
 * - Parallel queries with Promise.all()
 * - Select only required columns
 * - Pass data as props (no client-side useEffect)
 * - Single unified dashboard (no separate /dashboard route)
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import FacultyDashboardClient from "./FacultyDashboardClient";

// ✅ OPTIMIZED: Cached server-side data fetching
const getFacultyStatus = cache(async (userId: string) => {
  const supabase = await createServerClient();

  // Parallel queries for better performance
  const [
    { data: activeTerm },
    { data: sections },
    { data: faculty }
  ] = await Promise.all([
    supabase
      .from("academic_term")
      .select("term_code, name, type, is_schedule_published, is_faculty_feedback_visible, is_active")
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("section")
      .select("section_id")
      .eq("instructor_id", userId),
    supabase
      .from("faculty")
      .select("faculty_id, title, status")
      .eq("id", userId)
      .maybeSingle()
  ]);

  return {
    activeTerm: activeTerm?.term_code || null,
    termName: activeTerm?.name || null,
    termType: activeTerm?.type || null,
    assignedCoursesCount: sections?.length || 0,
    schedulePublished: activeTerm?.is_schedule_published || false,
    feedbackOpen: activeTerm?.is_faculty_feedback_visible || false,
    canViewFeedback: activeTerm?.is_faculty_feedback_visible || false,
    hasPendingSuggestions: false,
    facultyInfo: {
      facultyId: faculty?.faculty_id || "Pending",
      title: faculty?.title || "Faculty",
      status: faculty?.status || "active",
    },
  };
});

export default async function FacultyDashboardPage() {
  // Use cached auth functions
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  const supabase = await createServerClient();
  const { data: faculty } = await supabase
    .from("faculty")
    .select("faculty_id, title, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!faculty) {
    redirect("/faculty/setup");
  }

  // ✅ OPTIMIZED: Fetch status server-side
  const facultyStatus = await getFacultyStatus(user.id);

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";
  const title = faculty.title ?? "Faculty";
  const facultyId = faculty.faculty_id ?? "Pending";
  const status = faculty.status ?? "active";

  return (
    <FacultyDashboardClient
      fullName={fullName}
      email={email}
      facultyId={facultyId}
      title={title}
      status={status}
      facultyStatus={facultyStatus}
    />
  );
}
