// // Local state management for exams and courses
// // This provides in-memory state for demo/testing purposes

// import type { CourseOffering, Section } from "./types";

// // Initialize with empty arrays (live data should come from Supabase)
// let coursesState: CourseOffering[] = [];

// // Student counts state
// export type StudentCount = {
//   code: string;
//   name: string;
//   level: number;
//   total_students: number;
// };

// let studentCountsState: StudentCount[] = [];

// // ============================================================================
// // COURSES STATE MANAGEMENT
// // ============================================================================

// export function getAllCourses(): CourseOffering[] {
//   return coursesState;
// }

// export function getCourseByCode(code: string): CourseOffering | undefined {
//   return coursesState.find((c) => c.code === code);
// }

// export function updateCourse(
//   code: string,
//   updates: Partial<CourseOffering>
// ): CourseOffering | null {
//   const index = coursesState.findIndex((c) => c.code === code);
//   if (index === -1) return null;

//   coursesState[index] = { ...coursesState[index], ...updates };
//   console.log("Updated course:", coursesState[index]);
//   return coursesState[index];
// }

// export function addCourse(course: CourseOffering): CourseOffering {
//   const exists = coursesState.find((c) => c.code === course.code);
//   if (exists) {
//     throw new Error(`Course ${course.code} already exists`);
//   }

//   coursesState.push(course);
//   console.log("Added course:", course);
//   return course;
// }

// export function deleteCourse(code: string): boolean {
//   const index = coursesState.findIndex((c) => c.code === code);
//   if (index === -1) return false;

//   const deleted = coursesState.splice(index, 1);
//   console.log("Deleted course:", deleted[0]);
//   return true;
// }

// // ============================================================================
// // EXAM STATE MANAGEMENT
// // ============================================================================

// import type { ExamUpdate } from "./types";

// export function updateExam(
//   courseCode: string,
//   examType: "midterm" | "midterm2" | "final",
//   examData: ExamUpdate
// ): boolean {
//   const course = getCourseByCode(courseCode);
//   if (!course) return false;

//   if (!course.exams[examType]) {
//     course.exams[examType] = {
//       date: examData.date || "",
//       time: examData.time || "",
//       duration: examData.duration || 90,
//     };
//   } else {
//     course.exams[examType] = {
//       ...course.exams[examType]!,
//       ...examData,
//     };
//   }

//   console.log(
//     `Updated ${examType} exam for ${courseCode}:`,
//     course.exams[examType]
//   );
//   return true;
// }

// export function deleteExam(
//   courseCode: string,
//   examType: "midterm" | "midterm2" | "final"
// ): boolean {
//   const course = getCourseByCode(courseCode);
//   if (!course) return false;

//   if (course.exams[examType]) {
//     delete course.exams[examType];
//     console.log(`Deleted ${examType} exam for ${courseCode}`);
//     return true;
//   }

//   return false;
// }

// export function createExam(
//   courseCode: string,
//   examType: "midterm" | "midterm2" | "final",
//   examData: { date: string; time: string; duration: number }
// ): boolean {
//   const course = getCourseByCode(courseCode);
//   if (!course) return false;

//   course.exams[examType] = examData;
//   console.log(`Created ${examType} exam for ${courseCode}:`, examData);
//   return true;
// }

// // ============================================================================
// // SECTION STATE MANAGEMENT
// // ============================================================================

// export function addSection(
//   courseCode: string,
//   section: Section
// ): Section | null {
//   const course = getCourseByCode(courseCode);
//   if (!course) return null;

//   const exists = course.sections.find((s) => s.id === section.id);
//   if (exists) {
//     throw new Error(`Section ${section.id} already exists`);
//   }

//   course.sections.push(section);
//   console.log("Added section:", section);
//   return section;
// }

// export function updateSection(
//   courseCode: string,
//   sectionId: string,
//   updates: Partial<Section>
// ): Section | null {
//   const course = getCourseByCode(courseCode);
//   if (!course) return null;

//   const index = course.sections.findIndex((s) => s.id === sectionId);
//   if (index === -1) return null;

//   course.sections[index] = { ...course.sections[index], ...updates };
//   console.log("Updated section:", course.sections[index]);
//   return course.sections[index];
// }

// export function deleteSection(courseCode: string, sectionId: string): boolean {
//   const course = getCourseByCode(courseCode);
//   if (!course) return false;

//   const index = course.sections.findIndex((s) => s.id === sectionId);
//   if (index === -1) return false;

//   const deleted = course.sections.splice(index, 1);
//   console.log("Deleted section:", deleted[0]);
//   return true;
// }

// // ============================================================================
// // STUDENT COUNTS STATE MANAGEMENT
// // ============================================================================

// export function getAllStudentCounts(): StudentCount[] {
//   return studentCountsState;
// }

// export function getStudentCountByCode(code: string): StudentCount | undefined {
//   return studentCountsState.find((sc) => sc.code === code);
// }

// export function updateStudentCount(
//   code: string,
//   updates: Partial<StudentCount>
// ): StudentCount | null {
//   const index = studentCountsState.findIndex((sc) => sc.code === code);
//   if (index === -1) return null;

//   studentCountsState[index] = { ...studentCountsState[index], ...updates };
//   console.log("✅ Updated student count:", studentCountsState[index]);
//   return studentCountsState[index];
// }

// export function addStudentCount(studentCount: StudentCount): StudentCount {
//   const exists = studentCountsState.find((sc) => sc.code === studentCount.code);
//   if (exists) {
//     throw new Error(`Student count for ${studentCount.code} already exists`);
//   }

//   studentCountsState.push(studentCount);
//   console.log("✅ Added student count:", studentCount);
//   return studentCount;
// }

// export function deleteStudentCount(code: string): boolean {
//   const index = studentCountsState.findIndex((sc) => sc.code === code);
//   if (index === -1) return false;

//   const deleted = studentCountsState.splice(index, 1);
//   console.log("✅ Deleted student count:", deleted[0]);
//   return true;
// }

// // ============================================================================
// // ENROLLMENT REQUESTS & OVERRIDES STATE MANAGEMENT
// // ============================================================================

// export type EnrollmentRequest = {
//   id: string;
//   sectionId: string;
//   courseCode: string;
//   studentId: string;
//   studentName: string;
//   timestamp: string;
//   status: "pending" | "approved" | "denied";
//   reason?: string;
//   reviewedBy?: string;
//   reviewedAt?: string;
// };

// export type EnrollmentOverride = {
//   sectionId: string;
//   courseCode: string;
//   studentId: string;
//   addedBy: "committee" | "registrar";
//   addedAt: string;
// };

// let enrollmentRequestsState: EnrollmentRequest[] = [];
// let enrollmentOverridesState: EnrollmentOverride[] = [];

// export function getAllEnrollmentRequests(): EnrollmentRequest[] {
//   return enrollmentRequestsState;
// }

// export function getPendingEnrollmentRequests(): EnrollmentRequest[] {
//   return enrollmentRequestsState.filter((r) => r.status === "pending");
// }

// export function createEnrollmentRequest(
//   sectionId: string,
//   courseCode: string,
//   studentId: string,
//   studentName: string
// ): EnrollmentRequest {
//   const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//   const request: EnrollmentRequest = {
//     id,
//     sectionId,
//     courseCode,
//     studentId,
//     studentName,
//     timestamp: new Date().toISOString(),
//     status: "pending",
//   };
//   enrollmentRequestsState.push(request);
//   console.log("📝 Created enrollment request:", request);
//   return request;
// }

// export function approveEnrollmentRequest(
//   requestId: string,
//   reviewedBy: string
// ): boolean {
//   const request = enrollmentRequestsState.find((r) => r.id === requestId);
//   if (!request || request.status !== "pending") return false;

//   request.status = "approved";
//   request.reviewedBy = reviewedBy;
//   request.reviewedAt = new Date().toISOString();

//   // Add to overrides
//   enrollmentOverridesState.push({
//     sectionId: request.sectionId,
//     courseCode: request.courseCode,
//     studentId: request.studentId,
//     addedBy: "registrar",
//     addedAt: request.reviewedAt,
//   });

//   console.log("✅ Approved enrollment request:", request);
//   return true;
// }

// export function denyEnrollmentRequest(
//   requestId: string,
//   reviewedBy: string,
//   reason: string
// ): boolean {
//   const request = enrollmentRequestsState.find((r) => r.id === requestId);
//   if (!request || request.status !== "pending") return false;

//   request.status = "denied";
//   request.reviewedBy = reviewedBy;
//   request.reviewedAt = new Date().toISOString();
//   request.reason = reason;

//   console.log("❌ Denied enrollment request:", request);
//   return true;
// }

// export function addEnrollmentOverride(
//   sectionId: string,
//   courseCode: string,
//   studentId: string,
//   addedBy: "committee" | "registrar"
// ): EnrollmentOverride {
//   const override: EnrollmentOverride = {
//     sectionId,
//     courseCode,
//     studentId,
//     addedBy,
//     addedAt: new Date().toISOString(),
//   };
//   enrollmentOverridesState.push(override);
//   console.log("➕ Added enrollment override:", override);
//   return override;
// }

// export function getEnrollmentOverridesForSection(
//   sectionId: string
// ): EnrollmentOverride[] {
//   return enrollmentOverridesState.filter((o) => o.sectionId === sectionId);
// }

// export function removeEnrollmentOverride(
//   sectionId: string,
//   studentId: string
// ): boolean {
//   const index = enrollmentOverridesState.findIndex(
//     (o) => o.sectionId === sectionId && o.studentId === studentId
//   );
//   if (index === -1) return false;

//   const removed = enrollmentOverridesState.splice(index, 1);
//   console.log("➖ Removed enrollment override:", removed[0]);
//   return true;
// }

// // ============================================================================
// // RESET FUNCTION (for testing)
// // ============================================================================

// export function resetToEmptyState(): void {
//   coursesState = [];
//   studentCountsState = [];
//   enrollmentRequestsState = [];
//   enrollmentOverridesState = [];
//   console.log("Reset to empty state");
// }
