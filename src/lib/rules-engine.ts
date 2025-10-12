// // Rules engine for SWE Department scheduling constraints
// // Simplified version for Phase 3 - checks basic structure validity

// import { Conflict, CourseOffering } from "./types";
// import {
//   courseOfferingService,
//   conflictService,
//   configService,
// } from "./data-store";

// export interface ConflictCheckResult {
//   isValid: boolean;
//   conflicts: Conflict[];
// }

// // Helper to parse time "HH:MM" to minutes
// function parseTime(time: string): number {
//   const [hours, minutes] = time.split(":").map(Number);
//   return hours * 60 + minutes;
// }

// // Check if two time ranges overlap
// function timeOverlap(
//   start1: string,
//   end1: string,
//   start2: string,
//   end2: string
// ): boolean {
//   const s1 = parseTime(start1);
//   const e1 = parseTime(end1);
//   const s2 = parseTime(start2);
//   const e2 = parseTime(end2);
//   return s1 < e2 && s2 < e1;
// }

// // ============================================================================
// // RULE 1: Break Time (12:00-13:00 no classes)
// // ============================================================================

// export function checkBreakTimeRule(): Conflict[] {
//   const config = configService.get();
//   const { breakTimeStart, breakTimeEnd } = config;
//   const conflicts: Conflict[] = [];

//   const allCourses = courseOfferingService.findAll();

//   for (const course of allCourses) {
//     for (const section of course.sections || []) {
//       for (const time of section.times || []) {
//         if (timeOverlap(time.start, time.end, breakTimeStart, breakTimeEnd)) {
//           conflicts.push({
//             id: `break-${section.id}-${time.day}`,
//             type: "RULE",
//             severity: "ERROR",
//             message: `${section.id} has class during break time (${time.day} ${time.start}-${time.end})`,
//             affected: [
//               {
//                 id: section.id,
//                 label: section.id,
//               },
//             ],
//             detectedAt: new Date().toISOString(),
//           });
//         }
//       }
//     }
//   }

//   return conflicts;
// }

// // ============================================================================
// // RULE 2: Room Conflicts
// // ============================================================================

// // Internal normalized scheduled slot representation reused across rules
// interface _ScheduledTimeSlot {
//   course: CourseOffering;
//   sectionId: string;
//   day: string;
//   start: string;
//   end: string;
//   room?: string;
//   instructor?: string;
// }

// export function checkRoomConflicts(): Conflict[] {
//   const conflicts: Conflict[] = [];
//   const allCourses = courseOfferingService.findAll();

//   const scheduledTimes: _ScheduledTimeSlot[] = [];

//   for (const course of allCourses) {
//     for (const section of course.sections || []) {
//       for (const time of section.times || []) {
//         if (time.day && section.room) {
//           scheduledTimes.push({
//             course,
//             sectionId: section.id,
//             day: time.day,
//             start: time.start,
//             end: time.end,
//             room: section.room,
//           });
//         }
//       }
//     }
//   }

//   // Check for room conflicts
//   for (let i = 0; i < scheduledTimes.length; i++) {
//     for (let j = i + 1; j < scheduledTimes.length; j++) {
//       const a = scheduledTimes[i];
//       const b = scheduledTimes[j];

//       // Same room, same day, overlapping times
//       if (
//         a.room === b.room &&
//         a.day === b.day &&
//         timeOverlap(a.start, a.end, b.start, b.end)
//       ) {
//         conflicts.push({
//           id: `room-conflict-${a.sectionId}-${b.sectionId}`,
//           type: "ROOM",
//           severity: "ERROR",
//           message: `Room ${a.room} double-booked: ${a.sectionId} and ${b.sectionId} on ${a.day} ${a.start}-${a.end}`,
//           affected: [
//             { id: a.sectionId, label: a.sectionId },
//             { id: b.sectionId, label: b.sectionId },
//           ],
//           detectedAt: new Date().toISOString(),
//         });
//       }
//     }
//   }

//   return conflicts;
// }

// // ============================================================================
// // RULE 3: Instructor Conflicts
// // ============================================================================

// export function checkInstructorConflicts(): Conflict[] {
//   const conflicts: Conflict[] = [];
//   const allCourses = courseOfferingService.findAll();

//   const scheduledTimes: _ScheduledTimeSlot[] = [];

//   for (const course of allCourses) {
//     for (const section of course.sections || []) {
//       for (const time of section.times || []) {
//         if (time.day && section.instructor) {
//           scheduledTimes.push({
//             course,
//             sectionId: section.id,
//             day: time.day,
//             start: time.start,
//             end: time.end,
//             instructor: section.instructor,
//           });
//         }
//       }
//     }
//   }

//   // Check for instructor conflicts
//   for (let i = 0; i < scheduledTimes.length; i++) {
//     for (let j = i + 1; j < scheduledTimes.length; j++) {
//       const a = scheduledTimes[i];
//       const b = scheduledTimes[j];

//       // Same instructor, same day, overlapping times
//       if (
//         a.instructor === b.instructor &&
//         a.day === b.day &&
//         timeOverlap(a.start, a.end, b.start, b.end)
//       ) {
//         conflicts.push({
//           id: `instructor-conflict-${a.sectionId}-${b.sectionId}`,
//           type: "INSTRUCTOR",
//           severity: "ERROR",
//           message: `Instructor ${a.instructor} has conflicting sections: ${a.sectionId} and ${b.sectionId} on ${a.day} ${a.start}-${a.end}`,
//           affected: [
//             { id: a.sectionId, label: a.sectionId },
//             { id: b.sectionId, label: b.sectionId },
//           ],
//           detectedAt: new Date().toISOString(),
//         });
//       }
//     }
//   }

//   return conflicts;
// }

// // ============================================================================
// // RULE 4: Time Conflicts (general)
// // ============================================================================

// export function checkTimeConflicts(): Conflict[] {
//   return [...checkRoomConflicts(), ...checkInstructorConflicts()];
// }

// // ============================================================================
// // COMPREHENSIVE CONFLICT CHECK
// // ============================================================================

// export function checkAllConflicts(): ConflictCheckResult {
//   const allConflicts: Conflict[] = [
//     ...checkBreakTimeRule(),
//     ...checkTimeConflicts(),
//   ];

//   // Clear existing conflicts and store new ones
//   conflictService.clear();
//   allConflicts.forEach((conflict) => conflictService.create(conflict));

//   return {
//     isValid: allConflicts.length === 0,
//     conflicts: allConflicts,
//   };
// }

// // ============================================================================
// // RULE METADATA (for UI display)
// // ============================================================================

// export const RULES = [
//   {
//     key: "BREAK_TIME",
//     name: "Break Time Rule",
//     description: "No classes scheduled during 12:00-13:00 break time",
//     severity: "ERROR",
//   },
//   {
//     key: "ROOM_CONFLICT",
//     name: "Room Conflict Detection",
//     description: "No overlapping classes in same room",
//     severity: "ERROR",
//   },
//   {
//     key: "INSTRUCTOR_CONFLICT",
//     name: "Instructor Conflict Detection",
//     description: "No overlapping classes for same instructor",
//     severity: "ERROR",
//   },
// ];
