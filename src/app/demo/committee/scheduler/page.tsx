"use client";
import React, { useState } from "react";
import * as committee from "@/components/committee";
import { SectionEnrollmentManager } from "@/components/committee/scheduler";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";
import {
  getAllStudentCounts,
  updateStudentCount,
  addStudentCount,
  deleteStudentCount,
  type StudentCount,
} from "@/lib/local-state";

// Removed unused mockVersions and exam-related handlers for simplified demo focusing on student counts & enrollment overrides

export default function Page(): React.ReactElement {
  // Courses state removed (unused in trimmed demo)
  const [studentCounts, setStudentCounts] = useState(getAllStudentCounts());

  // Refresh data when state changes
  const refreshData = () => {
    setStudentCounts(getAllStudentCounts());
  };

  // Student Count Handlers
  const handleStudentCountCreate = (data: StudentCount) => {
    try {
      addStudentCount(data);
      refreshData();
      console.log("✅ Student count created successfully");
    } catch (error) {
      console.error("❌ Failed to create student count:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create student count"
      );
    }
  };

  const handleStudentCountUpdate = (
    code: string,
    data: Partial<StudentCount>
  ) => {
    const success = updateStudentCount(code, data);
    if (success) {
      refreshData();
      console.log("✅ Student count updated successfully");
    } else {
      console.error("❌ Failed to update student count - course not found");
    }
  };

  const handleStudentCountDelete = (code: string) => {
    const success = deleteStudentCount(code);
    if (success) {
      refreshData();
      console.log("✅ Student count deleted successfully");
    } else {
      console.error("❌ Failed to delete student count - course not found");
    }
  };

  // Exam manipulation removed in this trimmed demo context

  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Students Counts Viewer"
        description="View and manage student counts for each course"
      >
        <div className="space-y-8">
          {/* Student Counts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Student Counts</h2>
            <committee.scheduler.studentCounts.StudentCountsTable
              studentCounts={studentCounts}
              onCreate={handleStudentCountCreate}
              onUpdate={handleStudentCountUpdate}
              onDelete={handleStudentCountDelete}
            />
          </div>
          <SectionEnrollmentManager />
        </div>
      </PageContainer>
    </>
  );
}
