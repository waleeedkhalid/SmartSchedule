import { TimeSlotManager } from "./TimeSlotManager";
import { TimeSlot } from "@/types";
import type {
  ScheduleConflict,
  ConflictType,
  AffectedEntity,
  ScheduledSection,
  ScheduledExam,
  SchedulerCourse,
  SectionTimeSlot,
} from "@/types/scheduler";

/**
 * ConflictChecker - Phase 5: Comprehensive Conflict Detection
 *
 * Detects all types of schedule conflicts:
 * - Student schedule conflicts (same time, multiple courses)
 * - Faculty double-booking
 * - Room conflicts
 * - Exam conflicts
 * - Prerequisite violations
 * - Capacity violations
 * - Constraint violations
 */
export class ConflictChecker {
  private timeManager: TimeSlotManager;

  constructor() {
    this.timeManager = new TimeSlotManager();
  }

  // =====================================================
  // TIME SLOT CONFLICTS
  // =====================================================

  /**
   * Check if two time slots overlap
   */
  checkTimeSlotConflict(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return this.timeManager.doTimeSlotsOverlap(slot1, slot2);
  }

  /**
   * Check if two section time slots overlap
   */
  checkSectionTimeSlotsOverlap(slot1: SectionTimeSlot, slot2: SectionTimeSlot): boolean {
    // Different days don't conflict
    if (slot1.day !== slot2.day) return false;

    // Convert times to minutes for comparison
    const start1 = this.timeToMinutes(slot1.start_time);
    const end1 = this.timeToMinutes(slot1.end_time);
    const start2 = this.timeToMinutes(slot2.start_time);
    const end2 = this.timeToMinutes(slot2.end_time);

    // Check for overlap
    return start1 < end2 && start2 < end1;
  }

  /**
   * Check if a collection of time slots has any internal conflicts
   */
  hasInternalConflicts(slots: TimeSlot[]): {
    hasConflict: boolean;
    conflicts: Array<{ slot1: TimeSlot; slot2: TimeSlot }>;
  } {
    const result = this.timeManager.validateSlotCollection(slots);
    return {
      hasConflict: !result.valid,
      conflicts: result.conflicts,
    };
  }

  // =====================================================
  // STUDENT SCHEDULE CONFLICTS
  // =====================================================

  /**
   * Check for student schedule conflicts - multiple courses at the same time
   */
  checkStudentScheduleConflicts(
    studentId: string,
    sections: ScheduledSection[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Compare each section with every other section
    for (let i = 0; i < sections.length; i++) {
      for (let j = i + 1; j < sections.length; j++) {
        const section1 = sections[i];
        const section2 = sections[j];

        // Check if time slots overlap
        const hasOverlap = this.sectionsHaveTimeConflict(section1, section2);

        if (hasOverlap) {
          conflicts.push({
            type: "time_overlap",
            severity: "critical",
            title: "Student Schedule Conflict",
            description: `Student has overlapping classes: ${section1.course_code} (${section1.course_name}) and ${section2.course_code} (${section2.course_name})`,
            affected_entities: [
              { type: "student", id: studentId },
              { type: "section", id: section1.section_id, name: section1.course_code },
              { type: "section", id: section2.section_id, name: section2.course_code },
            ],
            resolution_suggestions: [
              `Move ${section1.course_code} to a different time slot`,
              `Move ${section2.course_code} to a different time slot`,
              "Find alternative sections for one of the courses",
            ],
            auto_resolvable: true,
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if two sections have time conflicts
   */
  private sectionsHaveTimeConflict(
    section1: ScheduledSection,
    section2: ScheduledSection
  ): boolean {
    for (const slot1 of section1.time_slots) {
      for (const slot2 of section2.time_slots) {
        if (this.checkSectionTimeSlotsOverlap(slot1, slot2)) {
          return true;
        }
      }
    }
    return false;
  }

  // =====================================================
  // FACULTY CONFLICTS
  // =====================================================

  /**
   * Check for faculty double-booking
   */
  checkFacultyConflicts(
    facultySchedule: Map<string, ScheduledSection[]>
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    for (const [instructorName, sections] of facultySchedule.entries()) {
      // Check each section against every other section for this faculty
      for (let i = 0; i < sections.length; i++) {
        for (let j = i + 1; j < sections.length; j++) {
          const section1 = sections[i];
          const section2 = sections[j];

          if (this.sectionsHaveTimeConflict(section1, section2)) {
            conflicts.push({
              type: "faculty_conflict",
              severity: "critical",
              title: "Faculty Double-Booking",
              description: `Instructor ${instructorName} is assigned to overlapping sections: ${section1.course_code} and ${section2.course_code}`,
              affected_entities: [
                { type: "faculty", id: instructorName, name: instructorName },
                { type: "section", id: section1.section_id, name: section1.course_code },
                { type: "section", id: section2.section_id, name: section2.course_code },
              ],
              resolution_suggestions: [
                "Assign a different instructor to one of the sections",
                `Reschedule ${section1.course_code} to a different time`,
                `Reschedule ${section2.course_code} to a different time`,
              ],
              auto_resolvable: true,
            });
          }
        }
      }
    }

    return conflicts;
  }

  // =====================================================
  // ROOM CONFLICTS
  // =====================================================

  /**
   * Check for room conflicts - same room booked at overlapping times
   */
  checkRoomConflict(
    room: string,
    timeSlot: TimeSlot,
    existingBookings: Array<{
      room: string;
      timeSlot: TimeSlot;
    }>
  ): boolean {
    return existingBookings.some(
      (booking) =>
        booking.room === room &&
        this.timeManager.doTimeSlotsOverlap(timeSlot, booking.timeSlot)
    );
  }

  /**
   * Check for room conflicts in scheduled sections
   */
  checkRoomConflicts(sections: ScheduledSection[]): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const roomSchedule: Map<string, Array<{ section: ScheduledSection; timeSlot: SectionTimeSlot }>> = new Map();

    // Build room schedule
    for (const section of sections) {
      if (!section.room_number) continue;

      for (const timeSlot of section.time_slots) {
        if (!roomSchedule.has(section.room_number)) {
          roomSchedule.set(section.room_number, []);
        }
        roomSchedule.get(section.room_number)!.push({ section, timeSlot });
      }
    }

    // Check for conflicts in each room
    for (const [room, bookings] of roomSchedule.entries()) {
      for (let i = 0; i < bookings.length; i++) {
        for (let j = i + 1; j < bookings.length; j++) {
          const booking1 = bookings[i];
          const booking2 = bookings[j];

          if (this.checkSectionTimeSlotsOverlap(booking1.timeSlot, booking2.timeSlot)) {
            conflicts.push({
              type: "room_conflict",
              severity: "error",
              title: "Room Conflict",
              description: `Room ${room} is double-booked for ${booking1.section.course_code} and ${booking2.section.course_code} on ${booking1.timeSlot.day}`,
              affected_entities: [
                { type: "room", id: room, name: room },
                { type: "section", id: booking1.section.section_id, name: booking1.section.course_code },
                { type: "section", id: booking2.section.section_id, name: booking2.section.course_code },
              ],
              resolution_suggestions: [
                `Assign a different room to ${booking1.section.course_code}`,
                `Assign a different room to ${booking2.section.course_code}`,
                `Reschedule one of the sections to a different time`,
              ],
              auto_resolvable: true,
            });
          }
        }
      }
    }

    return conflicts;
  }

  // =====================================================
  // EXAM CONFLICTS
  // =====================================================

  /**
   * Check for exam conflicts - student has overlapping exams
   */
  checkExamConflicts(
    studentId: string,
    exams: ScheduledExam[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    for (let i = 0; i < exams.length; i++) {
      for (let j = i + 1; j < exams.length; j++) {
        const exam1 = exams[i];
        const exam2 = exams[j];

        // Check if exams are on the same date
        if (exam1.date === exam2.date) {
          const time1 = this.timeToMinutes(exam1.time);
          const time2 = this.timeToMinutes(exam2.time);
          const end1 = time1 + exam1.duration;
          const end2 = time2 + exam2.duration;

          // Check for time overlap
          if (time1 < end2 && time2 < end1) {
            conflicts.push({
              type: "exam_overlap",
              severity: "critical",
              title: "Exam Conflict",
              description: `Student has overlapping exams: ${exam1.course_code} and ${exam2.course_code} on ${exam1.date}`,
              affected_entities: [
                { type: "student", id: studentId },
                { type: "exam", id: exam1.id, name: `${exam1.course_code} ${exam1.type}` },
                { type: "exam", id: exam2.id, name: `${exam2.course_code} ${exam2.type}` },
              ],
              resolution_suggestions: [
                `Reschedule ${exam1.course_code} ${exam1.type} to a different date/time`,
                `Reschedule ${exam2.course_code} ${exam2.type} to a different date/time`,
                "Contact academic affairs for special arrangement",
              ],
              auto_resolvable: false,
            });
          }
        }
      }
    }

    return conflicts;
  }

  // =====================================================
  // PREREQUISITE VIOLATIONS
  // =====================================================

  /**
   * Check for prerequisite violations
   */
  checkPrerequisiteViolations(
    studentId: string,
    enrolledCourses: string[],
    completedCourses: string[],
    courseData: Map<string, SchedulerCourse>
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    for (const courseCode of enrolledCourses) {
      const course = courseData.get(courseCode);
      if (!course || !course.prerequisites || course.prerequisites.length === 0) {
        continue;
      }

      const missingPrereqs = course.prerequisites.filter(
        (prereq) => !completedCourses.includes(prereq)
      );

      if (missingPrereqs.length > 0) {
        conflicts.push({
          type: "prerequisite_violation",
          severity: "error",
          title: "Prerequisite Violation",
          description: `Student is enrolled in ${courseCode} (${course.name}) without completing prerequisite(s): ${missingPrereqs.join(", ")}`,
          affected_entities: [
            { type: "student", id: studentId },
            { type: "course", id: courseCode, name: course.name },
          ],
          resolution_suggestions: [
            `Remove ${courseCode} from student's schedule`,
            "Verify student's transcript for completed prerequisites",
            "Request prerequisite waiver from department",
          ],
          auto_resolvable: false,
        });
      }
    }

    return conflicts;
  }

  // =====================================================
  // CAPACITY VIOLATIONS
  // =====================================================

  /**
   * Check for section capacity violations
   */
  checkCapacityViolations(
    sections: Array<{
      section_id: string;
      course_code: string;
      capacity: number;
      enrolled_count: number;
    }>
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    for (const section of sections) {
      if (section.enrolled_count > section.capacity) {
        const overCapacity = section.enrolled_count - section.capacity;
        const percentOver = Math.round((overCapacity / section.capacity) * 100);

        conflicts.push({
          type: "capacity_exceeded",
          severity: percentOver > 20 ? "error" : "warning",
          title: "Section Capacity Exceeded",
          description: `Section ${section.section_id} for ${section.course_code} has ${section.enrolled_count} students enrolled but capacity is ${section.capacity} (${percentOver}% over capacity)`,
          affected_entities: [
            { type: "section", id: section.section_id, name: section.course_code },
          ],
          resolution_suggestions: [
            "Create an additional section for this course",
            `Increase room capacity (need room for ${section.enrolled_count} students)`,
            "Move some students to a different section",
          ],
          auto_resolvable: overCapacity <= 5, // Auto-resolvable if only slightly over
        });
      }
    }

    return conflicts;
  }

  // =====================================================
  // CONSTRAINT VIOLATIONS
  // =====================================================

  /**
   * Check for excessive daily load
   */
  checkExcessiveDailyLoad(
    studentId: string,
    sections: ScheduledSection[],
    maxDailyHours: number
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const dailyHours: Map<string, number> = new Map();

    // Calculate hours per day
    for (const section of sections) {
      for (const slot of section.time_slots) {
        const hours = this.calculateHours(slot.start_time, slot.end_time);
        const current = dailyHours.get(slot.day) || 0;
        dailyHours.set(slot.day, current + hours);
      }
    }

    // Check for violations
    for (const [day, hours] of dailyHours.entries()) {
      if (hours > maxDailyHours) {
        const coursesOnDay = sections
          .filter((s) => s.time_slots.some((t) => t.day === day))
          .map((s) => s.course_code);

        conflicts.push({
          type: "excessive_daily_load",
          severity: "warning",
          title: "Excessive Daily Load",
          description: `Student has ${hours.toFixed(1)} hours of classes on ${day}, exceeding the maximum of ${maxDailyHours} hours`,
          affected_entities: [
            { type: "student", id: studentId },
            ...coursesOnDay.map((code) => ({ type: "course" as const, id: code, name: code })),
          ],
          resolution_suggestions: [
            "Redistribute courses across different days",
            "Consider student preferences for class distribution",
            "Review scheduling constraints",
          ],
          auto_resolvable: true,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check for missing required courses
   */
  checkMissingRequiredCourses(
    studentId: string,
    studentLevel: number,
    enrolledCourses: string[],
    requiredCourses: string[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    const missingCourses = requiredCourses.filter(
      (courseCode) => !enrolledCourses.includes(courseCode)
    );

    if (missingCourses.length > 0) {
      conflicts.push({
        type: "missing_required_course",
        severity: "error",
        title: "Missing Required Courses",
        description: `Student (Level ${studentLevel}) is missing ${missingCourses.length} required course(s): ${missingCourses.join(", ")}`,
        affected_entities: [
          { type: "student", id: studentId },
          ...missingCourses.map((code) => ({ type: "course" as const, id: code, name: code })),
        ],
        resolution_suggestions: [
          "Add missing required courses to student's schedule",
          "Verify student's academic standing and exemptions",
          "Check if courses are offered this term",
        ],
        auto_resolvable: false,
      });
    }

    return conflicts;
  }

  // =====================================================
  // COMPREHENSIVE DETECTION
  // =====================================================

  /**
   * Run comprehensive conflict detection on a schedule
   */
  detectAllConflicts(params: {
    studentId: string;
    studentLevel: number;
    sections: ScheduledSection[];
    exams: ScheduledExam[];
    completedCourses: string[];
    requiredCourses: string[];
    courseData: Map<string, SchedulerCourse>;
    maxDailyHours?: number;
  }): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];

    // 1. Student schedule conflicts (time overlaps)
    conflicts.push(...this.checkStudentScheduleConflicts(params.studentId, params.sections));

    // 2. Exam conflicts
    conflicts.push(...this.checkExamConflicts(params.studentId, params.exams));

    // 3. Prerequisite violations
    const enrolledCourses = params.sections.map((s) => s.course_code);
    conflicts.push(
      ...this.checkPrerequisiteViolations(
        params.studentId,
        enrolledCourses,
        params.completedCourses,
        params.courseData
      )
    );

    // 4. Missing required courses
    conflicts.push(
      ...this.checkMissingRequiredCourses(
        params.studentId,
        params.studentLevel,
        enrolledCourses,
        params.requiredCourses
      )
    );

    // 5. Excessive daily load (if maxDailyHours specified)
    if (params.maxDailyHours) {
      conflicts.push(
        ...this.checkExcessiveDailyLoad(params.studentId, params.sections, params.maxDailyHours)
      );
    }

    return conflicts;
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Get a summary of all conflicts
   */
  summarizeConflicts(conflicts: ScheduleConflict[]): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    autoResolvable: number;
  } {
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let autoResolvable = 0;

    conflicts.forEach((conflict) => {
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
      bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
      if (conflict.auto_resolvable) {
        autoResolvable++;
      }
    });

    return {
      total: conflicts.length,
      byType,
      bySeverity,
      autoResolvable,
    };
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Calculate duration between two times in hours
   */
  private calculateHours(startTime: string, endTime: string): number {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return (end - start) / 60;
  }
}
