/**
 * Faculty Statistics & Teaching Load
 *
 * Functions for calculating faculty statistics and teaching load data
 */

import { createClient } from "@/supabase/server";
import { getFacultySections } from "./sections";
import type { FacultyStats } from "./types";

/**
 * Get faculty statistics for dashboard
 */
export async function getFacultyStats(userId: string): Promise<FacultyStats> {
  const supabase = await createClient();

  // Get sections assigned to faculty
  const { data: sections } = await supabase
    .from("section")
    .select(
      `
      id,
      course_code,
      capacity,
      state,
      meeting_pattern,
      course:course!section_course_code_fkey(credits, weekly_hours)
    `
    )
    .eq("instructor_id", userId);

  const sectionsList = sections || [];

  // Get unique courses
  const uniqueCourses = new Set(
    sectionsList.map((s: { course_code: string }) => s.course_code)
  );

  // Get enrollment counts
  const sectionIds = sectionsList.map((s: { id: string }) => s.id);
  let totalStudents = 0;

  if (sectionIds.length > 0) {
    const { count } = await supabase
      .from("student_enrollment")
      .select("*", { count: "exact", head: true })
      .in("section_id", sectionIds)
      .eq("status", "registered");

    totalStudents = count || 0;
  }

  // Calculate weekly hours
  let weeklyHours = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionsList.forEach((section: any) => {
    const pattern = section.meeting_pattern;
    const courseData = Array.isArray(section.course)
      ? section.course[0]
      : section.course;

    if (pattern && pattern.duration && pattern.days) {
      weeklyHours += (pattern.duration / 60) * pattern.days.length;
    } else if (courseData?.weekly_hours) {
      weeklyHours += courseData.weekly_hours;
    }
  });

  // Calculate average class size
  const totalCapacity = sectionsList.reduce(
    (sum: number, s: { capacity: number }) => sum + s.capacity,
    0
  );
  const averageClassSize =
    sectionsList.length > 0
      ? Math.round(totalCapacity / sectionsList.length)
      : 0;

  return {
    totalSections: sectionsList.length,
    totalCourses: uniqueCourses.size,
    totalStudents,
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    draftSections: sectionsList.filter(
      (s: { state: string }) => s.state === "draft"
    ).length,
    releasedSections: sectionsList.filter(
      (s: { state: string }) => s.state === "released"
    ).length,
    averageClassSize,
  };
}

/**
 * Get weekly schedule data for charts
 */
export async function getFacultyWeeklySchedule(userId: string): Promise<
  {
    day: string;
    hours: number;
    sections: number;
  }[]
> {
  const sections = await getFacultySections(userId);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const weeklyData = days.map((day) => ({
    day,
    hours: 0,
    sections: 0,
  }));

  sections.forEach((section) => {
    const pattern = section.meeting_pattern;
    if (pattern && pattern.days && pattern.duration) {
      pattern.days.forEach((day) => {
        const dayData = weeklyData.find((d) => d.day === day);
        if (dayData) {
          dayData.hours += pattern.duration / 60;
          dayData.sections += 1;
        }
      });
    }
  });

  return weeklyData;
}

/**
 * Get teaching load by course for charts
 */
export async function getFacultyTeachingLoad(userId: string): Promise<
  {
    course_code: string;
    course_title: string;
    sections: number;
    total_capacity: number;
    enrolled: number;
  }[]
> {
  const sections = await getFacultySections(userId);

  const courseMap = new Map<
    string,
    {
      course_code: string;
      course_title: string;
      sections: number;
      total_capacity: number;
      enrolled: number;
    }
  >();

  sections.forEach((section) => {
    const existing = courseMap.get(section.course_code);
    if (existing) {
      existing.sections += 1;
      existing.total_capacity += section.capacity;
      existing.enrolled += section.current_enrollment || 0;
    } else {
      courseMap.set(section.course_code, {
        course_code: section.course_code,
        course_title: section.course_title,
        sections: 1,
        total_capacity: section.capacity,
        enrolled: section.current_enrollment || 0,
      });
    }
  });

  return Array.from(courseMap.values());
}
