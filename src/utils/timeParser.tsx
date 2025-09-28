import { NormalizedTimeSlot } from "../types/course";

// Convert single Arabic time string to minutes (e.g., "10:00 ص" -> 600)
export function parseArabicTimeToMinutes(timeStr: string): number {
  // Normalize Arabic indicators to English for robustness
  const normalized = timeStr.replace(/ص/g, "AM").replace(/م/g, "PM");
  return convertArabicTimeToMinutes(normalized.trim());
}

// Convert Arabic (and normalized English) time range string to 24-hour minutes
export function parseArabicTime(timeStr: string): {
  start: number;
  end: number;
} {
  // Check if this is a single time or time range
  const hasRange = timeStr.includes(" - ");

  if (!hasRange) {
    // This is a single time, not a range - return it as both start and end
    const minutes = parseArabicTimeToMinutes(timeStr);
    return { start: minutes, end: minutes };
  }

  // Normalize Arabic indicators to English for robustness
  const normalized = timeStr.replace(/ص/g, "AM").replace(/م/g, "PM");
  const parts = normalized.split(" - ");
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  const startTime = convertArabicTimeToMinutes(parts[0].trim());
  const endTime = convertArabicTimeToMinutes(parts[1].trim());
  return { start: startTime, end: endTime };
}

function convertArabicTimeToMinutes(timeStr: string): number {
  // Accept Arabic (already normalized above) or English AM/PM
  // After normalization only English AM/PM should remain but keep pattern flexible.
  const regex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = timeStr.match(regex);
  if (!match) {
    throw new Error(`Invalid Arabic time format: ${timeStr}`);
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Parse day string like "1 3 5" into array of day numbers
export function parseDays(dayStr: string): number[] {
  return dayStr.split(" ").map((d) => parseInt(d.trim(), 10));
}

// Convert course section times to normalized slots
export function normalizeTimeSlots(
  sectionTimes: { day: string; time: string; room?: string }[]
): NormalizedTimeSlot[] {
  const slots: NormalizedTimeSlot[] = [];

  for (const sectionTime of sectionTimes) {
    try {
      const days = parseDays(sectionTime.day);
      const { start, end } = parseArabicTime(sectionTime.time);

      for (const day of days) {
        slots.push({
          day,
          startMinutes: start,
          endMinutes: end,
          room: sectionTime.room || undefined,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse time slot: ${sectionTime.time}`, error);
      // Continue processing other time slots instead of failing completely
      continue;
    }
  }

  return slots;
}

// Check if two time slots overlap
export function slotsOverlap(
  slot1: NormalizedTimeSlot,
  slot2: NormalizedTimeSlot
): boolean {
  if (slot1.day !== slot2.day) {
    return false;
  }

  return (
    slot1.startMinutes < slot2.endMinutes &&
    slot2.startMinutes < slot1.endMinutes
  );
}

// Check if two schedules have exam conflicts
export function hasExamConflict(
  exam1: {
    day: number;
    startMinutes: number;
    endMinutes: number;
    date: string;
  },
  exam2: { day: number; startMinutes: number; endMinutes: number; date: string }
): boolean {
  // For now, treat examDate as opaque strings for equality
  // In the future, could convert Hijri dates for proper comparison
  if (exam1.date !== exam2.date) {
    return false;
  }

  // Same date - check time overlap
  return (
    exam1.startMinutes < exam2.endMinutes &&
    exam2.startMinutes < exam1.endMinutes
  );
}

// Convert minutes to readable time string
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")} ${ampm}`;
}

// Day number to Arabic day name
export function getDayName(day: number, isRTL: boolean = false): string {
  const days = isRTL
    ? [
        "",
        "الأحد",
        "الإثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ]
    : [
        "",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
  return days[day] || "";
}
