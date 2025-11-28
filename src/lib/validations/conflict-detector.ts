/**
 * Conflict Detector
 * Detects scheduling conflicts for SmartSchedule timetabling system
 * 
 * CONFLICT TYPES:
 * 1. Time Overlap - Two sections at same time
 * 2. Room Double-Booking - Same room used by multiple sections simultaneously
 * 3. Faculty Conflict - Faculty teaching multiple sections at same time
 * 4. Student Schedule Conflict - Student enrolled in conflicting sections
 */

export interface TimeSlot {
  day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
  start_time: string; // Format: "HH:MM"
  end_time: string;   // Format: "HH:MM"
}

export interface SectionTimeInfo {
  section_id: string;
  course_code: string;
  section_number: number;
  room_number?: string;
  instructor_id?: string;
  times: TimeSlot[];
}

export interface StudentScheduleInfo {
  student_id: string;
  sections: SectionTimeInfo[];
}

export interface Conflict {
  type: 'TIME_OVERLAP' | 'ROOM_DOUBLE_BOOKING' | 'FACULTY_CONFLICT' | 'STUDENT_CONFLICT';
  severity: 'HARD' | 'SOFT';
  description: string;
  affected_entities: string[];
  details: Record<string, any>;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  summary: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

/**
 * Check if two time slots overlap
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Must be same day
  if (slot1.day !== slot2.day) {
    return false;
  }
  
  // Convert times to comparable format (minutes since midnight)
  const slot1Start = timeToMinutes(slot1.start_time);
  const slot1End = timeToMinutes(slot1.end_time);
  const slot2Start = timeToMinutes(slot2.start_time);
  const slot2End = timeToMinutes(slot2.end_time);
  
  // Check for overlap
  // Overlap occurs if one starts before the other ends AND vice versa
  return slot1Start < slot2End && slot2Start < slot1End;
}

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Detect time overlap conflicts between sections
 */
export function detectTimeOverlapConflicts(sections: SectionTimeInfo[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Compare each pair of sections
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const section1 = sections[i];
      const section2 = sections[j];
      
      // Check each time slot combination
      for (const time1 of section1.times) {
        for (const time2 of section2.times) {
          if (doTimeSlotsOverlap(time1, time2)) {
            conflicts.push({
              type: 'TIME_OVERLAP',
              severity: 'HARD',
              description: `Sections ${section1.course_code}-${section1.section_number} and ${section2.course_code}-${section2.section_number} overlap on ${time1.day}`,
              affected_entities: [section1.section_id, section2.section_id],
              details: {
                section1: {
                  id: section1.section_id,
                  course: section1.course_code,
                  section: section1.section_number,
                  time: time1,
                },
                section2: {
                  id: section2.section_id,
                  course: section2.course_code,
                  section: section2.section_number,
                  time: time2,
                },
              },
            });
          }
        }
      }
    }
  }
  
  return conflicts;
}

/**
 * Detect room double-booking conflicts
 */
export function detectRoomDoubleBooking(sections: SectionTimeInfo[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Group sections by room
  const sectionsByRoom = new Map<string, SectionTimeInfo[]>();
  
  sections.forEach(section => {
    if (section.room_number) {
      if (!sectionsByRoom.has(section.room_number)) {
        sectionsByRoom.set(section.room_number, []);
      }
      sectionsByRoom.get(section.room_number)!.push(section);
    }
  });
  
  // Check each room for conflicts
  sectionsByRoom.forEach((roomSections, roomNumber) => {
    // Check each pair of sections in the same room
    for (let i = 0; i < roomSections.length; i++) {
      for (let j = i + 1; j < roomSections.length; j++) {
        const section1 = roomSections[i];
        const section2 = roomSections[j];
        
        // Check for time overlaps
        for (const time1 of section1.times) {
          for (const time2 of section2.times) {
            if (doTimeSlotsOverlap(time1, time2)) {
              conflicts.push({
                type: 'ROOM_DOUBLE_BOOKING',
                severity: 'HARD',
                description: `Room ${roomNumber} is double-booked on ${time1.day} at ${time1.start_time}`,
                affected_entities: [section1.section_id, section2.section_id],
                details: {
                  room: roomNumber,
                  section1: {
                    id: section1.section_id,
                    course: section1.course_code,
                    time: time1,
                  },
                  section2: {
                    id: section2.section_id,
                    course: section2.course_code,
                    time: time2,
                  },
                },
              });
            }
          }
        }
      }
    }
  });
  
  return conflicts;
}

/**
 * Detect faculty teaching conflicts
 */
export function detectFacultyConflicts(sections: SectionTimeInfo[]): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Group sections by instructor
  const sectionsByInstructor = new Map<string, SectionTimeInfo[]>();
  
  sections.forEach(section => {
    if (section.instructor_id) {
      if (!sectionsByInstructor.has(section.instructor_id)) {
        sectionsByInstructor.set(section.instructor_id, []);
      }
      sectionsByInstructor.get(section.instructor_id)!.push(section);
    }
  });
  
  // Check each instructor for conflicts
  sectionsByInstructor.forEach((instructorSections, instructorId) => {
    // Check each pair of sections taught by the same instructor
    for (let i = 0; i < instructorSections.length; i++) {
      for (let j = i + 1; j < instructorSections.length; j++) {
        const section1 = instructorSections[i];
        const section2 = instructorSections[j];
        
        // Check for time overlaps
        for (const time1 of section1.times) {
          for (const time2 of section2.times) {
            if (doTimeSlotsOverlap(time1, time2)) {
              conflicts.push({
                type: 'FACULTY_CONFLICT',
                severity: 'HARD',
                description: `Faculty member is scheduled to teach two sections at the same time on ${time1.day}`,
                affected_entities: [section1.section_id, section2.section_id],
                details: {
                  instructor_id: instructorId,
                  section1: {
                    id: section1.section_id,
                    course: section1.course_code,
                    section: section1.section_number,
                    time: time1,
                  },
                  section2: {
                    id: section2.section_id,
                    course: section2.course_code,
                    section: section2.section_number,
                    time: time2,
                  },
                },
              });
            }
          }
        }
      }
    }
  });
  
  return conflicts;
}

/**
 * Detect student schedule conflicts
 */
export function detectStudentScheduleConflicts(studentSchedule: StudentScheduleInfo): Conflict[] {
  const conflicts: Conflict[] = [];
  const sections = studentSchedule.sections;
  
  // Check each pair of sections in student's schedule
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const section1 = sections[i];
      const section2 = sections[j];
      
      // Check for time overlaps
      for (const time1 of section1.times) {
        for (const time2 of section2.times) {
          if (doTimeSlotsOverlap(time1, time2)) {
            conflicts.push({
              type: 'STUDENT_CONFLICT',
              severity: 'HARD',
              description: `Student has conflicting sections on ${time1.day}`,
              affected_entities: [section1.section_id, section2.section_id],
              details: {
                student_id: studentSchedule.student_id,
                section1: {
                  id: section1.section_id,
                  course: section1.course_code,
                  section: section1.section_number,
                  time: time1,
                },
                section2: {
                  id: section2.section_id,
                  course: section2.course_code,
                  section: section2.section_number,
                  time: time2,
                },
              },
            });
          }
        }
      }
    }
  }
  
  return conflicts;
}

/**
 * Comprehensive conflict detection
 */
export function detectAllConflicts(
  sections: SectionTimeInfo[],
  studentSchedules?: StudentScheduleInfo[]
): ConflictDetectionResult {
  const allConflicts: Conflict[] = [];
  
  // Detect time overlaps
  allConflicts.push(...detectTimeOverlapConflicts(sections));
  
  // Detect room double-bookings
  allConflicts.push(...detectRoomDoubleBooking(sections));
  
  // Detect faculty conflicts
  allConflicts.push(...detectFacultyConflicts(sections));
  
  // Detect student schedule conflicts if provided
  if (studentSchedules) {
    studentSchedules.forEach(schedule => {
      allConflicts.push(...detectStudentScheduleConflicts(schedule));
    });
  }
  
  // Calculate summary
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  
  allConflicts.forEach(conflict => {
    byType[conflict.type] = (byType[conflict.type] || 0) + 1;
    bySeverity[conflict.severity] = (bySeverity[conflict.severity] || 0) + 1;
  });
  
  return {
    hasConflicts: allConflicts.length > 0,
    conflicts: allConflicts,
    summary: {
      total: allConflicts.length,
      byType,
      bySeverity,
    },
  };
}

