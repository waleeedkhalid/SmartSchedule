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
        title="Schedule Feedback"
        description="Provide feedback on your course schedule and exam times"
      >
        <div className="max-w-3xl">
          <student.feedback.FeedbackForm />
        </div>
      </PageContainer>
    </>
  );
}
