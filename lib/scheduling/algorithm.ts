/**
 * SmartSchedule Scheduling Algorithm
 * 
 * This is a greedy constraint satisfaction algorithm that assigns:
 * - Meeting times (days and start times)
 * - Rooms
 * - Ensures no conflicts (room, instructor, student-level)
 * 
 * Priority order (from PRD):
 * 1. Student clashes (same level)
 * 2. Instructor clashes
 * 3. Room type fit (lecture vs lab)
 * 4. Instructor preferences (future enhancement)
 */

export interface TimeSlot {
  days: string[];
  start_time: string;
  duration: number;
}

export interface SectionAssignment {
  section_id: string;
  course_code: string;
  section_no: string;
  room_code: string | null;
  time_slot: TimeSlot;
  instructor_id: string | null;
  group_level: number;
  activity: 'lecture' | 'tutorial' | 'lab';
}

export interface SchedulingInput {
  sections: Array<{
    id: string;
    course_code: string;
    section_no: string;
    instructor_id: string | null;
    room_code: string | null;
    capacity: number;
    group_level: number;
    weekly_hours: number; // Total hours per week from course
    meeting_pattern: {
      days: string[];
      start: string;
      duration: number;
    };
    activity: 'lecture' | 'tutorial' | 'lab';
  }>;
  rooms: Array<{
    code: string;
    type: "Lecture" | "Lab";
    capacity: number;
  }>;
  timeGridConfig: {
    teaching_days: string[];
    daily_start_time: string;
    daily_end_time: string;
    slot_duration_minutes: number;
    break_start_time: string;
    break_end_time: string;
    typical_lab_duration_minutes: number;
    exam_days?: string[];
    exam_start_time?: string;
    exam_end_time?: string;
  };
}

export interface SchedulingResult {
  success: boolean;
  assignments: SectionAssignment[];
  unassigned: Array<{
    section_id: string;
    course_code: string;
    section_no: string;
    reason: string;
  }>;
  stats: {
    total_sections: number;
    assigned: number;
    unassigned: number;
    conflicts_resolved: number;
  };
}

/**
 * Generate all possible time slots based on time grid configuration
 * @param config Time grid configuration
 * @param weeklyHours Optional weekly hours to calculate duration per meeting (in hours)
 */
export function generateTimeSlots(config: SchedulingInput["timeGridConfig"], weeklyHours?: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { teaching_days, daily_start_time, daily_end_time, slot_duration_minutes } = config;

  // Parse times
  const [startHour, startMin] = daily_start_time.split(":").map(Number);
  const [endHour, endMin] = daily_end_time.split(":").map(Number);
  const [breakStartHour, breakStartMin] = config.break_start_time.split(":").map(Number);
  const [breakEndHour, breakEndMin] = config.break_end_time.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const breakStartMinutes = breakStartHour * 60 + breakStartMin;
  const breakEndMinutes = breakEndHour * 60 + breakEndMin;

  // Common day patterns (prioritize fewer days for efficiency)
  const dayPatterns = [
    ["Sunday", "Tuesday"],
    ["Monday", "Wednesday"],
    ["Sunday", "Tuesday", "Thursday"],
    ["Monday", "Wednesday"],
    ["Tuesday", "Thursday"],
  ].filter(pattern => pattern.every(day => teaching_days.includes(day)));

  // Calculate duration based on weekly_hours if provided
  if (weeklyHours !== undefined && weeklyHours > 0) {
    // For each day pattern, calculate duration per meeting based on weekly_hours
    for (const dayPattern of dayPatterns) {
      const numDays = dayPattern.length;
      // Duration per meeting = weekly_hours / number of days (convert to minutes)
      // Round to nearest 30 minutes for practical scheduling
      const durationPerMeetingHours = weeklyHours / numDays;
      const durationPerMeetingMinutes = Math.round(durationPerMeetingHours * 60);
      // Round to nearest 30 minutes
      const durationMinutes = Math.max(30, Math.round(durationPerMeetingMinutes / 30) * 30);

      // Generate slots for this pattern with calculated duration
      for (let currentMinutes = startMinutes; currentMinutes + durationMinutes <= endMinutes; currentMinutes += slot_duration_minutes) {
        const slotEndMinutes = currentMinutes + durationMinutes;

        // Skip slots that overlap with break time
        if (
          (currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes)
        ) {
          continue;
        }

        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;
        const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        slots.push({
          days: dayPattern,
          start_time: timeString,
          duration: durationMinutes,
        });
      }
    }
  } else {
    // Original behavior: use fixed slot_duration_minutes
    for (let currentMinutes = startMinutes; currentMinutes + slot_duration_minutes <= endMinutes; currentMinutes += slot_duration_minutes) {
      const slotEndMinutes = currentMinutes + slot_duration_minutes;

      // Skip slots that overlap with break time
      if (
        (currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes)
      ) {
        continue;
      }

      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      for (const dayPattern of dayPatterns) {
        slots.push({
          days: dayPattern,
          start_time: timeString,
          duration: slot_duration_minutes,
        });
      }
    }
  }

  return slots;
}

/**
 * Generate lab-specific time slots (typically longer duration, contiguous)
 */
export function generateLabTimeSlots(config: SchedulingInput["timeGridConfig"]): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const { teaching_days, daily_start_time, daily_end_time, typical_lab_duration_minutes } = config;

  const [startHour, startMin] = daily_start_time.split(":").map(Number);
  const [endHour, endMin] = daily_end_time.split(":").map(Number);
  const [breakStartHour, breakStartMin] = config.break_start_time.split(":").map(Number);
  const [breakEndHour, breakEndMin] = config.break_end_time.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const breakStartMinutes = breakStartHour * 60 + breakStartMin;
  const breakEndMinutes = breakEndHour * 60 + breakEndMin;

  // Labs typically meet once per week
  const singleDayPatterns = teaching_days.map(day => [day]);

  for (let currentMinutes = startMinutes; currentMinutes + typical_lab_duration_minutes <= endMinutes; currentMinutes += 30) {
    const slotEndMinutes = currentMinutes + typical_lab_duration_minutes;

    // Skip slots that overlap with break time
    if (
      (currentMinutes < breakEndMinutes && slotEndMinutes > breakStartMinutes)
    ) {
      continue;
    }

    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    for (const dayPattern of singleDayPatterns) {
      slots.push({
        days: dayPattern,
        start_time: timeString,
        duration: typical_lab_duration_minutes,
      });
    }
  }

  return slots;
}

/**
 * Check if a time slot assignment would create conflicts
 */
export async function checkSlotConflicts(
  sectionId: string,
  roomCode: string | null,
  instructorId: string | null,
  groupLevel: number,
  timeSlot: TimeSlot,
  currentAssignments: SectionAssignment[]
): Promise<{ hasConflict: boolean; conflictTypes: string[] }> {
  const conflictTypes: string[] = [];

  // Check room conflicts
  if (roomCode) {
    const roomConflict = currentAssignments.some(
      (assignment) =>
        assignment.room_code === roomCode &&
        assignment.section_id !== sectionId &&
        doTimeSlotsOverlap(assignment.time_slot, timeSlot)
    );
    if (roomConflict) conflictTypes.push("room");
  }

  // Check instructor conflicts
  if (instructorId) {
    const instructorConflict = currentAssignments.some(
      (assignment) =>
        assignment.instructor_id === instructorId &&
        assignment.section_id !== sectionId &&
        doTimeSlotsOverlap(assignment.time_slot, timeSlot)
    );
    if (instructorConflict) conflictTypes.push("instructor");
  }

  // Check student level conflicts
  const studentConflict = currentAssignments.some(
    (assignment) =>
      assignment.group_level === groupLevel &&
      assignment.section_id !== sectionId &&
      doTimeSlotsOverlap(assignment.time_slot, timeSlot)
  );
  if (studentConflict) conflictTypes.push("student_level");

  return {
    hasConflict: conflictTypes.length > 0,
    conflictTypes,
  };
}

/**
 * Check if two time slots overlap
 */
function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  // Check if days overlap
  const daysOverlap = slot1.days.some((day) => slot2.days.includes(day));
  if (!daysOverlap) return false;

  // Check if times overlap
  const [h1, m1] = slot1.start_time.split(":").map(Number);
  const [h2, m2] = slot2.start_time.split(":").map(Number);

  const start1 = h1 * 60 + m1;
  const end1 = start1 + slot1.duration;
  const start2 = h2 * 60 + m2;
  const end2 = start2 + slot2.duration;

  return start1 < end2 && start2 < end1;
}

/**
 * Find suitable room for a section
 */
function findSuitableRoom(
  section: SchedulingInput["sections"][0],
  rooms: SchedulingInput["rooms"],
  timeSlot: TimeSlot,
  currentAssignments: SectionAssignment[]
): string | null {
  // Filter rooms by type (lab vs lecture)
  const suitableRooms = rooms.filter(
    (room) =>
      (section.activity === 'lab' && room.type === "Lab") ||
      (section.activity !== 'lab' && room.type === "Lecture")
  );

  // Sort by capacity (prefer closer match to section capacity)
  const sortedRooms = suitableRooms
    .filter((room) => room.capacity >= section.capacity)
    .sort((a, b) => Math.abs(a.capacity - section.capacity) - Math.abs(b.capacity - section.capacity));

  // Find first available room
  for (const room of sortedRooms) {
    const isAvailable = !currentAssignments.some(
      (assignment) =>
        assignment.room_code === room.code &&
        doTimeSlotsOverlap(assignment.time_slot, timeSlot)
    );

    if (isAvailable) {
      return room.code;
    }
  }

  return null;
}

/**
 * Main scheduling algorithm - greedy constraint satisfaction
 */
export async function generateSchedule(input: SchedulingInput): Promise<SchedulingResult> {
  const assignments: SectionAssignment[] = [];
  const unassigned: SchedulingResult["unassigned"] = [];

  // Sort sections by priority
  // 1. By level (lower levels first)
  // 2. By type (lectures before labs for more flexibility)
  const sortedSections = [...input.sections].sort((a, b) => {
    if (a.group_level !== b.group_level) {
      return a.group_level - b.group_level;
    }
    // Sort by activity: lecture, tutorial, lab
    const activityOrder = { lecture: 0, tutorial: 1, lab: 2 };
    if (a.activity !== b.activity) {
      return activityOrder[a.activity] - activityOrder[b.activity];
    }
    return 0;
  });

  // Generate available time slots (base slots without weekly_hours for fallback)
  const baseLectureSlots = generateTimeSlots(input.timeGridConfig);
  const labSlots = generateLabTimeSlots(input.timeGridConfig);

  // Try to assign each section
  for (const section of sortedSections) {
    let assigned = false;

    // Check if section already has a meeting pattern (manually assigned)
    const hasExistingAssignment =
      section.meeting_pattern.days.length > 0 &&
      section.meeting_pattern.start &&
      section.meeting_pattern.duration > 0;

    if (hasExistingAssignment) {
      // Validate existing assignment for conflicts
      const existingTimeSlot: TimeSlot = {
        days: section.meeting_pattern.days,
        start_time: section.meeting_pattern.start,
        duration: section.meeting_pattern.duration,
      };

      const conflictCheck = await checkSlotConflicts(
        section.id,
        section.room_code,
        section.instructor_id,
        section.group_level,
        existingTimeSlot,
        assignments
      );

      if (!conflictCheck.hasConflict) {
        // Existing assignment is valid, keep it
        assignments.push({
          section_id: section.id,
          course_code: section.course_code,
          section_no: section.section_no,
          room_code: section.room_code,
          time_slot: existingTimeSlot,
          instructor_id: section.instructor_id,
          group_level: section.group_level,
          activity: section.activity,
        });
        assigned = true;
      } else {
        // Existing assignment has conflicts, will try to reassign below
        // Continue to try reassignment
      }
    }

    // If not assigned yet (either no existing assignment or existing has conflicts), try to assign
    if (!assigned) {
      // Generate slots specific to this section's weekly_hours if it's a lecture
      let availableSlots: TimeSlot[];
      if (section.activity === 'lab') {
        availableSlots = labSlots;
      } else {
        // For lectures, generate slots based on weekly_hours
        if (section.weekly_hours && section.weekly_hours > 0) {
          availableSlots = generateTimeSlots(input.timeGridConfig, section.weekly_hours);
          // If no slots generated (e.g., weekly_hours too large), fall back to base slots
          if (availableSlots.length === 0) {
            availableSlots = baseLectureSlots;
          }
        } else {
          availableSlots = baseLectureSlots;
        }
      }

      // Try each time slot until we find one without conflicts
      for (const timeSlot of availableSlots) {
        const conflictCheck = await checkSlotConflicts(
          section.id,
          section.room_code,
          section.instructor_id,
          section.group_level,
          timeSlot,
          assignments
        );

        if (!conflictCheck.hasConflict) {
          // Find suitable room if not already assigned
          const roomCode = section.room_code || findSuitableRoom(section, input.rooms, timeSlot, assignments);

          if (roomCode || section.activity !== 'lab') {
            // Assign this section
            assignments.push({
              section_id: section.id,
              course_code: section.course_code,
              section_no: section.section_no,
              room_code: roomCode,
              time_slot: timeSlot,
              instructor_id: section.instructor_id,
              group_level: section.group_level,
              activity: section.activity,
            });
            assigned = true;
            break;
          }
        }
      }
    }

    if (!assigned) {
      const reason = hasExistingAssignment
        ? "Existing assignment has conflicts and no alternative time slot available"
        : "No conflict-free time slot available";
      unassigned.push({
        section_id: section.id,
        course_code: section.course_code,
        section_no: section.section_no,
        reason,
      });
    }
  }

  return {
    success: unassigned.length === 0,
    assignments,
    unassigned,
    stats: {
      total_sections: input.sections.length,
      assigned: assignments.length,
      unassigned: unassigned.length,
      conflicts_resolved: input.sections.length - unassigned.length,
    },
  };
}

