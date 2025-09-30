"use client";
import React from "react";
import * as committee from "@/components/committee";

const mockInstructorLoads = [
  {
    instructorId: "dr-sarah",
    instructorName: "Dr. Sarah Al-Dossary",
    assignedHours: 12,
    maxHours: 15,
    sections: [
      { sectionId: "CSC212-01", courseCode: "CSC212", hours: 4 },
      { sectionId: "CSC380-01", courseCode: "CSC380", hours: 3 },
      { sectionId: "CSC484-01", courseCode: "CSC484", hours: 3 },
      { sectionId: "CSC212-LAB", courseCode: "CSC212", hours: 2 },
    ],
  },
  {
    instructorId: "prof-omar",
    instructorName: "Prof. Omar Badr",
    assignedHours: 18,
    maxHours: 15, // overloaded
    sections: [
      { sectionId: "MATH203-01", courseCode: "MATH203", hours: 3 },
      { sectionId: "MATH203-02", courseCode: "MATH203", hours: 3 },
      { sectionId: "MATH311-01", courseCode: "MATH311", hours: 3 },
      { sectionId: "MATH151-01", courseCode: "MATH151", hours: 3 },
      { sectionId: "MATH244-01", courseCode: "MATH244", hours: 3 },
      { sectionId: "GRAD-SEMINAR", courseCode: "GRAD598", hours: 3 },
    ],
  },
  {
    instructorId: "dr-ahmad",
    instructorName: "Dr. Ahmad Hassan",
    assignedHours: 9,
    maxHours: 15,
    sections: [
      { sectionId: "CEN303-01", courseCode: "CEN303", hours: 3 },
      { sectionId: "CEN415-01", courseCode: "CEN415", hours: 3 },
      { sectionId: "CEN303-LAB", courseCode: "CEN303", hours: 3 },
    ],
  },
];

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
];

export default function Page(): React.ReactElement {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Teaching Load Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of teaching load review components
        </p>
      </div>

      {/* Instructor Load Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Instructor Load Overview</h2>
        <committee.teachingLoad.InstructorLoadTable
          instructorLoads={mockInstructorLoads}
        />
      </div>

      {/* Conflicts & Comments side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Load Conflicts</h2>
          <committee.teachingLoad.ConflictList conflicts={mockConflicts} />
        </div>
      </div>

      {/* Original component */}
      <committee.teachingLoad.LoadReviewTable />
    </div>
  );
}
