// Supabase-backed queries to assemble CourseOffering and Section shapes from DB tables
// PRD 2. API Layer – replace mock sources with live persistence

import { getSupabaseAdminOrThrow } from "@/lib/supabase-admin";
import type { CourseOffering, Section } from "@/lib/types";
import type { TableRow } from "@/lib/database.types";

type CourseRow = TableRow<"course">;
type SectionRow = TableRow<"section">;
type TimeSlotRow = TableRow<"time_slot">;

// Build CourseOffering[] from course + section + time_slot
export async function fetchCourseOfferingsFromDB(): Promise<
  ReadonlyArray<CourseOffering>
> {
  const admin = getSupabaseAdminOrThrow();

  // Fetch core tables
  const [coursesRes, sectionsRes, timeSlotsRes] = await Promise.all([
    admin.from("course").select("code, name, credits, level, type"),
    admin
      .from("section")
      .select("id, course_code, instructor_id, capacity, time_slot_id"),
    admin
      .from("time_slot")
      .select("id, day_of_week, start_time, end_time, kind"),
  ]);

  const { data: courses, error: cErr } = coursesRes as {
    data: CourseRow[] | null;
    error: unknown;
  };
  const { data: sections, error: sErr } = sectionsRes as {
    data: SectionRow[] | null;
    error: unknown;
  };
  const { data: timeSlots, error: tErr } = timeSlotsRes as {
    data: TimeSlotRow[] | null;
    error: unknown;
  };

  if (cErr) throw cErr;
  if (sErr) throw sErr;
  if (tErr) throw tErr;

  const timeSlotById = new Map<string, TimeSlotRow>();
  (timeSlots ?? []).forEach((ts) => timeSlotById.set(ts.id, ts));

  const sectionsByCourseCode = new Map<string, SectionRow[]>();
  (sections ?? []).forEach((s) => {
    const arr = sectionsByCourseCode.get(s.course_code) ?? [];
    arr.push(s);
    sectionsByCourseCode.set(s.course_code, arr);
  });

  const offerings: CourseOffering[] = (courses ?? []).map((c) => {
    const courseSections = (
      sectionsByCourseCode.get(c.code) ?? []
    ).map<Section>((s) => {
      const ts = s.time_slot_id ? timeSlotById.get(s.time_slot_id) : null;
      return {
        id: s.id,
        courseCode: c.code,
        instructor: s.instructor_id ?? "", // TODO: join user to get instructor name if needed
        times: ts
          ? [
              {
                day: ts.day_of_week,
                start: ts.start_time,
                end: ts.end_time,
              },
            ]
          : [],
        room: "", // No room field in schema; keep empty for now
        capacity: s.capacity ?? undefined,
      };
    });

    const typeNorm = (c.type ?? "required").toUpperCase();

    const offering: CourseOffering = {
      code: c.code,
      name: c.name,
      credits: Number(c.credits ?? 0),
      department: "SWE", // Schema lacks department for internal courses
      level: Number(c.level ?? 0),
      type: typeNorm === "ELECTIVE" ? "ELECTIVE" : "REQUIRED",
      prerequisites: [], // No prerequisites table; leave empty
      exams: {
        final: { date: "", time: "", duration: 90 },
      },
      sections: courseSections,
    };
    return offering;
  });

  return offerings;
}

// Build flattened Section[] directly from sections + courses + meetings
export async function fetchSectionsFromDB(): Promise<ReadonlyArray<Section>> {
  const admin = getSupabaseAdminOrThrow();

  const [coursesRes, sectionsRes, timeSlotsRes] = await Promise.all([
    admin.from("course").select("code"),
    admin
      .from("section")
      .select("id, course_code, instructor_id, capacity, time_slot_id"),
    admin
      .from("time_slot")
      .select("id, day_of_week, start_time, end_time, kind"),
  ]);

  const { data: courses, error: cErr } = coursesRes as {
    data: Pick<CourseRow, "code">[] | null;
    error: unknown;
  };
  const { data: sections, error: sErr } = sectionsRes as {
    data: SectionRow[] | null;
    error: unknown;
  };
  const { data: timeSlots, error: tErr } = timeSlotsRes as {
    data: TimeSlotRow[] | null;
    error: unknown;
  };

  if (cErr) throw cErr;
  if (sErr) throw sErr;
  if (tErr) throw tErr;

  const courseCodes = new Set((courses ?? []).map((c) => c.code));
  const timeSlotById = new Map<string, TimeSlotRow>();
  (timeSlots ?? []).forEach((ts) => timeSlotById.set(ts.id, ts));

  const flat: Section[] = (sections ?? [])
    .filter((s) => courseCodes.has(s.course_code))
    .map((s) => {
      const ts = s.time_slot_id ? timeSlotById.get(s.time_slot_id) : null;
      return {
        id: s.id,
        courseCode: s.course_code,
        instructor: s.instructor_id ?? "",
        times: ts
          ? [
              {
                day: ts.day_of_week,
                start: ts.start_time,
                end: ts.end_time,
              },
            ]
          : [],
        room: "",
        capacity: s.capacity ?? undefined,
      };
    });

  return flat;
}
