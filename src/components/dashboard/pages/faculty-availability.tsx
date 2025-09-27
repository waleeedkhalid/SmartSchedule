"use client";

import * as React from "react";
import { CalendarCheck2, RotateCcw, Rows2 } from "lucide-react";

import {
  daysOfWeek,
  facultyAvailabilityTemplate,
  timeBlocks,
} from "../../../data/mock";
import { cn } from "../../../lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";

const workingDays = daysOfWeek;

type AvailabilityState = (typeof facultyAvailabilityTemplate)[number];

type SelectionState = {
  day: string;
  start: string;
};

export function FacultyAvailability() {
  const [availability, setAvailability] = React.useState<AvailabilityState[]>(
    facultyAvailabilityTemplate
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const dragModeRef = React.useRef<"add" | "remove">("add");

  React.useEffect(() => {
    const stopDrag = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDrag);
    return () => window.removeEventListener("mouseup", stopDrag);
  }, []);

  const toggleSlot = React.useCallback(
    (slot: SelectionState, mode?: "add" | "remove") => {
      setAvailability((prev) =>
        prev.map((entry) => {
          if (entry.day === slot.day && entry.start === slot.start) {
            const shouldEnable = mode ? mode === "add" : !entry.available;
            return { ...entry, available: shouldEnable };
          }
          return entry;
        })
      );
    },
    []
  );

  const resetAvailability = React.useCallback(() => {
    setAvailability(facultyAvailabilityTemplate);
  }, []);

  const markWeekdays = React.useCallback(() => {
    setAvailability((prev) =>
      prev.map((entry) => {
        if (
          ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"].includes(
            entry.day
          )
        ) {
          const hour = parseInt(entry.start.split(":")[0], 10);
          const withinPreferred = hour >= 9 && hour < 16;
          return { ...entry, available: withinPreferred };
        }
        return { ...entry, available: false };
      })
    );
  }, []);

  const availableCount = availability.filter((slot) => slot.available).length;

  // Layout constants to match ScheduleGrid-style visuals
  const SLOT_HEIGHT = 70;
  const daysToShow = workingDays;

  const handleMouseDown = React.useCallback(
    (slot: SelectionState, currentlyAvailable: boolean) => {
      const nextMode = currentlyAvailable ? "remove" : "add";
      dragModeRef.current = nextMode;
      toggleSlot(slot, nextMode);
      setIsDragging(true);
    },
    [toggleSlot]
  );

  const handleMouseEnter = React.useCallback(
    (slot: SelectionState) => {
      if (!isDragging) return;
      toggleSlot(slot, dragModeRef.current);
    },
    [isDragging, toggleSlot]
  );

  return (
    <Card data-test="faculty-availability-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarCheck2
                className="size-5 text-primary"
                aria-hidden="true"
              />
              Weekly availability map
            </CardTitle>
            <CardDescription>
              Click and drag to toggle 1-hour slots from 08:00–22:00. Scheduler
              respects confirmed availability first.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={markWeekdays}
              data-test="availability-weekdays"
            >
              <Rows2 className="mr-2 size-4" aria-hidden="true" /> Weekday focus
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetAvailability}
              data-test="availability-reset"
            >
              <RotateCcw className="mr-2 size-4" aria-hidden="true" /> Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-0">
            <div className="grid grid-cols-6 w-full border rounded-lg overflow-hidden bg-white dark:bg-slate-900 border-border dark:border-slate-700">
              {/* Header row */}
              <div className="sticky top-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm dark:from-slate-900 dark:to-slate-900/95 border-b-2 border-border dark:border-slate-700 p-3 text-xs font-medium uppercase tracking-wide text-center z-20 text-slate-900 dark:text-slate-100">
                Time
              </div>
              {daysToShow.map((day) => (
                <div
                  key={`avail-head-${day}`}
                  className="sticky top-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm dark:from-slate-900 dark:to-slate-900/95 border-b-2 border-border dark:border-slate-700 p-3 text-xs font-medium uppercase tracking-wide text-center z-20 text-slate-900 dark:text-slate-100"
                >
                  {day}
                </div>
              ))}

              {/* Time column */}
              <div className="bg-gray-50/70 dark:bg-slate-800/40 border-r border-border dark:border-slate-700/70">
                {timeBlocks.map((block, index) => (
                  <div
                    key={block.start}
                    className={cn(
                      "border-t border-border/30 dark:border-slate-600/40 flex items-center justify-center text-[16px] md:text-xs",
                      index === 0 && "border-t-0"
                    )}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                  >
                    <span className="px-1 rounded text-xs">{block.label}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {daysToShow.map((day) => (
                <div
                  key={day}
                  className="relative border-l border-border dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {timeBlocks.map((block, idx) => {
                    const slot = availability.find(
                      (item) => item.day === day && item.start === block.start
                    );
                    const isAvailable = slot?.available ?? false;
                    return (
                      <div
                        key={`${day}-${block.start}`}
                        className={cn(
                          "border-t h-full",
                          idx === 0 && "border-t-0"
                        )}
                        style={{ height: `${SLOT_HEIGHT}px` }}
                      >
                        <button
                          type="button"
                          className={cn(
                            "w-full h-full flex items-center justify-center text-xs transition",
                            isAvailable
                              ? "bg-primary/15 font-semibold text-primary"
                              : "bg-background text-muted-foreground hover:bg-muted/40"
                          )}
                          onMouseDown={() =>
                            handleMouseDown(
                              { day, start: block.start },
                              isAvailable
                            )
                          }
                          onMouseEnter={() =>
                            handleMouseEnter({ day, start: block.start })
                          }
                          data-test={`availability-slot-${day}-${block.start}`}
                        >
                          <span>{isAvailable ? "Available" : "Hold"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {availableCount} slots available
          </Badge>
          <span>Hold slots remain hidden from automated assignment.</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          Drag mode:{" "}
          <strong>
            {isDragging
              ? dragModeRef.current === "add"
                ? "Adding"
                : "Removing"
              : "Idle"}
          </strong>
        </div>
        <div>
          Last synced locally{" "}
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </CardFooter>
    </Card>
  );
}
