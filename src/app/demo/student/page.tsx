"use client";
import React from "react";
import * as student from "@/components/student";

export default function Page(): React.ReactElement {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Student Demo</h1>
        <p className="text-sm text-muted-foreground">Preview of student persona components</p>
      </div>

      <student.schedule.StudentScheduleGrid />

      <student.electives.ElectiveSurvey />

      <student.feedback.FeedbackForm />
    </div>
  );
}


