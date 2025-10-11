import { getSWEPlan } from "@/lib/supabase/swe-plan";
import type { SWEPlan } from "../../../types/swe-plan";

// Adapter-layer SWECurriculumLevel (scheduler-facing)
export interface SWECurriculumLevel {
  level: number;
  requiredSWECourses: SWEPlan[]; // rows from swe_plan where type='REQUIRED'
  electiveSlots: number; // derived from static mapping per level
  externalCourses: string[]; // temporary: from mock until DB source exists
  totalCredits: number; // sum of required course credits
}

// Static elective slots per level (subject to change)
const ELECTIVE_SLOTS_BY_LEVEL: Record<number, number> = {
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 1,
  8: 0,
};

// Lazy import to avoid shipping mocks when not needed
async function getMockCurriculumLevel(level: number) {
  const { getCurriculumForLevel } = await import("@/data/mockSWECurriculum");
  const fromMock = getCurriculumForLevel(level);
  if (!fromMock) {
    // Reasonable default when mock doesn’t include the level
    return {
      level,
      requiredSWECourses: [],
      externalCourses: [],
      totalCredits: 0,
      electiveSlots: ELECTIVE_SLOTS_BY_LEVEL[level] ?? 0,
    } as SWECurriculumLevel;
  }
  // Map mock structure to adapter shape by expanding required SWE course codes into minimal SWEPlan-like objects
  // Since mocks only store codes, we synthesize minimal SWEPlan entries
  const requiredSWECourses: SWEPlan[] = fromMock.requiredSWECourses.map(
    (code) => ({
      id: code, // synthetic id for compatibility (not persisted)
      course_code: code,
      course_name: code,
      credits: 0,
      level: fromMock.level,
      type: "REQUIRED",
      prerequisites: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  );
  return {
    level: fromMock.level,
    requiredSWECourses,
    electiveSlots: fromMock.electiveSlots,
    externalCourses: fromMock.externalCourses,
    totalCredits: fromMock.totalCredits,
  } satisfies SWECurriculumLevel;
}

export async function getCurriculumByLevel(
  level: number
): Promise<SWECurriculumLevel> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
  if (useMock) return getMockCurriculumLevel(level);

  // Live mode: fetch from Supabase
  const rows = await getSWEPlan(level);
  const requiredSWECourses = rows.filter((r) => r.type === "REQUIRED");
  const electiveSlots = ELECTIVE_SLOTS_BY_LEVEL[level] ?? 0;

  // External course list remains from mock for now
  const { getCurriculumForLevel } = await import("@/data/mockSWECurriculum");
  const mock = getCurriculumForLevel(level);
  const externalCourses = mock?.externalCourses ?? [];

  const totalCredits = requiredSWECourses.reduce(
    (sum, c) => sum + (c.credits || 0),
    0
  );

  return {
    level,
    requiredSWECourses,
    electiveSlots,
    externalCourses,
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
