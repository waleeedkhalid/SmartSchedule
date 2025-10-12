// // Demo data for testing and demonstration purposes
// // This replaces the deleted mock data files for demo pages only

// import type { ElectivePackage, CourseOffering, SWEStudent, FacultyAvailability, IrregularStudent } from "@/lib/types";

// // Demo elective packages
// export const mockElectivePackages: ElectivePackage[] = [
//   {
//     id: "ai-ml",
//     label: "Artificial Intelligence & Machine Learning",
//     rangeLabel: "3-6 hours",
//     minHours: 3,
//     maxHours: 6,
//     courses: [
//       {
//         code: "SWE411",
//         name: "Machine Learning",
//         credits: 3,
//       },
//       {
//         code: "SWE412",
//         name: "Deep Learning",
//         credits: 3,
//       },
//     ],
//   },
//   {
//     id: "web-dev",
//     label: "Web Development",
//     rangeLabel: "3-6 hours",
//     minHours: 3,
//     maxHours: 6,
//     courses: [
//       {
//         code: "SWE421",
//         name: "Advanced Web Development",
//         credits: 3,
//       },
//     ],
//   },
// ];

// // Demo course offerings
// export const mockCourseOfferings: CourseOffering[] = [
//   {
//     code: "SWE211",
//     name: "Software Engineering Fundamentals",
//     credits: 3,
//     department: "SWE",
//     level: 4,
//     type: "REQUIRED",
//     prerequisites: [],
//     sections: [],
//     exams: {
//       final: {
//         date: "2025-05-15",
//         time: "16:00",
//         duration: 120,
//       },
//     },
//   },
// ];

// // Demo student counts
// export const mockStudentCounts = [
//   { code: "SWE211", name: "Software Engineering Fundamentals", level: 4, total_students: 45 },
// ];

// // Demo irregular students
// export const mockSWEIrregularStudents: IrregularStudent[] = [
//   {
//     id: "irr-001",
//     name: "John Doe",
//     requiredCourses: ["SWE211", "SWE312"],
//   },
// ];

// // Demo faculty
// export const mockSWEFaculty: FacultyAvailability[] = [
//   {
//     instructorId: "fac-001",
//     instructorName: "Dr. John Smith",
//     department: "SWE",
//     availableSlots: [],
//     maxTeachingHours: 20,
//   },
// ];

// // Demo students
// export const mockSWEStudents: SWEStudent[] = [
//   {
//     id: "stu-001",
//     name: "Alice Johnson",
//     level: 6,
//     electivePreferences: ["SWE411", "SWE412"],
//   },
// ];

// // Demo curriculum
// export const mockSWECurriculum = [
//   {
//     level: 6,
//     requiredSWECourses: ["SWE211", "SWE312"],
//     externalCourses: ["MATH203", "PHY104"],
//     totalCredits: 15,
//     electiveSlots: 2,
//   },
// ];

// // Demo helper functions
// export function getStudentCountForLevel(level: number): number {
//   return mockSWEStudents.filter(s => s.level === level).length;
// }

// export function getElectiveDemandForLevel(level: number): Map<string, number> {
//   const demand = new Map<string, number>();
//   const students = mockSWEStudents.filter(s => s.level === level);

//   students.forEach(student => {
//     student.electivePreferences.forEach(course => {
//       demand.set(course, (demand.get(course) || 0) + 1);
//     });
//   });

//   return demand;
// }

// export function getFacultyStatistics() {
//   return {
//     total: mockSWEFaculty.length,
//     available: mockSWEFaculty.length,
//     professors: 1,
//     associates: 1,
//     assistants: 0,
//     totalCapacity: mockSWEFaculty.length * 20,
//     averageCapacity: 20,
//   };
// }

// export function getAllSWECourses(): string[] {
//   return ["SWE211", "SWE312", "SWE411", "SWE412"];
// }

// export function getTotalSWEStudents(): number {
//   return mockSWEStudents.length;
// }
