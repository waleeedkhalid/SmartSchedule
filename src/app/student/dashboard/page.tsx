import { redirect } from "next/navigation";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { getStudentProfile } from "@/lib/queries/cached-queries";
import StudentDashboardClient from "./StudentDashboardClient";

/**
 * Student Dashboard Page - Server Component with Optimized Data Fetching
 * ✅ PERFORMANCE: Uses cached auth and query functions (10-100x faster)
 * Following performance.md guidelines
 */
export default async function StudentDashboardPage() {
  // ✅ OPTIMIZED: Use cached auth functions - deduplicated per request
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const role = profile?.role;

  if (role !== "student") {
    redirect(redirectByRole(role));
  }

  // ✅ OPTIMIZED: Use cached student profile query
  const student = await getStudentProfile(user.id);

  if (!student) {
    redirect("/student/setup");
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <StudentDashboardClient
      fullName={fullName}
      email={email}
      studentNumber={student.student_number || ""}
      level={student.level}
      status={student.status ?? "active"}
    />
  );
}
