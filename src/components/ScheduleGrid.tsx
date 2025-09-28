import React, { useMemo, useCallback } from "react";
import { Schedule, NormalizedTimeSlot } from "../types/course";
import { getDayName, minutesToTimeString } from "../utils/timeParser";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { cn } from "@/lib/utils";

interface ScheduleGridProps {
  schedule?: Schedule;
  showArabic?: boolean;
  className?: string;
  highlightMap?: Record<string, HighlightType>;
  colorMap?: Record<string, string>; // global color consistency
  showLegend?: boolean;
  tutorialDarker?: boolean; // darken non-lecture blocks
}

// Semantic color palette (kept as Tailwind utility chains for minimal churn)
const COLORS = [
  "bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-600 text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800/60",
  "bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-600 text-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800/60",
  "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600 text-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800/60",
  "bg-orange-100 dark:bg-orange-900/40 border-orange-300 dark:border-orange-600 text-orange-900 dark:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-800/60",
  "bg-pink-100 dark:bg-pink-900/40 border-pink-300 dark:border-pink-600 text-pink-900 dark:text-pink-100 hover:bg-pink-200 dark:hover:bg-pink-800/60",
  "bg-teal-100 dark:bg-teal-900/40 border-teal-300 dark:border-teal-600 text-teal-900 dark:text-teal-100 hover:bg-teal-200 dark:hover:bg-teal-800/60",
  "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800/60",
  "bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800/60",
];

// Internal representation for layout
interface CourseBlock {
  slot: NormalizedTimeSlot;
  courseCode: string;
  courseName: string;
  section: string;
  activity: string;
  instructor: string;
  room: string;
  color: string | undefined;
  examDate: string;
}

export function ScheduleGrid({
  schedule,
  showArabic = false,
  className,
  colorMap,
  showLegend = false,
  tutorialDarker = false,
}: ScheduleGridProps) {
  // Layout constants
  const START_HOUR = 8; // 8 AM
  const END_HOUR = 20; // 8 PM
  const INTERVAL_MINUTES = 30; // each timeslot are 30 minutes long.
  const SLOT_HEIGHT = 80; // increased for readability
  const daysToShow = useMemo(() => [1, 2, 3, 4, 5], []); // Sunday -> Thursday

  // Generate display time slots (memoized for performance & clarity)
  const timeSlots = useMemo(() => {
    const totalSlots = ((END_HOUR - START_HOUR) * 60) / INTERVAL_MINUTES;
    return Array.from({ length: totalSlots }, (_, i) => {
      const minutes = START_HOUR * 60 + i * INTERVAL_MINUTES;
      return {
        minutes,
        label: minutesToTimeString(minutes),
        isHour: i % 2 === 0,
      };
    });
  }, []);

  // Map sections into day buckets with color assignment
  const darkenColor = useCallback(
    (base: string | undefined): string | undefined => {
      if (!base) return base;
      // Replace first bg-*-100 with bg-*-300 (fallback keep original)
      const tokens = base.split(" ");
      let replaced = false;
      const mapped = tokens.map((t) => {
        if (!replaced && /^bg-.*-100$/.test(t)) {
          replaced = true;
          return t.replace("-100", "-300");
        }
        if (!replaced && /^bg-.*-50$/.test(t)) {
          replaced = true;
          return t.replace("-50", "-200");
        }
        return t;
      });
      // Adjust dark: variant slightly stronger
      return mapped
        .map((t) =>
          /^dark:bg-.*900\/40$/.test(t) ? t.replace(/900\/40$/, "900/70") : t
        )
        .join(" ");
    },
    []
  );

  const { slotsByDay, legendEntries } = useMemo(() => {
    const assigned = new Map<string, string>();
    let colorIndex = 0;
    const map = new Map<number, CourseBlock[]>();
    if (!schedule)
      return {
        slotsByDay: map,
        legendEntries: [] as { code: string; name: string; color: string }[],
      };
    for (const section of schedule.sections) {
      const key = section.course.courseCode;
      if (!assigned.has(key)) {
        const clr = colorMap?.[key] || COLORS[colorIndex % COLORS.length];
        assigned.set(key, clr);
        colorIndex++;
      }
      for (const slot of section.normalizedSlots) {
        if (!map.has(slot.day)) map.set(slot.day, []);
        map.get(slot.day)!.push({
          slot,
          courseCode: section.course.courseCode,
          courseName: section.course.courseName,
          section: section.course.section,
          activity: section.course.activity,
          instructor: section.course.instructor,
          room:
            section.course.sectionTimes.find((t) => t.day === String(slot.day))
              ?.room || "",
          color: assigned.get(key),
          examDate: section.course.examDate,
        });
      }
    }
    const legendEntries = Array.from(assigned.entries()).map(
      ([code, color]) => {
        const name =
          schedule.sections.find((s) => s.course.courseCode === code)?.course
            .courseName || code;
        return { code, name, color };
      }
    );
    return { slotsByDay: map, legendEntries };
  }, [schedule, colorMap]);

  // Build gaps per day for visualization (idle time blocks)
  const gapsByDay = useMemo(() => {
    const gaps = new Map<
      number,
      { start: number; end: number; duration: number }[]
    >();
    for (const day of daysToShow) {
      const list = (slotsByDay.get(day) || [])
        .slice()
        .sort((a, b) => a.slot.startMinutes - b.slot.startMinutes);
      if (list.length === 0) continue;
      for (let i = 0; i < list.length - 1; i++) {
        const cur = list[i].slot;
        const next = list[i + 1].slot;
        if (next.startMinutes > cur.endMinutes) {
          if (!gaps.has(day)) gaps.set(day, []);
          gaps.get(day)!.push({
            start: cur.endMinutes,
            end: next.startMinutes,
            duration: next.startMinutes - cur.endMinutes,
          });
        }
      }
    }
    return gaps;
  }, [slotsByDay, daysToShow]);

  // Compute absolute position & min height
  const getCourseBlockStyle = useCallback(
    (startMinutes: number, endMinutes: number) => {
      const startOffset = startMinutes - START_HOUR * 60;
      const duration = endMinutes - startMinutes;
      const topPosition = (startOffset / INTERVAL_MINUTES) * SLOT_HEIGHT;
      const height = (duration / INTERVAL_MINUTES) * SLOT_HEIGHT;
      return {
        top: `${topPosition}px`,
        height: `${Math.max(height, SLOT_HEIGHT * 0.75)}px`,
      } as React.CSSProperties;
    },
    []
  );

  // Adjust layout for overlaps
  const getOverlapAdjustedStyle = useCallback(
    (daySlots: CourseBlock[], currentIndex: number) => {
      const current = daySlots[currentIndex];
      const base = getCourseBlockStyle(
        current.slot.startMinutes,
        current.slot.endMinutes
      );
      const overlapping = daySlots.filter((other, i) => {
        if (i === currentIndex) return false;
        return (
          current.slot.startMinutes < other.slot.endMinutes &&
          current.slot.endMinutes > other.slot.startMinutes
        );
      });
      if (overlapping.length === 0) {
        return { ...base, left: "4px", right: "4px", zIndex: 1 };
      }
      const total = overlapping.length + 1;
      const position = overlapping.filter(
        (o) => o.slot.startMinutes <= current.slot.startMinutes
      ).length;
      return {
        ...base,
        left: `${4 + (position * 80) / total}%`,
        right: `${4 + ((total - position - 1) * 80) / total}%`,
        zIndex: 10 + currentIndex,
      } as React.CSSProperties;
    },
    [getCourseBlockStyle]
  );

  // Empty state
  if (!schedule || schedule.sections.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-10 text-center">
          <div className="text-base font-medium text-muted-foreground">
            {showArabic ? "لا توجد مواد مجدولة" : "No courses scheduled"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full shadow-sm border border-border/70 dark:border-slate-700/70 rounded-xl overflow-hidden",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          {/* Ensure a minimum width for readability; allow horizontal scroll on very small screens */}
          <div className="min-w-[1000px] xl:min-w-0">
            <div className="grid grid-cols-6 w-full border rounded-lg overflow-hidden bg-white dark:bg-slate-900 border-border dark:border-slate-700">
              {/* Header row */}
              <div className="sticky top-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm dark:from-slate-900 dark:to-slate-900/95 border-b-2 border-border dark:border-slate-700 p-3 text-base md:text-lg font-bold tracking-wide text-center z-20 flex items-center justify-center text-slate-900 dark:text-slate-100">
                {showArabic ? "الوقت" : "Time"}
              </div>
              {daysToShow.map((day) => (
                <div
                  key={day}
                  className="sticky top-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm dark:from-slate-900 dark:to-slate-900/95 border-b-2 border-border dark:border-slate-700 p-3 text-sm md:text-base font-semibold text-center z-20 flex items-center justify-center border-l text-slate-900 dark:text-slate-100"
                >
                  {getDayName(day, showArabic)}
                </div>
              ))}

              {/* Time column */}
              <div className="bg-gray-50/70 dark:bg-slate-800/40 border-r border-border dark:border-slate-700/70">
                {timeSlots.map((timeSlot, index) => (
                  <div
                    key={timeSlot.minutes}
                    className={cn(
                      "border-t border-border/30 dark:border-slate-600/40 flex items-center justify-center text-[16px] md:text-xs",
                      timeSlot.isHour
                        ? "font-bold text-foreground bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-muted-foreground dark:text-slate-400",
                      index === 0 && "border-t-0"
                    )}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  >
                    <span className="px-1 rounded">
                      {timeSlot.isHour ? timeSlot.label : ""}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {daysToShow.map((day) => (
                <div
                  key={day}
                  className="relative border-l border-border dark:border-slate-700 bg-white dark:bg-slate-900"
                  style={{ height: `${timeSlots.length * SLOT_HEIGHT}px` }}
                >
                  {/* Alternating grid lines */}
                  {timeSlots.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "absolute w-full border-t",
                        index % 2 === 0
                          ? "border-border/25 dark:border-slate-600/40"
                          : "border-border/10 dark:border-slate-700/30",
                        index === 0 && "border-t-0"
                      )}
                      style={{ top: `${index * SLOT_HEIGHT}px` }}
                    />
                  ))}

                  {/* Gap blocks */}
                  {gapsByDay.get(day)?.map((gap, gi) => {
                    const top =
                      ((gap.start - START_HOUR * 60) / INTERVAL_MINUTES) *
                      SLOT_HEIGHT;
                    const height =
                      (gap.duration / INTERVAL_MINUTES) * SLOT_HEIGHT;
                    const hours = Math.floor(gap.duration / 60);
                    const mins = gap.duration % 60;
                    const label = showArabic
                      ? `فجوة ${hours > 0 ? hours + "س " : ""}${
                          mins > 0 ? mins + "د" : ""
                        }`
                      : `${hours > 0 ? hours + "h " : ""}${
                          mins > 0 ? mins + "m " : ""
                        }gap`;
                    return (
                      <div
                        key={`gap-${gi}`}
                        className="absolute left-1 right-1 bg-gray-200/60 dark:bg-slate-700/40 rounded-md flex items-center justify-center text-[10px] text-gray-600 dark:text-slate-300 italic"
                        style={{
                          top: top + "px",
                          height: Math.max(height, 14) + "px",
                          zIndex: 0,
                        }}
                        title={
                          showArabic
                            ? `وقت خامل: ${label.replace("فجوة ", "")}`
                            : `Idle time: ${label.replace("gap", "").trim()}`
                        }
                      >
                        {height > 26 && <span>{label}</span>}
                      </div>
                    );
                  })}
                  {/* Course blocks */}
                  {slotsByDay.get(day)?.map((courseBlock, index) => {
                    const style = getOverlapAdjustedStyle(
                      slotsByDay.get(day)!,
                      index
                    );
                    const duration =
                      courseBlock.slot.endMinutes -
                      courseBlock.slot.startMinutes;
                    const isShort = duration < 60;
                    const appliedColor =
                      tutorialDarker && courseBlock.activity !== "محاضرة"
                        ? darkenColor(courseBlock.color)
                        : courseBlock.color;
                    return (
                      <HoverCard
                        key={`${courseBlock.courseCode}-${courseBlock.section}-${index}`}
                      >
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              "absolute rounded-lg p-1.5 md:p-2 border cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/5",
                              appliedColor,
                              isShort && "text-[11px] md:text-xs leading-tight"
                            )}
                            style={style}
                            aria-label={`${
                              courseBlock.courseCode
                            } ${minutesToTimeString(
                              courseBlock.slot.startMinutes
                            )}`}
                          >
                            <div
                              className={cn(
                                "font-bold leading-tight text-[12px] md:text-sm tracking-tight",
                                isShort && "text-[11px] md:text-xs"
                              )}
                            >
                              {courseBlock.courseCode}
                            </div>
                            <div className="text-[11px] md:text-xs leading-tight truncate font-medium">
                              {courseBlock.courseName}
                            </div>
                            <div className="text-[10px] md:text-[11px] leading-snug font-semibold">
                              {minutesToTimeString(
                                courseBlock.slot.startMinutes
                              )}{" "}
                              -{" "}
                              {minutesToTimeString(courseBlock.slot.endMinutes)}
                            </div>
                            <div className="text-[10px] md:text-[11px] leading-snug">
                              {courseBlock.section}
                            </div>
                            {courseBlock.instructor && (
                              <div className="text-[10px] md:text-[11px] leading-snug font-medium truncate">
                                {courseBlock.instructor}
                              </div>
                            )}
                            <Badge
                              variant="secondary"
                              className="text-[9px] md:text-[10px] px-1 py-0 h-4 mt-1 font-medium"
                            >
                              {courseBlock.activity}
                            </Badge>
                            {courseBlock.examDate !== "---" &&
                              courseBlock.activity === "محاضرة" && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] md:text-[10px] px-1 py-0 h-4 mt-1 font-medium"
                                >
                                  {courseBlock.examDate}
                                </Badge>
                              )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 z-50 p-4 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-lg tracking-tight">
                                {courseBlock.courseCode}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs font-medium"
                              >
                                {courseBlock.activity}
                              </Badge>
                            </div>
                            <div className="text-sm leading-relaxed text-muted-foreground dark:text-slate-400 font-medium">
                              {courseBlock.courseName}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs">
                              <div>
                                <span className="font-semibold">
                                  {showArabic ? "الشعبة:" : "Section:"}
                                </span>{" "}
                                {courseBlock.section}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  {showArabic ? "المدرس:" : "Instructor:"}
                                </span>{" "}
                                {courseBlock.instructor ||
                                  (showArabic ? "غير محدد" : "TBA")}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] md:text-xs pt-2 border-t border-border dark:border-slate-700">
                              <div>
                                <span className="font-semibold">
                                  {showArabic ? "الوقت:" : "Time:"}
                                </span>{" "}
                                {minutesToTimeString(
                                  courseBlock.slot.startMinutes
                                )}{" "}
                                -{" "}
                                {minutesToTimeString(
                                  courseBlock.slot.endMinutes
                                )}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  {showArabic ? "اليوم:" : "Day:"}
                                </span>{" "}
                                {getDayName(courseBlock.slot.day, showArabic)}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  {showArabic ? "الغرفة:" : "Room:"}
                                </span>{" "}
                                {courseBlock.room}
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    );
                  })}
                </div>
              ))}
            </div>
            {showLegend && legendEntries.length > 0 && (
              <div className="flex flex-wrap gap-3 p-3 border-t bg-muted/40 dark:bg-slate-800/40">
                {legendEntries.map((l) => (
                  <div
                    key={l.code}
                    className="flex items-center gap-1 text-[11px] md:text-xs"
                  >
                    <span
                      className={cn(
                        "w-3 h-3 rounded-sm border",
                        l.color?.split(" ").find((c) => c.startsWith("bg-"))
                      )}
                    />
                    <span className="font-medium">{l.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
