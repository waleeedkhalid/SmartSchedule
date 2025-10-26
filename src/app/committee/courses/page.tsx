/**
 * Course Management Page
 * Server Component with optimized data fetching
 * Follows best practices from data-fetching.mdc and caching-performance.mdc
 * 
 * ✅ EXTRACTED from scheduler - Now independent feature
 */

import { redirect } from "next/navigation";
import {
  getAuthenticatedUser,
  getUserProfile,
  getCommitteeMembership,
} from "@/lib/auth/cached-auth";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import {
  getActiveTerm,
  getCoursesWithSections,
} from "@/lib/queries/scheduler";
import { CourseManagementServer } from "@/components/committee/courses/CourseManagementServer";

const COMMITTEE_TYPE = "scheduling_committee" as const;

export default async function CourseManagementPage() {
  // ✅ OPTIMIZED: Use cached auth functions
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const role = profile?.role;

  if (role !== COMMITTEE_TYPE) {
    redirect(redirectByRole(role));
  }

  // ✅ OPTIMIZED: Use cached committee membership check
  const membership = await getCommitteeMembership(user.id);
  if (!membership) {
    redirect("/committee/scheduler/setup");
  }

  // ✅ OPTIMIZED: Use cached term fetching
  const activeTerm = await getActiveTerm();

  if (!activeTerm) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <h2 className="text-lg font-semibold text-destructive">
            No Active Term
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please contact an administrator to set up an active academic term.
          </p>
        </div>
      </div>
    );
  }

  // ✅ OPTIMIZED: Parallel data fetching with Promise.all
  const [sweCoursesData, externalCoursesData] = await Promise.all([
    getCoursesWithSections(activeTerm.code, { isSweManaged: true }),
    getCoursesWithSections(activeTerm.code, { isSweManaged: false }),
  ]);

  const displayName = profile?.full_name ?? "Committee member";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Manage courses, sections, and course offerings for {activeTerm.name}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Signed in as {displayName}
        </p>
      </div>

      <CourseManagementServer
        termCode={activeTerm.code}
        termName={activeTerm.name}
        initialSweCourses={sweCoursesData}
        initialExternalCourses={externalCoursesData}
      />
    </div>
  );
}

