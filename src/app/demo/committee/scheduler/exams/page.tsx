"use client";
import React from "react";
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
import { mockCourseOfferings } from "@/data/mockData";

export default function Page(): React.ReactElement {
  const exams = getExams(mockCourseOfferings);
  const sectionsLookup = getSectionsLookup(mockCourseOfferings);

  const handleCreateExam = (examData: Omit<ExamRecord, "id">) => {
    console.log("Creating exam:", examData);
    // TODO: Send to API endpoint POST /api/exams
  };

  const handleUpdateExam = (id: string, examData: Omit<ExamRecord, "id">) => {
    console.log("Updating exam:", id, examData);
    // TODO: Send to API endpoint PATCH /api/exams/:id
  };

  const handleDeleteExam = (id: string) => {
    console.log("Deleting exam:", id);
    // TODO: Send to API endpoint DELETE /api/exams/:id
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
