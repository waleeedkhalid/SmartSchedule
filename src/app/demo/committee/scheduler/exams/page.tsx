"use client";
import React, { useState } from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";
import {
  ExamRecord,
  getExams,
  getSectionsLookup,
} from "@/lib/committee-data-helpers";
import {
  getAllCourses,
  updateExam,
  deleteExam as deleteExamState,
  createExam,
} from "@/lib/local-state";

export default function Page(): React.ReactElement {
  const [courses, setCourses] = useState(getAllCourses());

  // Refresh data when state changes
  const refreshData = () => {
    setCourses(getAllCourses());
  };

  // Use helper functions to transform current courses state (SWE only)
  const exams = getExams(courses);
  const sectionsLookup = getSectionsLookup(courses);

  const handleCreateExam = (examData: Omit<ExamRecord, "id">) => {
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

  const handleUpdateExam = (id: string, examData: Omit<ExamRecord, "id">) => {
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

  const handleDeleteExam = (id: string) => {
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

  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Exam Scheduling"
        description="Schedule and manage midterm and final exams for all sections"
      >
        <committee.scheduler.ExamTable
          exams={exams}
          sectionsLookup={sectionsLookup}
          onCreate={handleCreateExam}
          onUpdate={handleUpdateExam}
          onDelete={handleDeleteExam}
        />
      </PageContainer>
    </>
  );
}
