"use client";
import React from "react";
import * as committee from "@/components/committee";
import type { IrregularStudentRecord } from "@/components/committee/registrar/IrregularStudentFormList";

const mockIrregularStudents = [
  {
    id: "ir1",
    studentId: "2020001234",
    studentName: "Ahmad Khalil",
    courseCode: "CSC212",
    semester: "Fall",
    year: 2025,
    reason: "Repeat - Failed previous attempt",
    advisorId: "dr-sarah-id",
    advisorName: "Dr. Sarah Al-Dossary",
    notes: "Student struggled with algorithms section. Needs extra support.",
  },
  {
    id: "ir2",
    studentId: "2021005678",
    studentName: "Fatima Al-Zahra",
    courseCode: "MATH203",
    semester: "Fall",
    year: 2025,
    reason: "Make-up - Medical leave during Spring 2025",
    advisorId: "prof-omar-id",
    advisorName: "Prof. Omar Badr",
    notes: "Medical documentation on file. Good academic standing otherwise.",
  },
  {
    id: "ir3",
    studentId: "2019009876",
    studentName: "Mohammed Ali",
    courseCode: "CSC380",
    semester: "Fall",
    year: 2025,
    reason: "Transfer Credit - Equivalent course from previous university",
    advisorId: "dr-ahmad-id",
    advisorName: "Dr. Ahmad Hassan",
    notes: "Course content review completed. Approved for enrollment.",
  },
];

export default function Page(): React.ReactElement {
  const handleCreateIrregularStudent = (
    studentData: Omit<IrregularStudentRecord, "id">
  ) => {
    console.log("Creating irregular student:", studentData);
    // TODO: Send to API endpoint POST /api/irregular
  };

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Registrar Demo</h1>
        <p className="text-sm text-muted-foreground">
          Preview of registrar components
        </p>
      </div>

      {/* New component showing irregular student management */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Irregular Student Management</h2>
        <committee.registrar.IrregularStudentFormList
          irregularStudents={mockIrregularStudents}
          onCreate={handleCreateIrregularStudent}
        />
      </div>

      {/* Original component */}
      <committee.registrar.RegistrarIrregularForm />
    </div>
  );
}
