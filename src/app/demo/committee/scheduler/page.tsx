"use client";
import React from "react";
import * as committee from "@/components/committee";
import { CommentPanel } from "@/components/shared";
import { mockStudentCounts } from "@/data/mockData";
import type { ExamRecord } from "@/components/committee/scheduler/ExamTable";

// Mock data for new components
const mockSections = [
  {
    id: "CSC212-01",
    courseCode: "CSC212",
    title: "Data Structures",
    instructor: "Dr. Sarah Al-Dossary",
    room: "42 01",
    meetings: [
      {
        id: "m1",
        sectionId: "CSC212-01",
        day: "Sunday",
        startTime: "10:00",
        endTime: "11:50",
        room: "42 01",
      },
      {
        id: "m2",
        sectionId: "CSC212-01",
        day: "Tuesday",
        startTime: "10:00",
        endTime: "11:50",
        room: "42 01",
      },
    ],
  },
  {
    id: "MATH203-01",
    courseCode: "MATH203",
    title: "Linear Algebra",
    instructor: "Prof. Omar Badr",
    room: "12 05",
    meetings: [
      {
        id: "m3",
        sectionId: "MATH203-01",
        day: "Monday",
        startTime: "08:00",
        endTime: "08:50",
        room: "12 05",
      },
      {
        id: "m4",
        sectionId: "MATH203-01",
        day: "Wednesday",
        startTime: "08:00",
        endTime: "08:50",
        room: "12 05",
      },
      {
        id: "m5",
        sectionId: "MATH203-01",
        day: "Thursday",
        startTime: "08:00",
        endTime: "08:50",
        room: "12 05",
      },
    ],
  },
];

const mockExams = [
  {
    id: "e1",
    courseCode: "CSC212",
    sectionIds: ["CSC212-01", "CSC212-02"],
    category: "midterm" as const,
    date: "2025-03-31",
    time: "10:00",
    duration: 90,
    room: "Main Hall",
  },
  {
    id: "e2",
    courseCode: "MATH203",
    sectionIds: ["MATH203-01"],
    category: "final" as const,
    date: "2025-05-25",
    time: "09:00",
    duration: 120,
    room: "Hall A",
  },
];

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

const mockComments = [
  {
    id: "c1",
    persona: "STUDENT",
    createdAt: "2025-09-30T12:00:00Z",
    author: "Ahmad S.",
    body: "The CSC212 timing conflicts with MATH203 for some students.",
    versionId: "v3",
  },
  {
    id: "c2",
    persona: "FACULTY",
    createdAt: "2025-09-30T13:30:00Z",
    author: "Dr. Sarah",
    body: "Room 42 01 needs projector equipment check before semester starts.",
    versionId: "v3",
  },
];

export default function Page(): React.ReactElement {
  const handleExamCreate = (examData: Omit<ExamRecord, "id">) => {
    console.log("Creating exam:", examData);
    // TODO: Send to API endpoint POST /api/exams
  };

  const handleVersionSelect = (versionId: string) => {
    console.log("Selected version:", versionId);
    // TODO: Load schedule data for selected version
  };

  const handleCommentAdd = (commentBody: string) => {
    console.log("Adding comment:", { body: commentBody, persona: "COMMITTEE" });
    // TODO: Send to API endpoint POST /api/comments
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Committee Scheduler Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of scheduling committee components
        </p>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Schedule Overview</h2>
        <committee.scheduler.ScheduleGrid
          sections={mockSections}
          showConflicts={true}
          conflicts={[]}
        />
      </div>

      {/* Exams Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exam Management</h2>
        <committee.scheduler.ExamTable
          exams={mockExams}
          onCreate={handleExamCreate}
          sectionsLookup={[
            { sectionId: "CSC212-01", courseCode: "CSC212" },
            { sectionId: "CSC212-02", courseCode: "CSC212" },
            { sectionId: "MATH203-01", courseCode: "MATH203" },
          ]}
        />
      </div>

      {/* Version Timeline & Comments side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Version History</h2>
          <committee.scheduler.VersionTimeline
            versions={mockVersions}
            onSelect={handleVersionSelect}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          <CommentPanel
            comments={mockComments}
            persona="COMMITTEE"
            onAdd={handleCommentAdd}
            filterVersionId="v3"
          />
        </div>
      </div>

      {/* Existing components */}
      <committee.scheduler.rules.RulesTable />

      <committee.scheduler.studentCounts.StudentCountsTable
        studentCounts={mockStudentCounts}
      />

      <committee.scheduler.externalDepartments.ExternalCoursesEditor />

      <committee.scheduler.irregularStudents.IrregularStudentsViewer />
    </div>
  );
}
