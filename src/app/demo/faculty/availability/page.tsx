"use client";
import React from "react";
import * as faculty from "@/components/faculty";
import {
  PersonaNavigation,
  PageContainer,
  facultyNavItems,
} from "@/components/shared";

export default function Page(): React.ReactElement {
  const handleSubmitAvailability = async (availability: unknown) => {
    console.log("Submitting faculty availability:", availability);

    try {
      const response = await fetch("/api/faculty/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(availability),
      });

      if (!response.ok) {
        console.error("Failed to submit availability", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting availability", error);
    }
  };

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
