import { getSWEPlan } from "@/lib/supabase/swe-plan";
import type { SWECurriculumLevel } from "@/lib/types";

// Static elective slots per level (subject to change)
const ELECTIVE_SLOTS_BY_LEVEL: Record<number, number> = {
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 1,
  8: 0,
};

// Live mode only - no mock fallback

export async function getCurriculumByLevel(
  level: number
): Promise<SWECurriculumLevel> {
  // Live mode: fetch from Supabase
  const rows = await getSWEPlan(level);
  const requiredRows = rows.filter((r) => r.type === "REQUIRED");
  const requiredSWECourses = requiredRows.map((r) => r.course_code);
  const electiveSlots = ELECTIVE_SLOTS_BY_LEVEL[level] ?? 0;

  // External courses from database
  const { getSupabaseAdminOrThrow } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdminOrThrow();
  const { data: externalCourses } = await supabase
    .from("external_course")
    .select("code");

  const totalCredits = requiredRows.reduce(
    (sum, c) => sum + (c.credits || 0),
    0
  );

  return {
    level,
    requiredSWECourses,
    electiveSlots,
    externalCourses: externalCourses?.map(c => c.code) || [],
    totalCredits,
  };
}

export async function getFullCurriculum(): Promise<SWECurriculumLevel[]> {
  // Levels defined in mock range; include 3–8 per requirements
  const levels = [3, 4, 5, 6, 7, 8];
  const list: SWECurriculumLevel[] = [];
  for (const lvl of levels) {
    list.push(await getCurriculumByLevel(lvl));
  }
  return list;
}
