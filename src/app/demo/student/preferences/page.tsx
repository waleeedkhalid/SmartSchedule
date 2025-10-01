"use client";
import React from "react";
import * as student from "@/components/student";
import {
  PersonaNavigation,
  PageContainer,
  studentNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  const handleSubmitPreferences = (preferences: unknown) => {
    console.log("Submitting elective preferences:", preferences);
    // TODO: Send to API endpoint POST /api/student/preferences
  };

  return (
    <>
      <PersonaNavigation
        personaName="Student Portal"
        navItems={studentNavItems}
      />

      <PageContainer
        title="Elective Course Preferences"
        description="Rank your preferred elective courses for next semester"
      >
        <div className="max-w-3xl">
          <student.electives.ElectiveSurvey
            onSubmit={handleSubmitPreferences}
          />
        </div>
      </PageContainer>
    </>
  );
}
