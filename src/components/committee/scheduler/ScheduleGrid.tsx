"use client";
import React from "react";

// Skeleton implementation: will evolve to interactive drag/drop grid.
// Phase 1: Read-only rendering of sections & meetings (placeholder data prop)

export type ScheduleMeeting = {
  id: string;
  sectionId: string;
  day: string; // Sunday .. Thursday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  room?: string;
  instructor?: string;
};

export type ScheduleSection = {
  id: string;
  courseCode: string;
  title?: string;
  instructor?: string;
  room?: string;
  meetings: ScheduleMeeting[];
};

export interface ScheduleGridProps {
  sections: ScheduleSection[];
  showConflicts?: boolean;
  conflicts?: { meetingId: string; type: string; message: string }[];
}

const DAYS: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const START_DAY = 8 * 60; // 08:00 baseline
const END_DAY = 18 * 60; // 18:00
const TOTAL = END_DAY - START_DAY;

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  sections,
  showConflicts,
  conflicts = [],
}) => {
  const meetingIndex: Record<string, ScheduleMeeting> = {};
  sections.forEach((s) =>
    s.meetings.forEach((m) => {
      meetingIndex[m.id] = m;
    })
  );
  const conflictSet = new Set(conflicts.map((c) => c.meetingId));

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <div
        className="grid"
        style={{ gridTemplateColumns: `100px repeat(${DAYS.length}, 1fr)` }}
      >
        <div className="bg-muted p-2 text-xs font-medium">Time</div>
        {DAYS.map((d) => (
          <div key={d} className="bg-muted p-2 text-xs font-medium text-center">
            {d}
          </div>
        ))}
        {/* Rows: each hour */}
        {Array.from({ length: (END_DAY - START_DAY) / 60 }).map((_, idx) => {
          const hour = START_DAY / 60 + idx;
          return (
            <React.Fragment key={hour}>
              <div className="border-r border-b p-1 text-[10px] text-muted-foreground">
                {hour}:00
              </div>
              {DAYS.map((d) => (
                <div
                  key={d + hour}
                  className="relative border-b border-r min-h-[40px]"
                />
              ))}
            </React.Fragment>
          );
        })}
        {/* Overlay meetings absolutely positioned */}
        {sections.flatMap((s) =>
          s.meetings.map((m) => {
            const topPct =
              ((timeToMinutes(m.startTime) - START_DAY) / TOTAL) * 100;
            const heightPct =
              ((timeToMinutes(m.endTime) - timeToMinutes(m.startTime)) /
                TOTAL) *
              100;
            const dayIdx = DAYS.indexOf(m.day);
            if (dayIdx === -1) return null;
            return (
              <div
                key={m.id}
                className="pointer-events-none"
                style={{ gridColumn: `${dayIdx + 2} / span 1` }}
              >
                <div
                  className={`absolute left-1 right-1 rounded-sm p-1 shadow text-[10px] leading-tight ${
                    conflictSet.has(m.id)
                      ? "bg-red-500 text-white"
                      : "bg-primary/80 text-white"
                  } `}
                  style={{ top: `${topPct}%`, height: `${heightPct}%` }}
                >
                  <div className="font-semibold truncate">{s.courseCode}</div>
                  <div className="truncate">{m.room || s.room}</div>
                  <div className="truncate opacity-80">
                    {s.instructor || m.instructor}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {!sections.length && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No sections scheduled yet.
        </div>
      )}
      {showConflicts && conflicts.length > 0 && (
        <div className="border-t bg-red-50 p-2 text-xs space-y-1">
          {conflicts.map((c) => (
            <div key={c.meetingId} className="text-red-700">
              {c.type}: {c.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;
