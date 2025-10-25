// import {
//   TimeSlot,
//   CourseOffering,
//   Section,
//   SWEStudent,
//   FacultyAvailability,
//   Conflict,
//   SectionMeeting,
// } from "@/types";
// import { TimeSlotManager } from "./TimeSlotManager";

// /**
//  * ConflictChecker - Phase 3: Conflict Detection
//  *
//  * Detects all types of scheduling conflicts:
//  * - Time conflicts (overlapping class times)
//  * - Exam conflicts (students taking multiple exams at same time)
//  * - Faculty conflicts (instructor assigned to multiple sections simultaneously)
//  * - Room conflicts (same room booked for multiple sections)
//  * - Prerequisite violations (students taking courses without prerequisites)
//  * - Capacity conflicts (section enrollment exceeding capacity)
//  */
// export class ConflictChecker {
//   private timeManager: TimeSlotManager;

//   constructor() {
//     this.timeManager = new TimeSlotManager();
//   }

//   /**
//    * Check for time conflicts between two sections
//    * Only reports ERROR if both time AND room conflict (same time + same room)
//    * Reports WARNING if only time conflicts (different rooms)
//    */
//   checkSectionTimeConflict(
//     section1: Section,
//     section2: Section
//   ): Conflict | null {
//     // Get meeting times for both sections
//     // Prefer normalized meetings if present, else derive from legacy times
//     const times1: SectionMeeting[] =
//       section1.meetings || legacyTimesToMeetings(section1.times);
//     const times2: SectionMeeting[] =
//       section2.meetings || legacyTimesToMeetings(section2.times);

//     for (const time1 of times1) {
//       for (const time2 of times2) {
//         const slot1: TimeSlot = normalizeMeetingToDisplay(time1);
//         const slot2: TimeSlot = normalizeMeetingToDisplay(time2);

//         if (this.timeManager.doTimeSlotsOverlap(slot1, slot2)) {
//           // Check if same room - only ERROR if both time AND room conflict
//           const sameRoom =
//             section1.room && section2.room && section1.room === section2.room;

//           return {
//             id: `conflict-${section1.id}-${section2.id}-time`,
//             type: "TIME",
//             severity: sameRoom ? "ERROR" : "WARNING",
//             message: sameRoom
//               ? `Time and room conflict: ${section1.courseCode} and ${section2.courseCode} meet at the same time in ${section1.room}`
//               : `Time conflict: ${section1.courseCode} and ${section2.courseCode} meet at the same time (different rooms)`,
//             affected: [
//               { id: section1.id, label: section1.courseCode },
//               { id: section2.id, label: section2.courseCode },
//             ],
//             detectedAt: new Date().toISOString(),
//           };
//         }
//       }
//     }

//     return null;
//   }

//   /**
//    * Check for exam conflicts between courses
//    */
//   checkExamConflict(
//     course1: CourseOffering,
//     course2: CourseOffering
//   ): Conflict[] {
//     const conflicts: Conflict[] = [];

//     // Check midterm conflicts
//     if (course1.exams?.midterm && course2.exams?.midterm) {
//       const exam1 = course1.exams.midterm;
//       const exam2 = course2.exams.midterm;

//       if (exam1.date === exam2.date && exam1.time === exam2.time) {
//         conflicts.push({
//           id: `conflict-${course1.code}-${course2.code}-midterm`,
//           type: "TIME",
//           severity: "ERROR",
//           message: `Midterm exam conflict: ${course1.code} and ${course2.code} scheduled at same time`,
//           affected: [
//             { id: course1.code, label: `${course1.code} Midterm` },
//             { id: course2.code, label: `${course2.code} Midterm` },
//           ],
//           detectedAt: new Date().toISOString(),
//         });
//       }
//     }

//     // Check midterm2 conflicts (optional exam)
//     if (course1.exams?.midterm2 && course2.exams?.midterm2) {
//       const exam1 = course1.exams.midterm2;
//       const exam2 = course2.exams.midterm2;

//       if (exam1.date === exam2.date && exam1.time === exam2.time) {
//         conflicts.push({
//           id: `conflict-${course1.code}-${course2.code}-midterm2`,
//           type: "TIME",
//           severity: "ERROR",
//           message: `Second midterm exam conflict: ${course1.code} and ${course2.code} scheduled at same time`,
//           affected: [
//             { id: course1.code, label: `${course1.code} Midterm 2` },
//             { id: course2.code, label: `${course2.code} Midterm 2` },
//           ],
//           detectedAt: new Date().toISOString(),
//         });
//       }
//     }

//     // Check final exam conflicts
//     if (course1.exams?.final && course2.exams?.final) {
//       const exam1 = course1.exams.final;
//       const exam2 = course2.exams.final;

//       if (exam1.date === exam2.date && exam1.time === exam2.time) {
//         conflicts.push({
//           id: `conflict-${course1.code}-${course2.code}-final`,
//           type: "TIME",
//           severity: "ERROR",
//           message: `Final exam conflict: ${course1.code} and ${course2.code} scheduled at same time`,
//           affected: [
//             { id: course1.code, label: `${course1.code} Final` },
//             { id: course2.code, label: `${course2.code} Final` },
//           ],
//           detectedAt: new Date().toISOString(),
//         });
//       }
//     }

//     return conflicts;
//   }

//   /**
//    * Check for faculty conflicts (instructor teaching multiple sections at same time)
//    */
//   checkFacultyConflict(
//     sections: Section[],
//     faculty: FacultyAvailability
//   ): Conflict[] {
//     const conflicts: Conflict[] = [];

//     // Find all sections assigned to this faculty
//     const facultySections = sections.filter(
//       (s) => s.instructor === faculty.instructorName
//     );

//     // Check for time conflicts between faculty's sections
//     for (let i = 0; i < facultySections.length; i++) {
//       for (let j = i + 1; j < facultySections.length; j++) {
//         const conflict = this.checkSectionTimeConflict(
//           facultySections[i],
//           facultySections[j]
//         );

//         if (conflict) {
//           conflicts.push({
//             id: `conflict-faculty-${faculty.instructorId}`,
//             type: "INSTRUCTOR",
//             severity: "ERROR",
//             message: `Faculty conflict: ${faculty.instructorName} assigned to multiple sections at same time`,
//             affected: [
//               { id: faculty.instructorId, label: faculty.instructorName },
//               {
//                 id: facultySections[i].id,
//                 label: facultySections[i].courseCode,
//               },
//               {
//                 id: facultySections[j].id,
//                 label: facultySections[j].courseCode,
//               },
//             ],
//             detectedAt: new Date().toISOString(),
//           });
//         }
//       }
//     }

//     // Check if faculty is available for assigned sections
//     for (const section of facultySections) {
//       const times = section.meetings || legacyTimesToMeetings(section.times);
//       for (const time of times) {
//         const slot: TimeSlot = normalizeMeetingToDisplay(time);

//         if (!this.timeManager.isFacultyAvailable(faculty, slot)) {
//           conflicts.push({
//             id: `conflict-availability-${faculty.instructorId}-${section.id}`,
//             type: "INSTRUCTOR",
//             severity: "WARNING",
//             message: `Faculty availability issue: ${faculty.instructorName} not available at assigned time`,
//             affected: [
//               { id: faculty.instructorId, label: faculty.instructorName },
//               { id: section.id, label: section.courseCode },
//             ],
//             detectedAt: new Date().toISOString(),
//           });
//         }
//       }
//     }

//     return conflicts;
//   }

//   /**
//    * Check for room conflicts (same room booked for multiple sections at same time)
//    */
//   checkRoomConflict(sections: Section[]): Conflict[] {
//     const conflicts: Conflict[] = [];
//     const roomBookings: Map<
//       string,
//       Array<{ section: Section; time: SectionMeeting }>
//     > = new Map();

//     // Collect all room bookings
//     for (const section of sections) {
//       const times = section.meetings || legacyTimesToMeetings(section.times);
//       const room = section.room;

//       for (const time of times) {
//         if (!room) continue; // Skip if no room assigned

//         if (!roomBookings.has(room)) {
//           roomBookings.set(room, []);
//         }
//         roomBookings.get(room)!.push({ section, time });
//       }
//     }

//     // Check for overlapping bookings in same room
//     for (const [room, bookings] of roomBookings.entries()) {
//       for (let i = 0; i < bookings.length; i++) {
//         for (let j = i + 1; j < bookings.length; j++) {
//           const booking1 = bookings[i];
//           const booking2 = bookings[j];

//           const slot1: TimeSlot = normalizeMeetingToDisplay(booking1.time);
//           const slot2: TimeSlot = normalizeMeetingToDisplay(booking2.time);

//           if (this.timeManager.doTimeSlotsOverlap(slot1, slot2)) {
//             conflicts.push({
//               id: `conflict-room-${room}-${booking1.section.id}-${booking2.section.id}`,
//               type: "ROOM",
//               severity: "ERROR",
//               message: `Room conflict: ${room} double-booked`,
//               affected: [
//                 {
//                   id: booking1.section.id,
//                   label: `${booking1.section.courseCode} in ${room}`,
//                 },
//                 {
//                   id: booking2.section.id,
//                   label: `${booking2.section.courseCode} in ${room}`,
//                 },
//               ],
//               detectedAt: new Date().toISOString(),
//             });
//           }
//         }
//       }
//     }

//     return conflicts;
//   }

//   /**
//    * Check for student schedule conflicts
//    */
//   checkStudentScheduleConflict(
//     student: SWEStudent,
//     sections: Section[]
//   ): Conflict[] {
//     const conflicts: Conflict[] = [];

//     // Get sections the student is enrolled in (simplified - in real system would track enrollment)
//     // For now, we check all sections they could potentially be in

//     // Check for time conflicts between sections
//     for (let i = 0; i < sections.length; i++) {
//       for (let j = i + 1; j < sections.length; j++) {
//         const conflict = this.checkSectionTimeConflict(
//           sections[i],
//           sections[j]
//         );

//         if (conflict) {
//           conflicts.push({
//             id: `conflict-student-${student.id}-${sections[i].id}-${sections[j].id}`,
//             type: "TIME",
//             severity: "ERROR",
//             message: `Student schedule conflict: ${student.name} has overlapping classes`,
//             affected: [
//               { id: student.id, label: student.name },
//               { id: sections[i].id, label: sections[i].courseCode },
//               { id: sections[j].id, label: sections[j].courseCode },
//             ],
//             detectedAt: new Date().toISOString(),
//           });
//         }
//       }
//     }

//     return conflicts;
//   }

//   /**
//    * Check for capacity conflicts (enrollment exceeds section capacity)
//    */
//   checkCapacityConflict(
//     section: Section,
//     enrolledCount: number
//   ): Conflict | null {
//     const capacity = section.capacity || 30; // Default capacity if not set

//     if (enrolledCount > capacity) {
//       return {
//         id: `conflict-capacity-${section.id}`,
//         type: "RULE",
//         severity: "WARNING",
//         message: `Capacity exceeded: ${section.courseCode} (${enrolledCount}/${capacity})`,
//         affected: [{ id: section.id, label: section.courseCode }],
//         detectedAt: new Date().toISOString(),
//       };
//     }

//     return null;
//   }

//   /**
//    * Check all conflicts for a collection of sections
//    */
//   checkAllConflicts(
//     sections: Section[],
//     courses: CourseOffering[],
//     faculty: FacultyAvailability[]
//   ): Conflict[] {
//     const conflicts: Conflict[] = [];

//     // Check section time conflicts
//     for (let i = 0; i < sections.length; i++) {
//       for (let j = i + 1; j < sections.length; j++) {
//         const conflict = this.checkSectionTimeConflict(
//           sections[i],
//           sections[j]
//         );
//         if (conflict) {
//           conflicts.push(conflict);
//         }
//       }
//     }

//     // Check exam conflicts
//     for (let i = 0; i < courses.length; i++) {
//       for (let j = i + 1; j < courses.length; j++) {
//         const examConflicts = this.checkExamConflict(courses[i], courses[j]);
//         conflicts.push(...examConflicts);
//       }
//     }

//     // Check faculty conflicts
//     for (const f of faculty) {
//       const facultyConflicts = this.checkFacultyConflict(sections, f);
//       conflicts.push(...facultyConflicts);
//     }

//     // Check room conflicts
//     const roomConflicts = this.checkRoomConflict(sections);
//     conflicts.push(...roomConflicts);

//     return conflicts;
//   }

//   /**
//    * Get conflict summary statistics
//    */
//   getConflictSummary(conflicts: Conflict[]): {
//     total: number;
//     byType: Record<string, number>;
//     bySeverity: Record<string, number>;
//     critical: Conflict[];
//   } {
//     const byType: Record<string, number> = {};
//     const bySeverity: Record<string, number> = {};
//     const critical: Conflict[] = [];

//     for (const conflict of conflicts) {
//       // Count by type
//       byType[conflict.type] = (byType[conflict.type] || 0) + 1;

//       // Count by severity
//       bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;

//       // Collect critical conflicts
//       if (conflict.severity === "ERROR") {
//         critical.push(conflict);
//       }
//     }

//     return {
//       total: conflicts.length,
//       byType,
//       bySeverity,
//       critical,
//     };
//   }
// }

// // --- Helpers for new normalized model ---
// function minutesToString(m: number): string {
//   const h = Math.floor(m / 60)
//     .toString()
//     .padStart(2, "0");
//   const mm = (m % 60).toString().padStart(2, "0");
//   return `${h}:${mm}`;
// }

// const DAY_MAP: Record<number, string> = {
//   1: "Sunday",
//   2: "Monday",
//   3: "Tuesday",
//   4: "Wednesday",
//   5: "Thursday",
// };

// function dayNumberToName(day: number): string {
//   return DAY_MAP[day] || "Sunday";
// }

// function normalizeMeetingToDisplay(m: SectionMeeting): TimeSlot {
//   return {
//     day: dayNumberToName(m.day),
//     startTime: minutesToString(m.startMinutes),
//     endTime: minutesToString(m.endMinutes),
//   };
// }

// function legacyTimesToMeetings(
//   times: { day: string; start: string; end: string }[]
// ): SectionMeeting[] {
//   return times.map((t) => ({
//     day: nameToDayNumber(t.day),
//     startMinutes: stringToMinutes(t.start),
//     endMinutes: stringToMinutes(t.end),
//   }));
// }

// function stringToMinutes(hhmm: string): number {
//   const [h, m] = hhmm.split(":").map(Number);
//   return h * 60 + m;
// }

// function nameToDayNumber(name: string): number {
//   const map: Record<string, number> = {
//     Sunday: 1,
//     Monday: 2,
//     Tuesday: 3,
//     Wednesday: 4,
//     Thursday: 5,
//   };
//   return map[name] || 1;
// }
