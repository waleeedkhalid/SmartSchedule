"use client";
import React, { useState } from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";
import type { ExamRecord } from "@/lib/committee-data-helpers";
import { getExams, getSectionsLookup } from "@/lib/committee-data-helpers";
import {
  getAllCourses,
  updateExam,
  deleteExam as deleteExamState,
  createExam,
  getAllStudentCounts,
  updateStudentCount,
  addStudentCount,
  deleteStudentCount,
  type StudentCount,
} from "@/lib/local-state";

const mockVersions = [
  {
    id: "v3",
    version: 3,
    createdAt: "2025-09-30T14:30:00Z",
    author: "Dr. Ahmad",
    description: "Added sections for SWE courses",
    isActive: true,
    diffSummary: { added: 2, removed: 0, changed: 1 },
  },
  {
    id: "v2",
    version: 2,
    createdAt: "2025-09-30T10:15:00Z",
    author: "Committee",
    description: "Updated room assignments",
    diffSummary: { added: 0, removed: 1, changed: 5 },
  },
  {
    id: "v1",
    version: 1,
    createdAt: "2025-09-29T16:00:00Z",
    author: "System",
    description: "Initial schedule generation",
    diffSummary: { added: 15, removed: 0, changed: 0 },
  },
];

export default function Page(): React.ReactElement {
  const [courses, setCourses] = useState(getAllCourses());
  const [studentCounts, setStudentCounts] = useState(getAllStudentCounts());

  // Refresh data when state changes
  const refreshData = () => {
    setCourses(getAllCourses());
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

  const handleExamCreate = (examData: Omit<ExamRecord, "id">) => {
    console.log("Creating exam:", examData);

    const success = createExam(examData.courseCode, examData.type, {
      date: examData.date,
      time: examData.time,
      duration: examData.duration,
    });

    if (success) {
      refreshData();
      console.log("✅ Exam created successfully");
    } else {
      console.error("❌ Failed to create exam - course not found");
    }
  };

  const handleExamUpdate = (id: string, examData: Omit<ExamRecord, "id">) => {
    console.log("Updating exam:", id, examData);

    const success = updateExam(examData.courseCode, examData.type, {
      date: examData.date,
      time: examData.time,
      duration: examData.duration,
    });

    if (success) {
      refreshData();
      console.log("✅ Exam updated successfully");
    } else {
      console.error("❌ Failed to update exam - course not found");
    }
  };

  const handleExamDelete = (id: string) => {
    console.log("Deleting exam:", id);

    // Parse exam ID (format: "COURSE-TYPE" e.g., "SWE211-midterm")
    const [courseCode, examType] = id.split("-");

    if (courseCode && examType) {
      const success = deleteExamState(
        courseCode,
        examType as "midterm" | "midterm2" | "final"
      );

      if (success) {
        refreshData();
        console.log("✅ Exam deleted successfully");
      } else {
        console.error("❌ Failed to delete exam");
      }
    }
  };

  const handleVersionSelect = (versionId: string) => {
    console.log("Selected version:", versionId);
    // TODO: Load schedule data for selected version
  };

  // Use helper functions to transform current courses state
  const mockExams = getExams(courses);
  const sectionsLookup = getSectionsLookup(courses);

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
        </div>
      </PageContainer>
    </>
  );
}
