// Utility functions to transform mockCourseOfferings data for committee components.
// Domain types MUST come from central definitions in src/lib/types.ts (DEC-Types-01).
import type { CourseOffering } from "@/lib/types";

// Flattened view of nested exam objects for table rendering.
export type ExamRecord = {
  id: string;
  courseCode: string;
  courseName: string;
  type: "midterm" | "midterm2" | "final";
  date: string;
  time: string;
  duration: number;
  room?: string;
  sectionIds: string[];
};

export type ScheduleSection = {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  credits: number;
  meetings: {
    id: string;
    sectionId: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    instructor: string;
  }[];
};

/**
 * Extract all exams from course offerings
 * Only includes SWE department courses
 */
export function getExams(courseOfferings: CourseOffering[]): ExamRecord[] {
  const exams: ExamRecord[] = [];

  courseOfferings.forEach((course) => {
    // Only include SWE department courses
    if (course.department !== "SWE") return;

    Object.entries(course.exams).forEach(([type, examData]) => {
      if (!examData) return; // Skip if exam is undefined
      exams.push({
        id: `${course.code}-${type}`,
        courseCode: course.code,
        courseName: course.name,
        type: type as "midterm" | "midterm2" | "final",
        date: examData.date,
        time: examData.time,
        duration: examData.duration,
        sectionIds: course.sections.map((s) => s.id),
      });
    });
  });

  return exams;
}

/**
 * Get sections by course code
 */
export function getSectionsByCourseCode(
  courseOfferings: CourseOffering[],
  courseCode: string
): ScheduleSection[] {
  const course = courseOfferings.find((c) => c.code === courseCode);
  if (!course) return [];

  return course.sections.map((section) => ({
    id: section.id,
    courseCode: course.code,
    courseName: course.name,
    instructor: section.instructor,
    room: section.room,
    credits: course.credits,
    // Backward compatibility: if section has already a 'meetings' array (transition phase)
    meetings: hasMeetings(section)
      ? section.meetings
      : section.times.map((time, idx) => ({
          id: `${section.id}-meeting-${idx}`,
          sectionId: section.id,
          day: time.day,
          startTime: time.start,
          endTime: time.end,
          room: section.room,
          instructor: section.instructor,
        })),
  }));
}

/**
 * Get all sections as schedule grid data
 */
export function getAllSections(
  courseOfferings: CourseOffering[]
): ScheduleSection[] {
  const sections: ScheduleSection[] = [];

  courseOfferings.forEach((course) => {
    course.sections.forEach((section) => {
      sections.push({
        id: section.id,
        courseCode: course.code,
        courseName: course.name,
        instructor: section.instructor,
        room: section.room,
        credits: course.credits,
        meetings: hasMeetings(section)
          ? section.meetings
          : section.times.map((time, idx) => ({
              id: `${section.id}-meeting-${idx}`,
              sectionId: section.id,
              day: time.day,
              startTime: time.start,
              endTime: time.end,
              room: section.room,
              instructor: section.instructor,
            })),
      });
    });
  });

  return sections;
}

// --- Transition helper ---
function hasMeetings(
  section: unknown
): section is { meetings: ScheduleSection["meetings"] } {
  if (!section || typeof section !== "object") return false;
  return Array.isArray((section as { meetings?: unknown }).meetings);
}

/**
 * Get sections lookup for exam table
 */
export function getSectionsLookup(courseOfferings: CourseOffering[]): Array<{
  sectionId: string;
  courseCode: string;
}> {
  const lookup: Array<{ sectionId: string; courseCode: string }> = [];

  courseOfferings.forEach((course) => {
    course.sections.forEach((section) => {
      lookup.push({
        sectionId: section.id,
        courseCode: course.code,
      });
    });
  });

  return lookup;
}

/**
 * Get courses by type (e.g., ELECTIVE)
 */
export function getCoursesByType(
  courseOfferings: CourseOffering[],
  type: string
): CourseOffering[] {
  return courseOfferings.filter((course) => course.type === type);
}

/**
 * Get courses by level
 */
export function getCoursesByLevel(
  courseOfferings: CourseOffering[],
  level: number
): CourseOffering[] {
  return courseOfferings.filter((course) => course.level === level);
}

/**
 * Get instructor load summary
 */
export function getInstructorLoads(courseOfferings: CourseOffering[]) {
  const instructorMap = new Map<
    string,
    {
      instructorName: string;
      sections: Array<{
        sectionId: string;
        courseCode: string;
        courseName: string;
        hours: number;
      }>;
      totalHours: number;
    }
  >();

  courseOfferings.forEach((course) => {
    course.sections.forEach((section) => {
      if (!section.instructor) return;

      const existing = instructorMap.get(section.instructor);
      const sectionHours = course.credits; // Simplified: use credits as hours

      if (existing) {
        existing.sections.push({
          sectionId: section.id,
          courseCode: course.code,
          courseName: course.name,
          hours: sectionHours,
        });
        existing.totalHours += sectionHours;
      } else {
        instructorMap.set(section.instructor, {
          instructorName: section.instructor,
          sections: [
            {
              sectionId: section.id,
              courseCode: course.code,
              courseName: course.name,
              hours: sectionHours,
            },
          ],
          totalHours: sectionHours,
        });
      }
    });
  });

  return Array.from(instructorMap.entries()).map(([id, data]) => ({
    instructorId: id.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    instructorName: data.instructorName,
    assignedHours: data.totalHours,
    maxHours: 15, // Default max hours per DEC-4
    sections: data.sections,
  }));
}
