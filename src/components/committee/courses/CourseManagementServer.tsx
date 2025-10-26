/**
 * CourseManagementServer
 * Server Component wrapper that passes data to Client Component
 * Implements Server/Client Component split pattern from data-fetching.mdc
 * 
 * ✅ EXTRACTED from scheduler - Now in courses feature
 */

import { CourseManagementClient } from "./CourseManagementClient";
import type { CourseWithSections } from "@/types/scheduler";

interface CourseManagementServerProps {
  termCode: string;
  termName: string;
  initialSweCourses: CourseWithSections[];
  initialExternalCourses: CourseWithSections[];
}

export function CourseManagementServer({
  termCode,
  termName,
  initialSweCourses,
  initialExternalCourses,
}: CourseManagementServerProps) {
  return (
    <CourseManagementClient
      termCode={termCode}
      termName={termName}
      initialSweCourses={initialSweCourses}
      initialExternalCourses={initialExternalCourses}
    />
  );
}

