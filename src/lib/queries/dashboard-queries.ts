/**
 * Dashboard Queries
 * Fetch data for committee dashboards and charts
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Get dashboard data for a specific term
 */
export const getDashboardData = cache(async (termCode: string) => {
  const supabase = await createServerClient();

  // Parallel fetch all required data
  const [students, sections, enrollments, courses] = await Promise.all([
    supabase
      .from("students")
      .select("id, level, status")
      .eq("status", "active"),

    supabase
      .from("section")
      .select(`
        id,
        course_code,
        capacity,
        enrolled_count,
        section_type,
        instructor_id,
        room_id,
        course:course_code (
          code,
          name,
          credits,
          type,
          level,
          department
        ),
        instructor:instructor_id (
          full_name
        ),
        room:room_id (
          number
        )
      `)
      .eq("term_code", termCode),

    supabase
      .from("section_enrollment")
      .select("student_id, section_id, status")
      .eq("status", "enrolled"),

    supabase
      .from("course")
      .select("code, name, credits, type, level, department"),
  ]);

  return {
    students: students.data || [],
    sections: sections.data || [],
    enrollments: enrollments.data || [],
    courses: courses.data || [],
  };
});

/**
 * Get level-specific statistics
 */
export const getLevelStatistics = cache(async (termCode: string) => {
  const data = await getDashboardData(termCode);

  // Group data by level
  const levelStats: Record<
    number,
    {
      level: number;
      studentCount: number;
      sectionCount: number;
      instructorCount: number;
      totalCapacity: number;
      enrolledCount: number;
    }
  > = {};

  // Count students by level
  data.students.forEach((student: any) => {
    if (!levelStats[student.level]) {
      levelStats[student.level] = {
        level: student.level,
        studentCount: 0,
        sectionCount: 0,
        instructorCount: 0,
        totalCapacity: 0,
        enrolledCount: 0,
      };
    }
    levelStats[student.level].studentCount++;
  });

  // Count sections and capacity by level
  data.sections.forEach((section: any) => {
    const level = section.course?.level;
    if (level && levelStats[level]) {
      levelStats[level].sectionCount++;
      levelStats[level].totalCapacity += section.capacity || 0;
      levelStats[level].enrolledCount += section.enrolled_count || 0;
    }
  });

  // Count unique instructors by level
  const instructorsByLevel: Record<number, Set<string>> = {};
  data.sections.forEach((section: any) => {
    const level = section.course?.level;
    if (level && section.instructor_id) {
      if (!instructorsByLevel[level]) {
        instructorsByLevel[level] = new Set();
      }
      instructorsByLevel[level].add(section.instructor_id);
    }
  });

  Object.keys(instructorsByLevel).forEach((level) => {
    const levelNum = parseInt(level);
    if (levelStats[levelNum]) {
      levelStats[levelNum].instructorCount = instructorsByLevel[levelNum].size;
    }
  });

  return Object.values(levelStats).sort((a, b) => a.level - b.level);
});

/**
 * Get course-specific statistics
 */
export const getCourseStatistics = cache(async (termCode: string) => {
  const data = await getDashboardData(termCode);

  // Group sections by course
  const courseStats: Record<
    string,
    {
      courseCode: string;
      courseName: string;
      sectionCount: number;
      totalCapacity: number;
      enrolledCount: number;
      rooms: string[];
      instructors: string[];
      utilization: number;
    }
  > = {};

  data.sections.forEach((section: any) => {
    const code = section.course_code;
    if (!courseStats[code]) {
      courseStats[code] = {
        courseCode: code,
        courseName: section.course?.name || code,
        sectionCount: 0,
        totalCapacity: 0,
        enrolledCount: 0,
        rooms: [],
        instructors: [],
        utilization: 0,
      };
    }

    courseStats[code].sectionCount++;
    courseStats[code].totalCapacity += section.capacity || 0;
    courseStats[code].enrolledCount += section.enrolled_count || 0;

    if (section.room?.number && !courseStats[code].rooms.includes(section.room.number)) {
      courseStats[code].rooms.push(section.room.number);
    }

    if (section.instructor?.full_name && !courseStats[code].instructors.includes(section.instructor.full_name)) {
      courseStats[code].instructors.push(section.instructor.full_name);
    }
  });

  // Calculate utilization
  Object.values(courseStats).forEach((stat) => {
    if (stat.totalCapacity > 0) {
      stat.utilization = (stat.enrolledCount / stat.totalCapacity) * 100;
    }
  });

  return Object.values(courseStats).sort((a, b) =>
    a.courseCode.localeCompare(b.courseCode)
  );
});

/**
 * Get room usage statistics
 */
export const getRoomStatistics = cache(async (termCode: string) => {
  const data = await getDashboardData(termCode);

  const roomStats: Record<
    string,
    {
      roomNumber: string;
      sectionCount: number;
      totalCapacity: number;
      courses: string[];
    }
  > = {};

  data.sections.forEach((section: any) => {
    const roomNumber = section.room?.number;
    if (roomNumber) {
      if (!roomStats[roomNumber]) {
        roomStats[roomNumber] = {
          roomNumber,
          sectionCount: 0,
          totalCapacity: 0,
          courses: [],
        };
      }

      roomStats[roomNumber].sectionCount++;
      roomStats[roomNumber].totalCapacity += section.capacity || 0;

      if (!roomStats[roomNumber].courses.includes(section.course_code)) {
        roomStats[roomNumber].courses.push(section.course_code);
      }
    }
  });

  return Object.values(roomStats).sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber)
  );
});

/**
 * Get enrollment distribution statistics
 */
export const getEnrollmentDistribution = cache(async (termCode: string) => {
  const data = await getDashboardData(termCode);

  const distribution = {
    byLevel: {} as Record<number, number>,
    byDepartment: {} as Record<string, number>,
    byCourseType: { REQUIRED: 0, ELECTIVE: 0 },
  };

  // Count enrollments by level
  data.students.forEach((student: any) => {
    const level = student.level;
    if (!distribution.byLevel[level]) {
      distribution.byLevel[level] = 0;
    }

    // Count student's enrollments
    const studentEnrollments = data.enrollments.filter(
      (e: any) => e.student_id === student.id
    );
    distribution.byLevel[level] += studentEnrollments.length;
  });

  // Count enrollments by department and course type
  data.sections.forEach((section: any) => {
    const enrollmentCount = section.enrolled_count || 0;
    const department = section.course?.department || "Other";
    const courseType = section.course?.type || "REQUIRED";

    if (!distribution.byDepartment[department]) {
      distribution.byDepartment[department] = 0;
    }
    distribution.byDepartment[department] += enrollmentCount;

    if (courseType === "ELECTIVE") {
      distribution.byCourseType.ELECTIVE += enrollmentCount;
    } else {
      distribution.byCourseType.REQUIRED += enrollmentCount;
    }
  });

  return distribution;
});

