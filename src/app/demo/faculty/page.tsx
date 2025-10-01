"use client";
import React from "react";
import * as faculty from "@/components/faculty";
import {
  PersonaNavigation,
  PageContainer,
  facultyNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Faculty Portal"
        navItems={facultyNavItems}
      />

      <PageContainer
        title="My Teaching Assignments"
        description="View your course assignments and schedule"
      >
        <div className="space-y-8">
          <faculty.personalSchedule.PersonalSchedule />

          <faculty.availability.FacultyAvailabilityForm />
        </div>
      </PageContainer>
    </>
  );
}
