"use client";
import React from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  teachingLoadNavItems,
} from "@/components/shared";

const mockConflicts = [
  {
    id: "c1",
    type: "OVERLOAD" as const,
    instructorId: "prof-omar",
    instructorName: "Prof. Omar Badr",
    message:
      "Instructor assigned 18 hours, exceeding maximum limit of 15 hours",
    severity: "HIGH" as const,
    affectedSections: [
      "MATH203-01",
      "MATH203-02",
      "MATH311-01",
      "MATH151-01",
      "MATH244-01",
      "GRAD-SEMINAR",
    ],
  },
  {
    id: "c2",
    type: "TIME_OVERLAP" as const,
    instructorId: "dr-sarah",
    instructorName: "Dr. Sarah Al-Dossary",
    message: "CSC212-01 and CSC212-LAB have overlapping time slots on Tuesday",
    severity: "MEDIUM" as const,
    affectedSections: ["CSC212-01", "CSC212-LAB"],
  },
  {
    id: "c3",
    type: "TIME_OVERLAP" as const,
    instructorId: "dr-ahmad",
    instructorName: "Dr. Ahmad Hassan",
    message: "CEN303-01 conflicts with departmental meeting on Wednesday 14:00",
    severity: "LOW" as const,
    affectedSections: ["CEN303-01"],
  },
];

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Teaching Load Committee"
        navItems={teachingLoadNavItems}
      />

      <PageContainer
        title="Teaching Load Conflicts"
        description="Review and resolve instructor load conflicts and time overlaps"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {mockConflicts.length} conflict
                {mockConflicts.length !== 1 ? "s" : ""} detected
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                {mockConflicts.filter((c) => c.severity === "HIGH").length} High
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                {mockConflicts.filter((c) => c.severity === "MEDIUM").length}{" "}
                Medium
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {mockConflicts.filter((c) => c.severity === "LOW").length} Low
              </span>
            </div>
          </div>

          <committee.teachingLoad.ConflictList conflicts={mockConflicts} />
        </div>
      </PageContainer>
    </>
  );
}
