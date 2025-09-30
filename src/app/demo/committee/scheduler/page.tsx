"use client";
import React from "react";
import * as committee from "@/components/committee";
import { CommentPanel } from "@/components/shared";
import { mockCourseOfferings, mockStudentCounts } from "@/data/mockData";
import type { ExamRecord } from "@/components/committee/scheduler/ExamTable";
import { getExams, getSectionsLookup } from "@/lib/committee-data-helpers";

const mockVersions = [
  {
    id: "v3",
    version: 3,
    createdAt: "2025-09-30T14:30:00Z",
    author: "Dr. Ahmad",
    description: "Added CSC380 sections",
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
  const handleExamCreate = (examData: Omit<ExamRecord, "id">) => {
    console.log("Creating exam:", examData);
    // TODO: Send to API endpoint POST /api/exams
  };

  const handleExamUpdate = (id: string, examData: Omit<ExamRecord, "id">) => {
    console.log("Updating exam:", id, examData);
    // TODO: Send to API endpoint PATCH /api/exams/:id
  };

  const handleExamDelete = (id: string) => {
    console.log("Deleting exam:", id);
    // TODO: Send to API endpoint DELETE /api/exams/:id
  };

  const handleVersionSelect = (versionId: string) => {
    console.log("Selected version:", versionId);
    // TODO: Load schedule data for selected version
  };

  const handleCommentAdd = (commentBody: string) => {
    console.log("Adding comment:", { body: commentBody, persona: "COMMITTEE" });
    // TODO: Send to API endpoint POST /api/comments
  };

  // Use helper functions to transform mockCourseOfferings
  const mockExams = getExams(mockCourseOfferings);
  const sectionsLookup = getSectionsLookup(mockCourseOfferings);

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Committee Scheduler Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of scheduling committee components
        </p>
      </div>

      {/* Exams Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exam Management</h2>
        <committee.scheduler.ExamTable
          exams={mockExams}
          onCreate={handleExamCreate}
          onUpdate={handleExamUpdate}
          onDelete={handleExamDelete}
          sectionsLookup={sectionsLookup}
        />
      </div>

      {/* Version Timeline */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Version History</h2>
          <committee.scheduler.VersionTimeline
            versions={mockVersions}
            onSelect={handleVersionSelect}
          />
        </div>
      </div>

      {/* Existing components */}
      <committee.scheduler.rules.RulesTable />

      <committee.scheduler.studentCounts.StudentCountsTable
        studentCounts={mockStudentCounts}
      />

      <committee.scheduler.coursesEditor.CoursesEditor />

      <committee.scheduler.irregularStudents.IrregularStudentsViewer />
    </div>
  );
}
