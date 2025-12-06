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
  instructor_id?: string;
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

interface Faculty {
  id: string;
  name: string;
  max_load_per_week: number;
  unavailable_times: any;
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

    // Verify term exists and get start date
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

    if (!term.start_date) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "Academic term must have a start date"
      );
    }

    // Get scheduling configuration
    const { data: configData, error: configError } = await supabase
      .from("time_grid_config")
      .select("*")
      .limit(1)
      .single();

    if (configError || !configData) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Scheduling configuration not found"
      );
    }

    // Parse configuration
    const teachingDays = configData.teaching_days || ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const slotDuration = configData.slot_duration_minutes || 50;

    // Generate time slots based on config
    const timeSlots: { start: string; duration: number }[] = [];
    const [startHour, startMinute] = (configData.daily_start_time || "08:00").split(":").map(Number);
    const [endHour, endMinute] = (configData.daily_end_time || "17:00").split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      // Format time string HH:MM
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;

      // Add slot if it fits before end time
      const endTimeInMinutes = endHour * 60 + endMinute;
      const slotEndInMinutes = currentHour * 60 + currentMinute + slotDuration;

      if (slotEndInMinutes <= endTimeInMinutes) {
        timeSlots.push({ start: timeStr, duration: slotDuration });
      }

      // Move to next slot (assuming slots are contiguous for now, or add break logic if needed)
      // For simplicity, we'll just add duration + 10 mins break if not specified
      const nextTimeInMinutes = slotEndInMinutes + 10;
      currentHour = Math.floor(nextTimeInMinutes / 60);
      currentMinute = nextTimeInMinutes % 60;
    }

    // =====================================================
    // STEP 1: Get SWE Courses (levels 4-8)
    // =====================================================
    const { data: coursesData, error: coursesError } = await supabase
      .from("course")
      .select("code, title, recommended_level, credits, weekly_hours, is_elective")
      .gte("recommended_level", 4)
      .lte("recommended_level", 8)
      .eq("is_elective", false);

    if (coursesError) throw coursesError;

    const courses: Course[] = (coursesData || []).map((c) => ({
      code: c.code,
      title: c.title,
      level: c.recommended_level || 0,
      credits: c.credits,
      weekly_hours: c.weekly_hours,
      is_elective: c.is_elective,
    }));

    // Filter to only SWE courses
    const sweCourses = (courses || []).filter(
      (c: Course) =>
        c.code.startsWith("SWE")
    ) as Course[];

    // =====================================================
    // STEP 2: Get SWE Students by Level
    // =====================================================
    // FIX: Use student_profile instead of user_roles for level
    const { data: students, error: studentsError } = await supabase
      .from("student_profile")
      .select("user_id, level")
      .gte("level", 4)
      .lte("level", 8);

    if (studentsError) throw studentsError;

    // Store students by level for enrollment
    const studentsByLevelMap = new Map<number, string[]>(); // level -> studentIds

    // Count students by level
    const studentsByLevel: StudentByLevel[] = [];
    const levelCounts = new Map<number, number>();

    for (const student of students || []) {
      const level = student.level;
      if (level >= 4 && level <= 8) {
        levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
        // Also store student ID for enrollment
        if (!studentsByLevelMap.has(level)) {
          studentsByLevelMap.set(level, []);
        }
        studentsByLevelMap.get(level)!.push(student.user_id);
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
    // STEP 3.5: Get Faculty for Assignment
    // =====================================================
    const { data: facultyData, error: facultyError } = await supabase
      .from("faculty_profile")
      .select("id, name, max_load_per_week, unavailable_times");

    if (facultyError) throw facultyError;

    const facultyList: Faculty[] = (facultyData || []).map((f) => ({
      id: f.id,
      name: f.name || "Unknown Faculty",
      max_load_per_week: f.max_load_per_week || 12, // Default 12 hours max load
      unavailable_times: f.unavailable_times,
    }));

    // Track instructor load and schedule
    const instructorLoad = new Map<string, number>(); // instructorId -> current load (hours)
    const instructorSchedule = new Map<string, Set<string>>(); // instructorId -> Set("day-time")

    // Initialize load
    for (const f of facultyList) {
      instructorLoad.set(f.id, 0);
      instructorSchedule.set(f.id, new Set());
    }

    // =====================================================
    // STEP 4 & 5: Assign Rooms, Time Slots, and Instructors
    // =====================================================

    // Get available rooms (1-64)
    // FIX: Remove capacity from selection as it doesn't exist
    const { data: rooms, error: roomsError } = await supabase
      .from("room")
      .select("code, type")
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
          // capacity removed from insert
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
            teachingDays.length * timeSlots.length * availableRooms.length;

          while (!assigned && attempts < maxAttempts) {
            const day = teachingDays[currentDayIndex % teachingDays.length];
            const timeSlot = timeSlots[currentTimeIndex % timeSlots.length];
            const room =
              availableRooms[currentRoomIndex % availableRooms.length];

            const levelKey = `${level}-${day}-${timeSlot.start}`;
            const roomKey = `${room}-${day}-${timeSlot.start}`;

            // Check for conflicts
            const levelOccupied = occupiedSlots.get(levelKey);
            const roomOccupied = roomSchedule.has(roomKey);

            // STRICT CONFLICT CHECK:
            // 1. Room must be free.
            // 2. Level must be completely free (no other class for this level at this time).
            if (!roomOccupied && !levelOccupied) {

              // Find an instructor
              let assignedInstructorId: string | undefined;

              // Sort faculty by current load (ascending) to balance load
              const sortedFaculty = [...facultyList].sort((a, b) => {
                return (instructorLoad.get(a.id) || 0) - (instructorLoad.get(b.id) || 0);
              });

              for (const faculty of sortedFaculty) {
                const currentLoad = instructorLoad.get(faculty.id) || 0;

                // Check if faculty has capacity
                if (currentLoad + course.weekly_hours <= faculty.max_load_per_week) {
                  // Check if faculty is free at this time
                  const facultySchedule = instructorSchedule.get(faculty.id)!;
                  const timeKey = `${day}-${timeSlot.start}`;

                  if (!facultySchedule.has(timeKey)) {
                    assignedInstructorId = faculty.id;

                    // Update faculty load and schedule
                    instructorLoad.set(faculty.id, currentLoad + course.weekly_hours);
                    facultySchedule.add(timeKey);
                    break;
                  }
                }
              }

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
                instructor_id: assignedInstructorId,
                state: "draft",
                created_by: user.id,
              });

              if (!assignedInstructorId) {
                warnings.push(`No instructor available for ${course.code} section ${sectionNum}`);
              }

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
              if (currentTimeIndex >= timeSlots.length) {
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
    // STEP 5.5: Enroll Students by Level
    // =====================================================
    let totalEnrollments = 0;

    // Group inserted sections by level and course
    const sectionsByLevelAndCourse = new Map<string, ScheduledSection[]>();
    for (const section of insertedSections) {
      const key = `${section.group_level}-${section.course_code}`;
      if (!sectionsByLevelAndCourse.has(key)) {
        sectionsByLevelAndCourse.set(key, []);
      }
      sectionsByLevelAndCourse.get(key)!.push(section);
    }

    // For each level, enroll students in courses for their level
    for (const [level, studentIds] of studentsByLevelMap) {
      // Get all courses for this level
      const levelCourses = sweCourses.filter(c => c.level === level);

      for (const course of levelCourses) {
        const key = `${level}-${course.code}`;
        const courseSections = sectionsByLevelAndCourse.get(key) || [];

        if (courseSections.length === 0) continue;

        // Distribute students across sections
        const studentsPerSection = Math.ceil(studentIds.length / courseSections.length);
        const enrollmentsToInsert: Array<{
          student_id: string;
          section_id: string;
          status: string;
        }> = [];

        studentIds.forEach((studentId, idx) => {
          const sectionIdx = Math.floor(idx / studentsPerSection) % courseSections.length;
          const section = courseSections[sectionIdx];

          enrollmentsToInsert.push({
            student_id: studentId,
            section_id: section.id,
            status: "registered",
          });
        });

        if (enrollmentsToInsert.length > 0) {
          // Delete existing enrollments for these students in sections of this course
          const sectionIds = courseSections.map(s => s.id);
          await supabase
            .from("student_enrollment")
            .delete()
            .in("student_id", studentIds)
            .in("section_id", sectionIds);

          // Insert new enrollments
          const { error: enrollError } = await supabase
            .from("student_enrollment")
            .insert(enrollmentsToInsert);

          if (enrollError) {
            warnings.push(`Error enrolling students in ${course.code}: ${enrollError.message}`);
          } else {
            totalEnrollments += enrollmentsToInsert.length;
          }
        }
      }
    }

    // =====================================================
    // STEP 6: Schedule Exams (Mid1, Mid2, Final)
    // =====================================================

    // Delete existing exams for these courses
    await supabase.from("exam").delete().in("course_code", courseCodes);

    // Generate exam dates based on term start date
    const termStartDate = new Date(term.start_date);

    // Mid1: Week 6-7
    const mid1Start = new Date(termStartDate);
    mid1Start.setDate(mid1Start.getDate() + 42); // 6 weeks

    // Mid2: Week 11-12
    const mid2Start = new Date(termStartDate);
    mid2Start.setDate(mid2Start.getDate() + 77); // 11 weeks

    // Final: Week 16-17
    const finalStart = new Date(termStartDate);
    finalStart.setDate(finalStart.getDate() + 112); // 16 weeks

    // Get Saturday dates for each exam period
    function getNextSaturday(from: Date): Date {
      const date = new Date(from);
      const day = date.getDay();
      const diff = 6 - day; // 6 is Saturday
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

    // Get exam times from config
    const examTimes = [
      configData.exam_start_time || "09:00",
      "12:00", // Default middle slot
      configData.exam_end_time || "15:00"
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

        for (const time of examTimes) {
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
          exam_type: "mid1",
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
          exam_type: "mid2",
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
          ? `Successfully generated schedule: ${totalSections} sections, ${examsScheduled.mid1 + examsScheduled.mid2 + examsScheduled.final} exams, ${totalEnrollments} enrollments`
          : `Partial schedule generated with ${warnings.length} warnings`,
        stats: {
          students_by_level: studentsByLevel,
          sections_created: sectionsCreated,
          total_sections: totalSections,
          rooms_assigned: roomsAssigned,
          time_slots_assigned: timeSlotsAssigned,
          exams_scheduled: examsScheduled,
          conflicts_avoided: conflictsAvoided,
          total_enrollments: totalEnrollments,
        },
        warnings,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
