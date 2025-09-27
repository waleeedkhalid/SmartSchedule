import {
  Course,
  CourseSection,
  Schedule,
  NormalizedTimeSlot,
} from "../types/course";
import { normalizeTimeSlots, parseArabicTime } from "../utils/timeParser";

export function coursesToSchedule(
  courses: Course[],
  scheduleId: string = "demo"
): Schedule {
  const sections: CourseSection[] = courses.map((c) => {
    const normalizedSlots: NormalizedTimeSlot[] = normalizeTimeSlots(
      c.sectionTimes
    );

    let examSlot: CourseSection["examSlot"] | undefined;
    if (c.examDay && c.examTime) {
      try {
        const { start, end } = parseArabicTime(c.examTime);
        examSlot = {
          day: parseInt(c.examDay, 10),
          startMinutes: start,
          endMinutes: end,
          date: c.examDate,
        };
      } catch {
        // ignore invalid exam times
      }
    }

    return {
      course: c,
      normalizedSlots,
      examSlot,
    };
  });

  return {
    id: scheduleId,
    sections,
    score: 0,
    conflicts: [],
    metadata: {
      totalHours: sections.reduce(
        (sum, s) => sum + (parseInt(s.course.hours, 10) || 0),
        0
      ),
      daysUsed: Array.from(
        new Set(
          sections.flatMap((s) => s.normalizedSlots.map((slot) => slot.day))
        )
      ),
      earliestStart: Math.min(
        ...sections.flatMap((s) =>
          s.normalizedSlots.map((slot) => slot.startMinutes)
        )
      ),
      latestEnd: Math.max(
        ...sections.flatMap((s) =>
          s.normalizedSlots.map((slot) => slot.endMinutes)
        )
      ),
      totalGaps: 0, // could compute using ScheduleGrid gaps, leave 0 for now
    },
  };
}
