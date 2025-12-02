/**
 * Academic Plan Page
 *
 * Displays the student's academic plan showing:
 * - Current student level
 * - All courses organized by level in a grid layout
 * - Required vs Elective courses clearly marked
 *
 * OPTIMIZATION: Fetches data server-side to avoid client-side auth issues
 * and improve performance with proper caching.
 */

import { GraduationCap } from "lucide-react";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { getStudentLevel } from "@/lib/db/student-data";
import {
  getAcademicPlanCourses,
  getStudentCompletedCourses,
} from "@/lib/db/academic-plan";
import { AcademicPlanView } from "@/components/academic-plan-view";

export const dynamic = "force-dynamic";

export default async function AcademicPlanPage() {
  const user = await getServerUser();

  if (!user || user.role !== "student") {
    redirect("/dashboard");
  }

  // Fetch all data in parallel for better performance
  const [studentLevel, completedCourseCodes, courses] = await Promise.all([
    getStudentLevel(user.id).then((level) => level ?? 1),
    getStudentCompletedCourses(user.id),
    getAcademicPlanCourses().catch((error) => {
      console.error("Error fetching academic plan courses:", error);
      return [];
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Academic Plan
        </h1>
        <p className="text-muted-foreground mt-2">
          Your complete course roadmap organized by academic level
        </p>
      </div>

      {/* Academic Plan Grid */}
      <AcademicPlanView
        studentLevel={studentLevel}
        completedCourseCodes={completedCourseCodes}
        initialCourses={courses}
      />
    </div>
  );
}
