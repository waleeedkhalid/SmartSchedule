"use client";
import React from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  teachingLoadNavItems,
} from "@/components/shared";

// Teaching Load Committee only manages SWE department courses
const mockInstructorLoads = [
  {
    instructorId: "dr-sarah",
    instructorName: "Dr. Sarah Al-Dossary",
    assignedHours: 12,
    maxHours: 15,
    sections: [
      { sectionId: "SWE211-01", courseCode: "SWE211", hours: 3 },
      { sectionId: "SWE226-01", courseCode: "SWE226", hours: 3 },
      { sectionId: "SWE363-01", courseCode: "SWE363", hours: 3 },
      { sectionId: "SWE211-LAB", courseCode: "SWE211", hours: 3 },
    ],
  },
  {
    instructorId: "prof-omar",
    instructorName: "Prof. Omar Badr",
    assignedHours: 18,
    maxHours: 15, // overloaded
    sections: [
      { sectionId: "SWE312-01", courseCode: "SWE312", hours: 3 },
      { sectionId: "SWE312-02", courseCode: "SWE312", hours: 3 },
      { sectionId: "SWE316-01", courseCode: "SWE316", hours: 3 },
      { sectionId: "SWE314-01", courseCode: "SWE314", hours: 3 },
      { sectionId: "SWE444-01", courseCode: "SWE444", hours: 3 },
      { sectionId: "SWE485-01", courseCode: "SWE485", hours: 3 },
    ],
  },
  {
    instructorId: "dr-ahmad",
    instructorName: "Dr. Ahmad Hassan",
    assignedHours: 9,
    maxHours: 15,
    sections: [
      { sectionId: "SWE418-01", courseCode: "SWE418", hours: 3 },
      { sectionId: "SWE417-01", courseCode: "SWE417", hours: 3 },
      { sectionId: "SWE418-LAB", courseCode: "SWE418", hours: 3 },
    ],
  },
];

// Note: Conflict examples removed (unused) to satisfy lint rules. Add back when conflict display implemented.

export default function Page(): React.ReactElement {
  return (
    <>
      <PersonaNavigation
        personaName="Teaching Load Committee"
        navItems={teachingLoadNavItems}
      />

      <PageContainer
        title="Instructor Load Overview"
        description="Review teaching loads and identify conflicts"
      >
        <div className="space-y-8">
          {/* Instructor Load Overview */}
          <committee.teachingLoad.InstructorLoadTable
            instructorLoads={mockInstructorLoads}
          />

          {/* Conflicts & Original Load Review */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Alternative View</h2>
              <committee.teachingLoad.LoadReviewTable />
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
