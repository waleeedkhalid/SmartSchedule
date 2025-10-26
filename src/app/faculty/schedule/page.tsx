/**
 * Faculty Schedule Page (Optimized)
 * 
 * Performance Optimizations:
 * - Server-side data fetching with React.cache()
 * - Select only required columns
 * - Pass data as props (no client-side useEffect)
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import FacultyScheduleClient from "./FacultyScheduleClient";

type ScheduleByDay = {
  SUNDAY: any[];
  MONDAY: any[];
  TUESDAY: any[];
  WEDNESDAY: any[];
  THURSDAY: any[];
};

// ✅ OPTIMIZED: Cached server-side data fetching
const getFacultySchedule = cache(async (userId: string) => {
  const supabase = await createServerClient();

  // Fetch sections with times
  const { data: sections } = await supabase
    .from("section")
    .select(`
      section_id,
      course_code,
      room_id,
      course:course_code (
        course_code,
        course_name,
        credits
      ),
      section_time (
        day,
        start_time,
        end_time
      )
    `)
    .eq("instructor_id", userId);

  if (!sections) {
    return {
      SUNDAY: [],
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
    };
  }

  // Organize by day
  const scheduleByDay: ScheduleByDay = {
    SUNDAY: [],
    MONDAY: [],
    TUESDAY: [],
    WEDNESDAY: [],
    THURSDAY: [],
  };

  sections.forEach((section: any) => {
    section.section_time?.forEach((time: any) => {
      const item = {
        sectionId: section.section_id,
        courseCode: section.course_code,
        courseName: section.course?.course_name || "",
        credits: section.course?.credits || 0,
        roomId: section.room_id,
        day: time.day,
        startTime: time.start_time,
        endTime: time.end_time,
      };

      if (time.day in scheduleByDay) {
        scheduleByDay[time.day as keyof ScheduleByDay].push(item);
      }
    });
  });

  return scheduleByDay;
});

export default async function FacultySchedulePage() {
  // Use cached auth functions
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  // ✅ OPTIMIZED: Fetch data server-side
  const schedule = await getFacultySchedule(user.id);

  return <FacultyScheduleClient schedule={schedule} />;
}

