"use client";
import React from "react";
import * as committee from "@/components/committee";
import type { IrregularStudentRecord } from "@/components/committee/registrar/IrregularStudentFormList";

import { mockSWEIrregularStudents } from "@/data/mockData";

export default function Page(): React.ReactElement {
  const handleCreateIrregularStudent = (
    studentData: Omit<IrregularStudentRecord, "">
  ) => {
    console.log("Creating irregular student:", studentData);
    // TODO: Send to API endpoint POST /api/irregular
  };

  const handleUpdateIrregularStudent = (
    id: string,
    studentData: Omit<IrregularStudentRecord, "">
  ) => {
    console.log("Updating irregular student:", id, studentData);
    // TODO: Send to API endpoint PATCH /api/irregular/:id
  };

  const handleDeleteIrregularStudent = (id: string) => {
    console.log("Deleting irregular student:", id);
    // TODO: Send to API endpoint DELETE /api/irregular/:id
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Registrar Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of registrar components
        </p>
      </div>

      {/* New component showing irregular student management */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Irregular Student Management</h2>
        <committee.registrar.IrregularStudentFormList
          irregularStudents={mockSWEIrregularStudents}
          onCreate={handleCreateIrregularStudent}
          onUpdate={handleUpdateIrregularStudent}
          onDelete={handleDeleteIrregularStudent}
        />
      </div>
    </div>
  );
}
