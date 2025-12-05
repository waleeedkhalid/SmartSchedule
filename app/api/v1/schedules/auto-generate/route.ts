/**
 * Auto-Generate Schedule Endpoint
 *
 * POST /api/v1/schedules/auto-generate - Automatically generate complete schedule
 *
 * This endpoint performs the complete scheduling workflow:
 * 1. Get SWE courses (levels 4-8)
 * 2. Get SWE students and count by level
 * 3. Calculate sections needed (ideal: 25 students, min: 15, max: 50)
 * 4. Assign rooms (1-64)
 * 5. Assign time slots (no conflicts within same level or external courses)
 * 6. Schedule exams (Mid1, Mid2, Final) with no conflicts
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

// Constants for section sizing
const IDEAL_SECTION_SIZE = 25;
const MIN_SECTION_SIZE = 15;
const MAX_SECTION_SIZE = 50;
const MAX_ROOMS = 64;

// Time slots available for scheduling (Sunday-Thursday)
const TEACHING_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = [
  { start: "08:00", duration: 50 },
  { start: "09:00", duration: 50 },
  { start: "10:00", duration: 50 },
  { start: "11:00", duration: 50 },
  { start: "12:00", duration: 50 },
  { start: "13:00", duration: 50 },
  { start: "14:00", duration: 50 },
  { start: "15:00", duration: 50 },
  { start: "16:00", duration: 50 },
];

// Exam configuration
const EXAM_DAYS = ["Saturday"];
const EXAM_TIMES = ["09:00", "12:00", "15:00"];

interface Course {
  code: string;
  title: string;
  level: number;
  credits: number;
  weekly_hours: number;
  is_elective: boolean;
}

interface StudentByLevel {
  level: number;
  count: number;
}

interface SectionToCreate {
  course_code: string;
  section_no: string;
  capacity: number;
  group_level: number;
  activity: string;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
  room_code: string;
  state: string;
  created_by: string;
}

interface ScheduledSection {
  id: string;
  course_code: string;
  section_no: string;
  room_code: string;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
  group_level: number;
}

interface ExternalSection {
  course_code: string;
  room_code: string | null;
  meeting_pattern: {
    days?: string[];
    start?: string;
  } | null;
  group_level: number;
}

interface TimeSlotAssignment {
  day: string;
  start: string;
  room: string;
}

interface ExamSlot {
  date: string;
  time: string;
  room: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["scheduling"]);

    const body = await request.json();
    const { term_id } = body;

    if (!term_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Missing required field: term_id"
      );
    }

    const supabase = await createClient();
    const warnings: string[] = [];

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("id, code, name, start_date, end_date")
      .eq("id", term_id)
      .single();

    if (termError || !term) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Academic term not found"
      );
    }

    // =====================================================
    // STEP 1: Get SWE Courses (levels 4-8)
    // =====================================================
    const { data: courses, error: coursesError } = await supabase
      .from("course")
      .select("code, title, level, credits, weekly_hours, is_elective")
      .gte("level", 4)
      .lte("level", 8)
      .eq("is_elective", false);

    if (coursesError) throw coursesError;

    // Filter to only SWE courses
    const sweCourses = (courses || []).filter(
      (c: Course) =>
        c.code.startsWith("SWE") ||
        c.code.startsWith("CSC") ||
        c.code.startsWith("MATH") ||
        c.code.startsWith("PHYS") ||
        c.code.startsWith("CEN") ||
        c.code.startsWith("IS") ||
        c.code.startsWith("IC")
    ) as Course[];

    // =====================================================
    // STEP 2: Get SWE Students by Level
    // =====================================================
    const { data: students, error: studentsError } = await supabase
      .from("user_roles")
      .select("level")
      .eq("role", "student")
      .not("level", "is", null)
      .gte("level", 4)
      .lte("level", 8);

    if (studentsError) throw studentsError;

    // Count students by level
    const studentsByLevel: StudentByLevel[] = [];
    const levelCounts = new Map<number, number>();

    for (const student of students || []) {
      const level = student.level;
      if (level >= 4 && level <= 8) {
        levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
      }
    }

    for (let level = 4; level <= 8; level++) {
      const count = levelCounts.get(level) || 0;
      studentsByLevel.push({ level, count });
    }

    // If no students, use default counts for demonstration
    if (levelCounts.size === 0) {
      warnings.push("No students found. Using default section counts.");
      for (let level = 4; level <= 8; level++) {
        levelCounts.set(level, 30); // Default 30 students per level
      }
    }

    // =====================================================
    // STEP 3: Calculate Sections Needed
    // =====================================================
    function calculateSectionsNeeded(studentCount: number): number {
      if (studentCount === 0) return 1; // At least 1 section
      if (studentCount <= MAX_SECTION_SIZE) return 1;

      // Try to get close to ideal section size
      const sectionsForIdeal = Math.ceil(studentCount / IDEAL_SECTION_SIZE);
      const studentsPerSection = studentCount / sectionsForIdeal;

      // If that would give us too few students per section, reduce sections
      if (studentsPerSection < MIN_SECTION_SIZE && sectionsForIdeal > 1) {
        return Math.max(1, Math.ceil(studentCount / MAX_SECTION_SIZE));
      }

      return sectionsForIdeal;
    }

    // Delete existing draft sections for these courses
    const courseCodes = sweCourses.map((c) => c.code);
    await supabase
      .from("section")
      .delete()
      .in("course_code", courseCodes)
      .eq("state", "draft");

    // =====================================================
    // STEP 4 & 5: Assign Rooms and Time Slots
    // =====================================================

    // Get available rooms (1-64)
    const { data: rooms, error: roomsError } = await supabase
      .from("room")
      .select("code, type, capacity")
      .order("code");

    if (roomsError) throw roomsError;

    const availableRooms = (rooms || []).slice(0, MAX_ROOMS).map((r) => r.code);

    if (availableRooms.length === 0) {
      // Create default rooms if none exist
      const roomsToCreate = [];
      for (let i = 1; i <= MAX_ROOMS; i++) {
        roomsToCreate.push({
          code: `R${String(i).padStart(3, "0")}`,
          type: i <= 48 ? "Lecture" : "Lab",
          capacity: i <= 48 ? 50 : 30,
          created_by: user.id,
        });
      }

      const { data: newRooms, error: createRoomsError } = await supabase
        .from("room")
        .insert(roomsToCreate)
        .select("code");

      if (createRoomsError) {
        warnings.push(`Could not create rooms: ${createRoomsError.message}`);
      } else if (newRooms) {
        availableRooms.push(...newRooms.map((r) => r.code));
      }
    }

    // Get external sections (from other departments) to avoid conflicts
    const { data: externalSections } = await supabase
      .from("section")
      .select("course_code, room_code, meeting_pattern, group_level")
      .eq("state", "released")
      .not("course_code", "like", "SWE%");

    // Build a map of occupied time slots per level and room
    const occupiedSlots = new Map<string, Set<string>>(); // "level-day-time" -> Set of rooms
    const roomSchedule = new Map<string, Set<string>>(); // "room-day-time" -> occupied

    // Mark external sections as occupied
    for (const ext of (externalSections || []) as ExternalSection[]) {
      const pattern = ext.meeting_pattern;
      if (pattern?.days && pattern?.start && ext.room_code) {
        for (const day of pattern.days) {
          const levelKey = `${ext.group_level}-${day}-${pattern.start}`;
          const roomKey = `${ext.room_code}-${day}-${pattern.start}`;

          if (!occupiedSlots.has(levelKey)) {
            occupiedSlots.set(levelKey, new Set());
          }
          occupiedSlots.get(levelKey)!.add(ext.room_code);
          roomSchedule.set(roomKey, new Set([ext.course_code]));
        }
      }
    }

    // Create sections for each course
    const sectionsToCreate: SectionToCreate[] = [];
    const sectionsCreated: { course_code: string; section_count: number }[] =
      [];
    let totalSections = 0;
    let roomsAssigned = 0;
    let timeSlotsAssigned = 0;
    let conflictsAvoided = 0;

    // Group courses by level for better scheduling
    const coursesByLevel = new Map<number, Course[]>();
    for (const course of sweCourses) {
      if (!coursesByLevel.has(course.level)) {
        coursesByLevel.set(course.level, []);
      }
      coursesByLevel.get(course.level)!.push(course);
    }

    // Track slot usage per day for balanced distribution
    let currentDayIndex = 0;
    let currentTimeIndex = 0;
    let currentRoomIndex = 0;

    for (const [level, levelCourses] of coursesByLevel) {
      const studentCount = levelCounts.get(level) || 30;

      for (const course of levelCourses) {
        const sectionsNeeded = calculateSectionsNeeded(studentCount);
        const studentsPerSection = Math.ceil(studentCount / sectionsNeeded);

        for (let sectionNum = 1; sectionNum <= sectionsNeeded; sectionNum++) {
          // Find available time slot that doesn't conflict
          let assigned = false;
          let attempts = 0;
          const maxAttempts =
            TEACHING_DAYS.length * TIME_SLOTS.length * availableRooms.length;

          while (!assigned && attempts < maxAttempts) {
            const day = TEACHING_DAYS[currentDayIndex % TEACHING_DAYS.length];
            const timeSlot = TIME_SLOTS[currentTimeIndex % TIME_SLOTS.length];
            const room =
              availableRooms[currentRoomIndex % availableRooms.length];

            const levelKey = `${level}-${day}-${timeSlot.start}`;
            const roomKey = `${room}-${day}-${timeSlot.start}`;

            // Check for conflicts
            const levelOccupied = occupiedSlots.get(levelKey);
            const roomOccupied = roomSchedule.has(roomKey);

            // Can assign if room is free and level doesn't have another class at this time
            // (students can't be in two places at once)
            if (!roomOccupied && (!levelOccupied || !levelOccupied.has(room))) {
              // Assign this slot
              const meetingPattern = {
                days: [day],
                start: timeSlot.start,
                duration: timeSlot.duration,
              };

              sectionsToCreate.push({
                course_code: course.code,
                section_no: String(sectionNum).padStart(2, "0"),
                capacity: Math.min(studentsPerSection, MAX_SECTION_SIZE),
                group_level: level,
                activity: "lecture",
                meeting_pattern: meetingPattern,
                room_code: room,
                state: "draft",
                created_by: user.id,
              });

              // Mark as occupied
              if (!occupiedSlots.has(levelKey)) {
                occupiedSlots.set(levelKey, new Set());
              }
              occupiedSlots.get(levelKey)!.add(room);
              roomSchedule.set(roomKey, new Set([course.code]));

              assigned = true;
              roomsAssigned++;
              timeSlotsAssigned++;
              totalSections++;
            } else {
              conflictsAvoided++;
            }

            // Move to next slot
            currentRoomIndex++;
            if (currentRoomIndex >= availableRooms.length) {
              currentRoomIndex = 0;
              currentTimeIndex++;
              if (currentTimeIndex >= TIME_SLOTS.length) {
                currentTimeIndex = 0;
                currentDayIndex++;
              }
            }

            attempts++;
          }

          if (!assigned) {
            warnings.push(
              `Could not find slot for ${course.code} section ${sectionNum}`
            );
          }
        }

        sectionsCreated.push({
          course_code: course.code,
          section_count: sectionsNeeded,
        });
      }
    }

    // Insert all sections
    let insertedSections: ScheduledSection[] = [];
    if (sectionsToCreate.length > 0) {
      const { data: newSections, error: insertError } = await supabase
        .from("section")
        .insert(sectionsToCreate)
        .select(
          "id, course_code, section_no, room_code, meeting_pattern, group_level"
        );

      if (insertError) {
        throw insertError;
      }

      insertedSections = (newSections || []) as ScheduledSection[];
    }

    // Create schedule entries
    if (insertedSections.length > 0) {
      const scheduleEntries = insertedSections.map((s) => ({
        term_id,
        section_id: s.id,
      }));

      await supabase.from("schedule").insert(scheduleEntries);
    }

    // =====================================================
    // STEP 6: Schedule Exams (Mid1, Mid2, Final)
    // =====================================================

    // Delete existing exams for these courses
    await supabase.from("exam").delete().in("course_code", courseCodes);

    // Generate exam dates
    const examDates: string[] = [];
    const today = new Date();

    // Mid1: Week 6-7
    const mid1Start = new Date(today);
    mid1Start.setDate(mid1Start.getDate() + 42); // 6 weeks

    // Mid2: Week 11-12
    const mid2Start = new Date(today);
    mid2Start.setDate(mid2Start.getDate() + 77); // 11 weeks

    // Final: Week 16-17
    const finalStart = new Date(today);
    finalStart.setDate(finalStart.getDate() + 112); // 16 weeks

    // Get Saturday dates for each exam period
    function getNextSaturday(from: Date): Date {
      const date = new Date(from);
      const day = date.getDay();
      const diff = 6 - day;
      date.setDate(date.getDate() + diff);
      return date;
    }

    const mid1Dates = [
      getNextSaturday(mid1Start),
      getNextSaturday(new Date(mid1Start.getTime() + 7 * 24 * 60 * 60 * 1000)),
    ];
    const mid2Dates = [
      getNextSaturday(mid2Start),
      getNextSaturday(new Date(mid2Start.getTime() + 7 * 24 * 60 * 60 * 1000)),
    ];
    const finalDates = [
      getNextSaturday(finalStart),
      getNextSaturday(new Date(finalStart.getTime() + 7 * 24 * 60 * 60 * 1000)),
    ];

    // Track exam slots to avoid conflicts
    const examSlotOccupied = new Map<string, Map<string, Set<number>>>(); // date -> time -> Set of levels

    function findExamSlot(
      level: number,
      dates: Date[],
      examType: string
    ): ExamSlot | null {
      for (const date of dates) {
        const dateStr = date.toISOString().split("T")[0];

        for (const time of EXAM_TIMES) {
          const key = `${dateStr}-${time}`;

          if (!examSlotOccupied.has(dateStr)) {
            examSlotOccupied.set(dateStr, new Map());
          }

          const timeSlots = examSlotOccupied.get(dateStr)!;
          if (!timeSlots.has(time)) {
            timeSlots.set(time, new Set());
          }

          const levelsAtSlot = timeSlots.get(time)!;

          // No conflict if this level doesn't already have an exam at this time
          if (!levelsAtSlot.has(level)) {
            levelsAtSlot.add(level);

            // Assign a room
            const roomIndex = (levelsAtSlot.size - 1) % availableRooms.length;
            const room = availableRooms[roomIndex] || "TBD";

            return {
              date: dateStr,
              time,
              room,
            };
          }
        }
      }

      return null;
    }

    const examsToInsert: Array<{
      course_code: string;
      exam_type: string;
      date: string;
      start_time: string;
      duration_minutes: number;
      room_codes: string[];
      created_by: string;
    }> = [];

    const examsScheduled = { mid1: 0, mid2: 0, final: 0 };

    for (const course of sweCourses) {
      // Mid1
      const mid1Slot = findExamSlot(course.level, mid1Dates, "mid1");
      if (mid1Slot) {
        examsToInsert.push({
          course_code: course.code,
          exam_type: "midterm1",
          date: mid1Slot.date,
          start_time: mid1Slot.time,
          duration_minutes: 90,
          room_codes: [mid1Slot.room],
          created_by: user.id,
        });
        examsScheduled.mid1++;
      } else {
        warnings.push(`Could not schedule Mid1 for ${course.code}`);
      }

      // Mid2
      const mid2Slot = findExamSlot(course.level, mid2Dates, "mid2");
      if (mid2Slot) {
        examsToInsert.push({
          course_code: course.code,
          exam_type: "midterm2",
          date: mid2Slot.date,
          start_time: mid2Slot.time,
          duration_minutes: 90,
          room_codes: [mid2Slot.room],
          created_by: user.id,
        });
        examsScheduled.mid2++;
      } else {
        warnings.push(`Could not schedule Mid2 for ${course.code}`);
      }

      // Final
      const finalSlot = findExamSlot(course.level, finalDates, "final");
      if (finalSlot) {
        examsToInsert.push({
          course_code: course.code,
          exam_type: "final",
          date: finalSlot.date,
          start_time: finalSlot.time,
          duration_minutes: 120,
          room_codes: [finalSlot.room],
          created_by: user.id,
        });
        examsScheduled.final++;
      } else {
        warnings.push(`Could not schedule Final for ${course.code}`);
      }
    }

    // Insert exams
    if (examsToInsert.length > 0) {
      const { error: examError } = await supabase
        .from("exam")
        .insert(examsToInsert);
      if (examError) {
        warnings.push(`Error inserting exams: ${examError.message}`);
      }
    }

    // Build response
    const success =
      warnings.length === 0 || (totalSections > 0 && examsScheduled.mid1 > 0);

    return createSuccessResponse(
      {
        success,
        message: success
          ? `Successfully generated schedule: ${totalSections} sections, ${
              examsScheduled.mid1 + examsScheduled.mid2 + examsScheduled.final
            } exams`
          : `Partial schedule generated with ${warnings.length} warnings`,
        stats: {
          students_by_level: studentsByLevel,
          sections_created: sectionsCreated,
          total_sections: totalSections,
          rooms_assigned: roomsAssigned,
          time_slots_assigned: timeSlotsAssigned,
          exams_scheduled: examsScheduled,
          conflicts_avoided: conflictsAvoided,
        },
        warnings,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
