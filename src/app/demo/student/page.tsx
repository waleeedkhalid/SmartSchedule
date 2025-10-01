"use client";
import React from "react";
import * as student from "@/components/student";
import {
  PersonaNavigation,
  PageContainer,
  studentNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Student Portal"
        navItems={studentNavItems}
      />

      <PageContainer
        title="My Schedule"
        description="View your course schedule and exam dates"
      >
        <div className="space-y-8">
          <student.schedule.StudentScheduleGrid />
        </div>
      </PageContainer>
    </>
  );
}
