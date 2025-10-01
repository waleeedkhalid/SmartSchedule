"use client";
import React from "react";
import * as committee from "@/components/committee";
import { PersonaNavigation, PageContainer, registrarNavItems } from "@/components/shared";
import { mockSWEStudentCounts } from "@/data/mockData";

export default function Page(): React.ReactElement {
  const handleUpdateCount = (sectionId: string, count: number) => {
    console.log("Updating student count:", sectionId, count);
    // TODO: Send to API endpoint PATCH /api/student-counts/:id
  };

  return (
    <>
      <PersonaNavigation 
        personaName="Registrar Dashboard" 
        navItems={registrarNavItems}
      />
      
      <PageContainer
        title="Student Enrollment Counts"
        description="View and update expected student counts per section"
      >
        <committee.registrar.StudentCountsTable
          studentCounts={mockSWEStudentCounts}
          onUpdate={handleUpdateCount}
        />
      </PageContainer>
    </>
  );
}
