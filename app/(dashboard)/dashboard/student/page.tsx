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
 *
 * Performance Optimizations:
 * - Single optimized data fetch function
 * - Parallel queries with shared Supabase client
 * - Minimal data selection for initial render
 * - React.cache() for request-level memoization
 */

import { getStudentDashboardData } from "@/lib/db/student/dashboard-data";
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

  // Fetch all dashboard data in a single optimized call
  const dashboardData = await getStudentDashboardData(user.id);

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
          {dashboardData.studentNumber && (
            <CopyableStudentNumber
              studentNumber={dashboardData.studentNumber}
            />
          )}
        </div>
      </div>

      {/* Main Tabbed Interface - Client Component with server-fetched data */}
      <StudentDashboardTabs
        userId={user.id}
        studentLevel={dashboardData.studentLevel}
        creditStats={dashboardData.creditStats}
        totalEnrollments={dashboardData.enrollmentCount}
        upcomingExams={dashboardData.upcomingExamsCount}
        totalExams={dashboardData.totalExamsCount}
        initialDeadlines={dashboardData.deadlines}
        initialNotifications={dashboardData.notifications}
        isRegistrationOpen={dashboardData.registrationStatus.is_open}
      />
    </div>
  );
}
