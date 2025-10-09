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
        title="Weekly Availability"
        description="Set your preferred and unavailable time slots for teaching"
      >
        <div className="max-w-4xl">
          <faculty.availability.FacultyAvailability />
        </div>
      </PageContainer>
    </>
  );
}
