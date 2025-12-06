/**
 * Scheduling Dashboard Statistics API Route
 *
 * GET /api/v1/scheduling/dashboard-stats - Get comprehensive scheduling statistics
 *
 * Returns statistics for the scheduling dashboard including:
 * - Scheduling progress (sections with instructors, rooms, times)
 * - Room utilization stats
 * - Instructor workload distribution
 * - Elective preferences summary
 * - Time slot distribution
 * - Faculty availability status
 *
 * Only accessible by scheduling role.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { getActiveTerm } from "@/lib/db/term";

interface MeetingTime {
  day: string;
  startTime: string;
  endTime: string;
}

interface SectionCourse {
  code: string;
  title: string;
  credits: number;
  weekly_hours: number;
  is_elective: boolean;
}

interface RoomUsage {
  room: string;
  type: string;
  capacity: number | null;
  sections: number;
  utilization: number;
}

interface InstructorWorkload {
  id: string;
  name: string;
  sections: number;
  credits: number;
  hours: number;
  maxLoad: number;
  utilization: number;
  status: "overloaded" | "near-capacity" | "balanced" | "underutilized";
}

interface ElectiveStats {
  course_code: string;
  course_title: string;
  total_requests: number;
  first_choice: number;
  second_choice: number;
  third_choice: number;
}

interface TimeSlotData {
  time: string;
  sections: number;
}

interface DayData {
  day: string;
  sections: number;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only scheduling role can view dashboard stats
    requireRole(user, ["scheduling", "teaching_load"]);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    let termId = searchParams.get("term_id");

    // If no term_id provided, get current active term
    if (!termId) {
      const activeTerm = await getActiveTerm();

      if (activeTerm) {
        termId = activeTerm.id;
      }
    }

    // Get section IDs for the term from schedule table
    let sectionIdsForTerm: string[] = [];
    if (termId) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      sectionIdsForTerm = (scheduleSections || []).map((s) => s.section_id);
    }

    // 1. Get all sections with their relationships
    let sectionsQuery = supabase.from("section").select(`
        id,
        section_no,
        course_code,
        instructor_id,
        room_code,
        capacity,
        state,
        meeting_pattern,
        group_level,
        course:course_code(
          code,
          title,
          credits,
          weekly_hours,
          is_elective
        ),
        instructor:instructor_id(
          id,
          name,
          max_load_per_week
        ),
        room:room_code(
          code,
          type,
          capacity
        )
      `);

    // Filter by term if we have section IDs
    if (sectionIdsForTerm.length > 0) {
      sectionsQuery = sectionsQuery.in("id", sectionIdsForTerm);
    }

    const { data: sections, error: sectionsError } = await sectionsQuery;

    if (sectionsError) {
      throw sectionsError;
    }

    // 2. Get all rooms
    const { data: rooms, error: roomsError } = await supabase
      .from("room")
      .select("code, type, capacity");

    if (roomsError) {
      throw roomsError;
    }

    // 3. Get all faculty profiles
    const { data: facultyProfiles, error: facultyError } = await supabase
      .from("faculty_profile")
      .select(
        "id, user_id, name, max_load_per_week, preferred_times, unavailable_times, department"
      )
      .eq("department", "SWE");

    if (facultyError) {
      throw facultyError;
    }

    // 4. Get elective preferences
    const { data: electivePreferences, error: electiveError } =
      await supabase.from("elective_preference").select(`
        course_code,
        rank,
        course:course_code(
          code,
          title
        )
      `);

    if (electiveError) {
      throw electiveError;
    }

    // 5. Get student enrollments count (active)
    const { count: enrollmentCount } = await supabase
      .from("student_profile")
      .select("*", { count: "exact", head: true });

    // ==========================================
    // Calculate Progress Statistics
    // ==========================================
    const totalSections = sections?.length || 0;
    const sectionsWithInstructor =
      sections?.filter((s) => s.instructor_id).length || 0;
    const sectionsWithRoom = sections?.filter((s) => s.room_code).length || 0;
    const sectionsWithTime =
      sections?.filter((s) => {
        const pattern = s.meeting_pattern as MeetingTime[] | null;
        return pattern && Array.isArray(pattern) && pattern.length > 0;
      }).length || 0;

    const fullyAssignedSections =
      sections?.filter((s) => {
        const hasInstructor = !!s.instructor_id;
        const hasRoom = !!s.room_code;
        const pattern = s.meeting_pattern as MeetingTime[] | null;
        const hasTime = pattern && Array.isArray(pattern) && pattern.length > 0;
        return hasInstructor && hasRoom && hasTime;
      }).length || 0;

    const draftSections =
      sections?.filter((s) => s.state === "draft").length || 0;
    const releasedSections =
      sections?.filter((s) => s.state === "released").length || 0;

    const progress = {
      total: totalSections,
      assigned: fullyAssignedSections,
      draft: draftSections,
      released: releasedSections,
      withInstructor: sectionsWithInstructor,
      withRoom: sectionsWithRoom,
      withTime: sectionsWithTime,
      completionRate:
        totalSections > 0 ? (fullyAssignedSections / totalSections) * 100 : 0,
      instructorAssignmentRate:
        totalSections > 0 ? (sectionsWithInstructor / totalSections) * 100 : 0,
      roomAssignmentRate:
        totalSections > 0 ? (sectionsWithRoom / totalSections) * 100 : 0,
      timeAssignmentRate:
        totalSections > 0 ? (sectionsWithTime / totalSections) * 100 : 0,
    };

    // ==========================================
    // Calculate Room Utilization Statistics
    // ==========================================
    const totalRooms = rooms?.length || 0;
    const usedRoomCodes = new Set(
      sections?.filter((s) => s.room_code).map((s) => s.room_code)
    );
    const usedRoomsCount = usedRoomCodes.size;
    const lectureRooms = rooms?.filter((r) => r.type === "Lecture").length || 0;
    const labRooms = rooms?.filter((r) => r.type === "Lab").length || 0;

    // Calculate room usage details
    const roomUsageMap = new Map<string, RoomUsage>();

    // Initialize all rooms with 0 sections
    rooms?.forEach((room) => {
      roomUsageMap.set(room.code, {
        room: room.code,
        type: room.type || "lecture",
        capacity: room.capacity,
        sections: 0,
        utilization: 0,
      });
    });

    // Count sections per room
    sections?.forEach((section) => {
      if (section.room_code && roomUsageMap.has(section.room_code)) {
        const roomData = roomUsageMap.get(section.room_code)!;
        roomData.sections++;
      }
    });

    // Calculate utilization (assuming max 30 slots per week: 6 time slots × 5 days)
    const maxSlotsPerWeek = 30;
    roomUsageMap.forEach((room) => {
      room.utilization = (room.sections / maxSlotsPerWeek) * 100;
    });

    const roomUsageDetails = Array.from(roomUsageMap.values()).sort(
      (a, b) => b.sections - a.sections
    );

    const avgRoomUtilization =
      roomUsageDetails.length > 0
        ? roomUsageDetails.reduce((sum, r) => sum + r.utilization, 0) /
        roomUsageDetails.length
        : 0;

    const roomStats = {
      totalRooms,
      usedRooms: usedRoomsCount,
      unusedRooms: totalRooms - usedRoomsCount,
      lectureRooms,
      labRooms,
      utilizationRate: avgRoomUtilization,
      roomUsageDetails: roomUsageDetails.slice(0, 15), // Top 15 rooms
    };

    // ==========================================
    // Calculate Instructor Workload Statistics
    // ==========================================
    const instructorWorkloadMap = new Map<string, InstructorWorkload>();

    // Initialize from faculty profiles
    facultyProfiles?.forEach((faculty) => {
      const id = faculty.id || faculty.user_id || "";
      instructorWorkloadMap.set(id, {
        id,
        name: faculty.name || "Unknown",
        sections: 0,
        credits: 0,
        hours: 0,
        maxLoad: faculty.max_load_per_week || 12,
        utilization: 0,
        status: "underutilized",
      });
    });

    // Calculate workload from sections
    sections?.forEach((section) => {
      if (section.instructor_id) {
        const instructor = instructorWorkloadMap.get(section.instructor_id);
        if (instructor) {
          instructor.sections++;
          const course = section.course as unknown as SectionCourse | null;
          const credits = course?.credits || 3;
          const hours = course?.weekly_hours || 3;
          instructor.credits += credits;
          instructor.hours += hours;
        }
      }
    });

    // Calculate utilization and status
    instructorWorkloadMap.forEach((instructor) => {
      instructor.utilization =
        instructor.maxLoad > 0
          ? (instructor.hours / instructor.maxLoad) * 100
          : 0;

      if (instructor.utilization > 100) {
        instructor.status = "overloaded";
      } else if (instructor.utilization >= 80) {
        instructor.status = "near-capacity";
      } else if (instructor.utilization >= 50) {
        instructor.status = "balanced";
      } else {
        instructor.status = "underutilized";
      }
    });

    const instructorWorkloads = Array.from(instructorWorkloadMap.values()).sort(
      (a, b) => b.utilization - a.utilization
    );

    const overloaded = instructorWorkloads.filter(
      (i) => i.status === "overloaded"
    ).length;
    const nearCapacity = instructorWorkloads.filter(
      (i) => i.status === "near-capacity"
    ).length;
    const balanced = instructorWorkloads.filter(
      (i) => i.status === "balanced"
    ).length;
    const underutilized = instructorWorkloads.filter(
      (i) => i.status === "underutilized"
    ).length;
    const avgUtilization =
      instructorWorkloads.length > 0
        ? instructorWorkloads.reduce((sum, i) => sum + i.utilization, 0) /
        instructorWorkloads.length
        : 0;

    const workload = {
      avgUtilization,
      overloaded,
      nearCapacity,
      balanced,
      underutilized,
      instructors: instructorWorkloads.slice(0, 20).map((i) => ({
        id: i.id,
        name: i.name,
        sections: i.sections,
        credits: i.credits,
        utilizationRate: i.utilization,
        status: i.status,
      })),
    };

    // ==========================================
    // Calculate Faculty Availability Statistics
    // ==========================================
    const totalInstructors = facultyProfiles?.length || 0;
    const withPreferences =
      facultyProfiles?.filter((f) => {
        const prefs = f.preferred_times as unknown;
        return prefs && Array.isArray(prefs) && prefs.length > 0;
      }).length || 0;
    const withUnavailability =
      facultyProfiles?.filter((f) => {
        const unavail = f.unavailable_times as unknown;
        return unavail && Array.isArray(unavail) && unavail.length > 0;
      }).length || 0;
    const withoutPreferences = totalInstructors - withPreferences;

    const faculty = {
      totalInstructors,
      withPreferences,
      withoutPreferences,
      withUnavailability,
    };

    // ==========================================
    // Calculate Elective Preferences Statistics
    // ==========================================
    const electiveStatsMap = new Map<string, ElectiveStats>();

    electivePreferences?.forEach((pref) => {
      const course = pref.course as unknown as {
        code: string;
        title: string;
      } | null;
      if (!course) return;

      if (!electiveStatsMap.has(pref.course_code)) {
        electiveStatsMap.set(pref.course_code, {
          course_code: pref.course_code,
          course_title: course.title || "",
          total_requests: 0,
          first_choice: 0,
          second_choice: 0,
          third_choice: 0,
        });
      }

      const stat = electiveStatsMap.get(pref.course_code)!;
      stat.total_requests++;

      if (pref.rank === 1) stat.first_choice++;
      else if (pref.rank === 2) stat.second_choice++;
      else if (pref.rank === 3) stat.third_choice++;
    });

    const electives = Array.from(electiveStatsMap.values()).sort(
      (a, b) => b.total_requests - a.total_requests
    );

    // ==========================================
    // Calculate Time Slot Distribution
    // ==========================================
    const timeSlotMap = new Map<string, number>();
    const dayMap = new Map<string, number>();

    // Initialize days
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].forEach((day) => {
      dayMap.set(day, 0);
    });

    // Initialize common time slots
    const commonTimeSlots = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];
    commonTimeSlots.forEach((time) => {
      timeSlotMap.set(time, 0);
    });

    sections?.forEach((section) => {
      const pattern = section.meeting_pattern as MeetingTime[] | null;
      if (pattern && Array.isArray(pattern)) {
        pattern.forEach((meeting: MeetingTime) => {
          // Count by day
          if (meeting.day && dayMap.has(meeting.day)) {
            dayMap.set(meeting.day, (dayMap.get(meeting.day) || 0) + 1);
          }

          // Count by start time (extract hour)
          if (meeting.startTime) {
            const hour = meeting.startTime.split(":")[0] + ":00";
            if (timeSlotMap.has(hour)) {
              timeSlotMap.set(hour, (timeSlotMap.get(hour) || 0) + 1);
            } else {
              timeSlotMap.set(hour, 1);
            }
          }
        });
      }
    });

    const timeDistribution: TimeSlotData[] = Array.from(timeSlotMap.entries())
      .map(([time, sections]) => ({ time, sections }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const dayDistribution: DayData[] = Array.from(dayMap.entries()).map(
      ([day, sections]) => ({ day, sections })
    );

    const timeslots = {
      timeDistribution,
      dayDistribution,
      totalScheduledSections: sectionsWithTime,
    };

    // ==========================================
    // Calculate Enrollment Statistics
    // ==========================================
    const enrollments = {
      active: enrollmentCount || 0,
      retentionRate: 95.5, // This would need actual historical data
      byLevel: [4, 5, 6, 7, 8].map((level) => ({
        level,
        count: sections?.filter((s) => s.group_level === level).length || 0,
      })),
    };

    // ==========================================
    // Return all statistics
    // ==========================================
    return createSuccessResponse({
      progress,
      rooms: roomStats,
      workload,
      faculty,
      electives,
      timeslots,
      enrollments,
      termId,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
