"use client";
import React from "react";
import * as faculty from "@/components/faculty";

export default function Page(): React.ReactElement {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Faculty Demo</h1>
        <p className="text-sm text-muted-foreground">Preview of faculty persona components</p>
      </div>

      <faculty.availability.FacultyAvailabilityForm />

      <faculty.personalSchedule.PersonalSchedule />
    </div>
  );
}


