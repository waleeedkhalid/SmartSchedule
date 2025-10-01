"use client";
import React from "react";
import * as committee from "@/components/committee";
import type { IrregularStudentRecord } from "@/components/committee/registrar/IrregularStudentFormList";
import {
  PersonaNavigation,
  PageContainer,
  registrarNavItems,
} from "@/components/shared";

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
    <>
      <PersonaNavigation
        personaName="Registrar Dashboard"
        navItems={registrarNavItems}
      />

      <PageContainer
        title="Irregular Student Management"
        description="Manage irregular students and their course requirements"
      >
        <committee.registrar.IrregularStudentFormList
          irregularStudents={mockSWEIrregularStudents}
          onCreate={handleCreateIrregularStudent}
          onUpdate={handleUpdateIrregularStudent}
          onDelete={handleDeleteIrregularStudent}
        />
      </PageContainer>
    </>
  );
}
