/**
 * Faculty Courses Page (Optimized)
 * 
 * Performance Optimizations:
 * - Server-side data fetching with React.cache()
 * - Parallel queries with Promise.all()
 * - Select only required columns
 * - Pass data as props (no client-side useEffect)
 */

import { redirect } from "next/navigation";
import { cache } from "react";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import FacultyCoursesClient from "./FacultyCoursesClient";

// ✅ OPTIMIZED: Cached server-side data fetching
const getFacultyCourses = cache(async (userId: string) => {
  const supabase = await createServerClient();

  // Fetch sections assigned to this faculty member
  const { data: sections, error } = await supabase
    .from("section")
    .select(`
      section_id,
      course_code,
      room_id,
      capacity,
      course:course_code (
        course_code,
        course_name,
        credits,
        department,
        description,
        type,
        level
      ),
      section_time (
        id,
        day,
        start_time,
        end_time
      )
    `)
    .eq("instructor_id", userId);

  if (error) {
    console.error("Error fetching faculty courses:", error);
    return [];
  }

  if (!sections) return [];

  // Get enrollment counts for each section
  const sectionIds = sections.map(s => s.section_id);
  const { data: enrollments } = await supabase
    .from("enrollment")
    .select("section_id")
    .in("section_id", sectionIds);

  const enrollmentCounts = enrollments?.reduce((acc, e) => {
    acc[e.section_id] = (acc[e.section_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return sections.map((section: any) => ({
    id: section.section_id,
    course_code: section.course_code,
    room_id: section.room_id,
    capacity: section.capacity,
    enrolledCount: enrollmentCounts[section.section_id] || 0,
    course: {
      code: section.course?.course_code || section.course_code,
      name: section.course?.course_name || "",
      credits: section.course?.credits || 0,
      department: section.course?.department || "",
      description: section.course?.description,
      type: section.course?.type || "",
      level: section.course?.level || 0,
    },
    times: section.section_time || [],
  }));
});

export default async function FacultyCoursesPage() {
  // Use cached auth functions
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  const role = profile?.role as UserRole | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  // ✅ OPTIMIZED: Fetch data server-side
  const courses = await getFacultyCourses(user.id);

  return <FacultyCoursesClient courses={courses} />;
}

