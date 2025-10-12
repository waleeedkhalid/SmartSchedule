// // Student schedule transformation helpers (DEC-8 compliant)
// // Implements choices: 2A (extracted helpers), 3A (numeric time model), 4A (deterministic IDs)

// import type {
//   Course,
//   CourseSection,
//   NormalizedTimeSlot,
//   Schedule,
//   SectionMeeting,
// } from "@/lib/types";

// export interface CatalogActivity {
//   section: string;
//   activity: string; // Arabic label
//   instructor: string;
//   day: number; // 1-5
//   startMinutes: number;
//   endMinutes: number;
//   examDateISO?: string; // ISO date (lecture only)
// }

// export interface CatalogCourseInput {
//   courseCode: string;
//   courseName: string;
//   activities: CatalogActivity[];
// }

// export function deterministicCourseId(
//   courseCode: string,
//   act: CatalogActivity
// ): number {
//   const key = `${courseCode}:${act.section}:${act.day}:${act.startMinutes}:${act.endMinutes}`;
//   // Simple deterministic hash (djb2)
//   let hash = 5381;
//   for (let i = 0; i < key.length; i++) hash = (hash * 33) ^ key.charCodeAt(i);
//   return Math.abs(hash >>> 0);
// }

// export function activityToCourseSection(
//   course: CatalogCourseInput,
//   act: CatalogActivity
// ): CourseSection {
//   const sectionMeetings: SectionMeeting[] = [
//     {
//       day: act.day,
//       startMinutes: act.startMinutes,
//       endMinutes: act.endMinutes,
//     },
//   ];
//   const normalizedSlots: NormalizedTimeSlot[] = sectionMeetings.map((m) => ({
//     day: m.day,
//     startMinutes: m.startMinutes,
//     endMinutes: m.endMinutes,
//   }));
//   const courseObj: Course = {
//     courseId: deterministicCourseId(course.courseCode, act),
//     courseCode: course.courseCode,
//     courseName: course.courseName,
//     section: act.section,
//     activity: act.activity,
//     hours: ((act.endMinutes - act.startMinutes) / 60).toString(),
//     status: "ENROLLED",
//     sectionMeetings,
//     instructor: act.instructor,
//     examDay: "---",
//     examTime: "---",
//     examDate: act.examDateISO || "---", // ISO date if provided
//     sectionAllocations: "",
//   };
//   return { course: courseObj, normalizedSlots };
// }

// export function buildScheduleFromSelections(
//   selections: CourseSection[]
// ): Schedule {
//   const slots = selections.flatMap((s) => s.normalizedSlots);
//   const starts = slots.map((s) => s.startMinutes);
//   const ends = slots.map((s) => s.endMinutes);
//   const earliestStart = starts.length ? Math.min(...starts) : 0;
//   const latestEnd = ends.length ? Math.max(...ends) : 0;

//   // Compute total gaps (simple per-day gap sum)
//   const gapsByDay = new Map<number, number>();
//   for (const d of [1, 2, 3, 4, 5]) {
//     const daySlots = slots
//       .filter((s) => s.day === d)
//       .sort((a, b) => a.startMinutes - b.startMinutes);
//     let gaps = 0;
//     for (let i = 0; i < daySlots.length - 1; i++) {
//       const cur = daySlots[i];
//       const next = daySlots[i + 1];
//       if (next.startMinutes > cur.endMinutes) {
//         gaps += next.startMinutes - cur.endMinutes;
//       }
//     }
//     if (gaps > 0) gapsByDay.set(d, gaps);
//   }
//   const totalGapMinutes = Array.from(gapsByDay.values()).reduce(
//     (a, b) => a + b,
//     0
//   );

//   return {
//     id: "student-current",
//     sections: selections,
//     score: 0,
//     conflicts: [], // course-level conflicts can be injected after detection
//     metadata: {
//       totalHours: slots.reduce(
//         (acc, s) => acc + (s.endMinutes - s.startMinutes) / 60,
//         0
//       ),
//       daysUsed: Array.from(new Set(slots.map((s) => s.day))),
//       earliestStart,
//       latestEnd,
//       totalGaps: totalGapMinutes,
//     },
//   };
// }

// export interface SectionConflictDetail {
//   a: CourseSection;
//   b: CourseSection;
//   overlapMinutes: number;
// }

// export function detectSectionConflicts(
//   selections: CourseSection[]
// ): SectionConflictDetail[] {
//   const conflicts: SectionConflictDetail[] = [];
//   for (let i = 0; i < selections.length; i++) {
//     for (let j = i + 1; j < selections.length; j++) {
//       const A = selections[i];
//       const B = selections[j];
//       for (const sa of A.normalizedSlots) {
//         for (const sb of B.normalizedSlots) {
//           if (sa.day !== sb.day) continue;
//           const overlap =
//             Math.min(sa.endMinutes, sb.endMinutes) -
//             Math.max(sa.startMinutes, sb.startMinutes);
//           if (overlap > 0) {
//             conflicts.push({ a: A, b: B, overlapMinutes: overlap });
//           }
//         }
//       }
//     }
//   }
//   return conflicts;
// }

// export function buildHighlightMapForConflicts(
//   conflicts: SectionConflictDetail[]
// ): Record<string, "remove" | "update"> {
//   const map: Record<string, "remove" | "update"> = {};
//   for (const c of conflicts) {
//     const keyA = sectionKey(c.a);
//     const keyB = sectionKey(c.b);
//     map[keyA] = map[keyA] || "remove";
//     map[keyB] = map[keyB] || "remove";
//   }
//   return map;
// }

// export function sectionKey(cs: CourseSection): string {
//   return `${cs.course.courseCode}-${cs.course.section}-${cs.course.activity}`;
// }
