"use client";
import React from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Courses Editor"
        description="Manage SWE department courses and view external department course offerings"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This editor manages SWE department courses
              only. External department courses (MATH, PHY, CSC, etc.) are shown
              for reference but cannot be edited from this interface.
            </p>
          </div>

          <committee.scheduler.coursesEditor.CoursesEditor />
        </div>
      </PageContainer>
    </>
  );
}
