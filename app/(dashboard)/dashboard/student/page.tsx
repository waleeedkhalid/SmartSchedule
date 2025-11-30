/**
 * Student Dashboard Page
 *
 * Purpose: Unified student portal with all key features
 *
 * Features:
 * - Overview: Quick stats and notifications
 * - Registration: Elective section enrollment with constraint validation
 * - Schedule: Weekly class schedule (required + electives)
 * - Exams: Exam timetable with conflict detection
 * - Feedback: Comment and feedback system
 *
 * Student Model:
 * - Auto-enrolled in all required courses for their level
 * - Manually register for elective sections (this page)
 * - Subject to 20-credit limit and capacity constraints
 *
 * Architecture:
 * - Server Component: Fetches data from database
 * - Client Component: Handles tabbed interface and interactivity
 * - Follows Next.js 15 Server/Client Component best practices
 */

import {
  getStudentCreditStats,
  getStudentEnrollments,
  getStudentExams,
  getStudentLevel,
  getStudentNumber,
  getUpcomingDeadlines,
  getUserNotifications,
  getRegistrationStatus,
} from "@/lib/db/student-data";
import { redirect } from "next/navigation";
import {
  getServerUser,
  getDashboardPath,
  validateOnboardingAndProfile,
} from "@/lib/server-auth";
import { StudentDashboardTabs } from "@/components/student-dashboard-tabs";
import { CopyableStudentNumber } from "@/components/copyable-student-number";

export default async function StudentDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== "student") {
    // If role is missing, user needs onboarding
    if (!user.role) {
      redirect("/onboarding");
    }
    // Otherwise redirect to their correct dashboard
    const correctDashboard = getDashboardPath(user.role);
    redirect(correctDashboard);
  }

  // Validate onboarding and profile status
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(
    user.id,
    user.role
  );

  if (needsOnboarding || !profileExists) {
    redirect("/onboarding");
  }

  // Fetch dashboard stats from database (including student level, student number, timeline, and notifications)
  const [
    creditStats,
    enrollments,
    exams,
    studentLevel,
    studentNumber,
    deadlines,
    notifications,
    registrationStatus,
  ] = await Promise.all([
    getStudentCreditStats(user.id),
    getStudentEnrollments(user.id),
    getStudentExams(user.id),
    getStudentLevel(user.id),
    getStudentNumber(user.id),
    getUpcomingDeadlines("student", 30),
    getUserNotifications(user.id, 10),
    getRegistrationStatus(),
  ]);

  const totalEnrollments = enrollments.length;
  const upcomingExams = exams.filter((e) => {
    const examDate = new Date(`${e.date}T${e.start}`);
    return examDate > new Date();
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header - Server Component */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your schedule, register for courses, and track your exams
        </p>
        <div className="flex items-center gap-4 mt-2">
          {studentNumber && (
            <CopyableStudentNumber studentNumber={studentNumber} />
          )}
        </div>
      </div>

      {/* Main Tabbed Interface - Client Component with server-fetched data */}
      <StudentDashboardTabs
        userId={user.id}
        studentLevel={studentLevel}
        creditStats={creditStats}
        totalEnrollments={totalEnrollments}
        upcomingExams={upcomingExams}
        totalExams={exams.length}
        initialDeadlines={deadlines}
        initialNotifications={notifications}
        isRegistrationOpen={registrationStatus.is_open}
      />
    </div>
  );
}
