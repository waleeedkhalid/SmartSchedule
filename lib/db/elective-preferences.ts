import { createClient } from "@/supabase/server";

export interface ElectivePreferenceStat {
  course_code: string;
  course_title: string;
  level: number | null; // Maps from recommended_level (nullable for electives)
  total_requests: number;
  first_choice: number;
  second_choice: number;
  third_choice: number;
  other_choice: number;
}

/**
 * Get aggregated statistics for elective preferences grouped by course
 * @returns Array of preference statistics per course
 */
export async function getElectivePreferenceStats(): Promise<ElectivePreferenceStat[]> {
  const supabase = await createClient();

  // Get all elective preferences with course information
  const { data: preferences, error: prefError } = await supabase
    .from("elective_preference")
    .select(`
      course_code,
      rank,
      course:course!elective_preference_course_code_fkey(
        code,
        title,
        recommended_level
      )
    `);

  if (prefError) {
    throw new Error(`Failed to fetch elective preferences: ${prefError.message}`);
  }

  // Group preferences by course_code
  const statsMap = new Map<string, ElectivePreferenceStat>();

  preferences?.forEach((pref) => {
    const courseCode = pref.course_code;
    const course = pref.course as { code: string; title: string; recommended_level: number | null } | null;

    if (!course) return;

    if (!statsMap.has(courseCode)) {
      statsMap.set(courseCode, {
        course_code: courseCode,
        course_title: course.title,
        level: course.recommended_level, // Map recommended_level to level (nullable for electives)
        total_requests: 0,
        first_choice: 0,
        second_choice: 0,
        third_choice: 0,
        other_choice: 0,
      });
    }

    const stat = statsMap.get(courseCode)!;
    stat.total_requests++;

    if (pref.rank === 1) {
      stat.first_choice++;
    } else if (pref.rank === 2) {
      stat.second_choice++;
    } else if (pref.rank === 3) {
      stat.third_choice++;
    } else {
      stat.other_choice++;
    }
  });

  // Convert map to array and sort by course_code
  return Array.from(statsMap.values()).sort((a, b) =>
    a.course_code.localeCompare(b.course_code)
  );
}

