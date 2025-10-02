// Local state management for exams and courses
// This replaces mockData with persistent in-memory state until API integration

import { mockCourseOfferings, mockStudentCounts } from "@/data/mockData";
import type { CourseOffering, Section } from "./types";

// Deep clone to avoid mutating mockData
let coursesState: CourseOffering[] = JSON.parse(
  JSON.stringify(mockCourseOfferings)
);

// Student counts state
export type StudentCount = {
  code: string;
  name: string;
  level: number;
  total_students: number;
};

let studentCountsState: StudentCount[] = JSON.parse(
  JSON.stringify(mockStudentCounts)
);

// ============================================================================
// COURSES STATE MANAGEMENT
// ============================================================================

export function getAllCourses(): CourseOffering[] {
  return coursesState;
}

export function getCourseByCode(code: string): CourseOffering | undefined {
  return coursesState.find((c) => c.code === code);
}

export function updateCourse(
  code: string,
  updates: Partial<CourseOffering>
): CourseOffering | null {
  const index = coursesState.findIndex((c) => c.code === code);
  if (index === -1) return null;

  coursesState[index] = { ...coursesState[index], ...updates };
  console.log("Updated course:", coursesState[index]);
  return coursesState[index];
}

export function addCourse(course: CourseOffering): CourseOffering {
  const exists = coursesState.find((c) => c.code === course.code);
  if (exists) {
    throw new Error(`Course ${course.code} already exists`);
  }

  coursesState.push(course);
  console.log("Added course:", course);
  return course;
}

export function deleteCourse(code: string): boolean {
  const index = coursesState.findIndex((c) => c.code === code);
  if (index === -1) return false;

  const deleted = coursesState.splice(index, 1);
  console.log("Deleted course:", deleted[0]);
  return true;
}

// ============================================================================
// EXAM STATE MANAGEMENT
// ============================================================================

export interface ExamUpdate {
  date?: string;
  time?: string;
  duration?: number;
}

export function updateExam(
  courseCode: string,
  examType: "midterm" | "midterm2" | "final",
  examData: ExamUpdate
): boolean {
  const course = getCourseByCode(courseCode);
  if (!course) return false;

  if (!course.exams[examType]) {
    course.exams[examType] = {
      date: examData.date || "",
      time: examData.time || "",
      duration: examData.duration || 90,
    };
  } else {
    course.exams[examType] = {
      ...course.exams[examType]!,
      ...examData,
    };
  }

  console.log(
    `Updated ${examType} exam for ${courseCode}:`,
    course.exams[examType]
  );
  return true;
}

export function deleteExam(
  courseCode: string,
  examType: "midterm" | "midterm2" | "final"
): boolean {
  const course = getCourseByCode(courseCode);
  if (!course) return false;

  if (course.exams[examType]) {
    delete course.exams[examType];
    console.log(`Deleted ${examType} exam for ${courseCode}`);
    return true;
  }

  return false;
}

export function createExam(
  courseCode: string,
  examType: "midterm" | "midterm2" | "final",
  examData: { date: string; time: string; duration: number }
): boolean {
  const course = getCourseByCode(courseCode);
  if (!course) return false;

  course.exams[examType] = examData;
  console.log(`Created ${examType} exam for ${courseCode}:`, examData);
  return true;
}

// ============================================================================
// SECTION STATE MANAGEMENT
// ============================================================================

export function addSection(
  courseCode: string,
  section: Section
): Section | null {
  const course = getCourseByCode(courseCode);
  if (!course) return null;

  const exists = course.sections.find((s) => s.id === section.id);
  if (exists) {
    throw new Error(`Section ${section.id} already exists`);
  }

  course.sections.push(section);
  console.log("Added section:", section);
  return section;
}

export function updateSection(
  courseCode: string,
  sectionId: string,
  updates: Partial<Section>
): Section | null {
  const course = getCourseByCode(courseCode);
  if (!course) return null;

  const index = course.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return null;

  course.sections[index] = { ...course.sections[index], ...updates };
  console.log("Updated section:", course.sections[index]);
  return course.sections[index];
}

export function deleteSection(courseCode: string, sectionId: string): boolean {
  const course = getCourseByCode(courseCode);
  if (!course) return false;

  const index = course.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return false;

  const deleted = course.sections.splice(index, 1);
  console.log("Deleted section:", deleted[0]);
  return true;
}

// ============================================================================
// STUDENT COUNTS STATE MANAGEMENT
// ============================================================================

export function getAllStudentCounts(): StudentCount[] {
  return studentCountsState;
}

export function getStudentCountByCode(code: string): StudentCount | undefined {
  return studentCountsState.find((sc) => sc.code === code);
}

export function updateStudentCount(
  code: string,
  updates: Partial<StudentCount>
): StudentCount | null {
  const index = studentCountsState.findIndex((sc) => sc.code === code);
  if (index === -1) return null;

  studentCountsState[index] = { ...studentCountsState[index], ...updates };
  console.log("✅ Updated student count:", studentCountsState[index]);
  return studentCountsState[index];
}

export function addStudentCount(studentCount: StudentCount): StudentCount {
  const exists = studentCountsState.find((sc) => sc.code === studentCount.code);
  if (exists) {
    throw new Error(`Student count for ${studentCount.code} already exists`);
  }

  studentCountsState.push(studentCount);
  console.log("✅ Added student count:", studentCount);
  return studentCount;
}

export function deleteStudentCount(code: string): boolean {
  const index = studentCountsState.findIndex((sc) => sc.code === code);
  if (index === -1) return false;

  const deleted = studentCountsState.splice(index, 1);
  console.log("✅ Deleted student count:", deleted[0]);
  return true;
}

// ============================================================================
// RESET FUNCTION (for testing)
// ============================================================================

export function resetToMockData(): void {
  coursesState = JSON.parse(JSON.stringify(mockCourseOfferings));
  studentCountsState = JSON.parse(JSON.stringify(mockStudentCounts));
  console.log("Reset to mock data");
}
