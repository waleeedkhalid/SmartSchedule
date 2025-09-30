"use client";
import React from "react";
import * as committee from "@/components/committee";
import { mockStudentCounts } from "@/data/mockData";

export default function Page(): React.ReactElement {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Committee Scheduler Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of scheduling committee components
        </p>
      </div>

      <committee.scheduler.rules.RulesTable />

      <committee.scheduler.studentCounts.StudentCountsTable
        studentCounts={mockStudentCounts}
      />

      <committee.scheduler.externalDepartments.ExternalCoursesEditor />

      <committee.scheduler.irregularStudents.IrregularStudentsViewer />
    </div>
  );
}
