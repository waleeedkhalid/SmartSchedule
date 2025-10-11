"use client";
import React from "react";
import * as committee from "@/components/committee";
import type { IrregularStudent } from "@/lib/types";
import {
  PersonaNavigation,
  PageContainer,
  registrarNavItems,
} from "@/components/shared";

import { mockSWEIrregularStudents } from "@/data/demo-data";

export default function Page(): React.ReactElement {
  const handleCreateIrregularStudent = (studentData: IrregularStudent) => {
    console.log("Creating irregular student:", studentData);
    // TODO: Send to API endpoint POST /api/irregular
  };

  const handleUpdateIrregularStudent = (
    id: string,
    studentData: IrregularStudent
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
        title="Registrar Operations"
        description="Manage irregular students, adjust section capacity buffers (5%-15%), and approve enrollment requests"
      >
        <committee.registrar.RegistrarEnrollmentApproval />
        <committee.registrar.IrregularStudentFormList
          irregularStudents={mockSWEIrregularStudents}
          onCreate={handleCreateIrregularStudent}
          onUpdate={handleUpdateIrregularStudent}
          onDelete={handleDeleteIrregularStudent}
        />
        <committee.registrar.RegistrarCapacityManager />
      </PageContainer>
    </>
  );
}
