"use client";

// Student Registration Page with interactive add/remove of course sections using ScheduleGrid
import React, { useState, useCallback, useMemo } from "react";
import type { CourseSection } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScheduleGrid from "./ScheduleGrid";
import {
  activityToCourseSection,
  buildScheduleFromSelections,
  detectSectionConflicts,
  buildHighlightMapForConflicts,
  sectionKey,
  CatalogCourseInput,
} from "@/lib/student-schedule-helpers";
import { cn } from "@/lib/utils";

// Mock catalog (SWE only per scope) - minimal example; in real app derive from data helpers
const CATALOG: CatalogCourseInput[] = [
  {
    courseCode: "SWE211",
    courseName: "Intro to Software Eng.",
    activities: [
      {
        section: "L01",
        activity: "محاضرة",
        instructor: "Dr. Ahmed",
        day: 1,
        startMinutes: 8 * 60,
        endMinutes: 9 * 60,
        examDateISO: "2025-05-08",
      },
      {
        section: "T01",
        activity: "تمارين",
        instructor: "TA Sara",
        day: 3,
        startMinutes: 10 * 60,
        endMinutes: 11 * 60,
      },
    ],
  },
  {
    courseCode: "SWE314",
    courseName: "Software Architecture",
    activities: [
      {
        section: "L01",
        activity: "محاضرة",
        instructor: "Dr. Noor",
        day: 2,
        startMinutes: 11 * 60,
        endMinutes: 12 * 60,
        examDateISO: "2025-06-02",
      },
      {
        section: "L02",
        activity: "محاضرة",
        instructor: "Dr. Noor",
        day: 4,
        startMinutes: 14 * 60,
        endMinutes: 15 * 60,
        examDateISO: "2025-06-02",
      },
    ],
  },
  {
    courseCode: "SWE426",
    courseName: "DevOps Engineering",
    activities: [
      {
        section: "L01",
        activity: "محاضرة",
        instructor: "Dr. Omar",
        day: 1,
        startMinutes: 9 * 60 + 30,
        endMinutes: 10 * 60 + 30,
        examDateISO: "2025-06-15",
      },
      {
        section: "L02",
        activity: "محاضرة",
        instructor: "Dr. Omar",
        day: 3,
        startMinutes: 13 * 60,
        endMinutes: 14 * 60,
        examDateISO: "2025-06-15",
      },
    ],
  },
];

// Tutorials/labs remain bound to their lecture (not independently selectable) – enforced by adding/removing whole course grouping.

export default function StudentRegisterPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CourseSection[]>([]);

  const schedule = useMemo(
    () => buildScheduleFromSelections(selected),
    [selected]
  );
  const conflicts = useMemo(() => detectSectionConflicts(selected), [selected]);
  const highlightMap = useMemo(
    () => buildHighlightMapForConflicts(conflicts),
    [conflicts]
  );

  const filteredCatalog = useMemo(
    () =>
      CATALOG.filter(
        (c) =>
          c.courseCode.toLowerCase().includes(query.toLowerCase()) ||
          c.courseName.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const isSelectedCourse = useCallback(
    (code: string) => selected.some((s) => s.course.courseCode === code),
    [selected]
  );

  const toggleAddCourse = useCallback((course: CatalogCourseInput) => {
    setSelected((prev) => {
      const exists = prev.filter(
        (s) => s.course.courseCode === course.courseCode
      );
      if (exists.length > 0) {
        // remove all sections of that course
        return prev.filter((s) => s.course.courseCode !== course.courseCode);
      }
      // Add default (all activities for simplicity). Could refine to choose specific sections
      const newSections = course.activities.map((a) =>
        activityToCourseSection(course, a)
      );
      return [...prev, ...newSections];
    });
  }, []);

  const handleCourseBlockClick = useCallback((courseCode: string) => {
    // remove specific course when clicking a block inside grid
    setSelected((prev) =>
      prev.filter((s) => s.course.courseCode !== courseCode)
    );
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Student Registration (Prototype)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add/remove SWE course sections and visualize weekly schedule.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Catalog */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search course (code or name)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <ScrollArea className="h-[480px] border rounded-md p-2 bg-muted/30">
                <div className="space-y-3">
                  {filteredCatalog.map((c) => {
                    const selectedFlag = isSelectedCourse(c.courseCode);
                    return (
                      <div
                        key={c.courseCode}
                        className={cn(
                          "rounded-lg border p-3 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-2",
                          selectedFlag && "ring-2 ring-primary/60"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-semibold tracking-tight text-sm">
                              {c.courseCode}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {c.courseName}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant={selectedFlag ? "destructive" : "secondary"}
                            onClick={() => toggleAddCourse(c)}
                          >
                            {selectedFlag ? "Remove" : "Add"}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.activities.map((a, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px]"
                            >
                              {a.section} {a.activity}{" "}
                              {Math.round((a.endMinutes - a.startMinutes) / 60)}
                              h
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCatalog.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8">
                      No courses found
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="text-xs text-muted-foreground">
                Click Add to include all listed activities (lecture/tutorial/lab
                if any). You can remove by clicking the Remove button or
                clicking any block in the schedule.
              </div>
            </div>
            {/* Schedule */}
            <div className="w-full md:flex-1 space-y-4">
              <ScheduleGrid
                schedule={schedule}
                showLegend
                onCourseClick={handleCourseBlockClick}
                tutorialDarker
                highlightMap={highlightMap}
              />
              <div className="border rounded-md p-3 bg-muted/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="font-semibold block">Courses</span>
                  {
                    Array.from(
                      new Set(selected.map((s) => s.course.courseCode))
                    ).length
                  }
                </div>
                <div>
                  <span className="font-semibold block">Sections</span>
                  {selected.length}
                </div>
                <div>
                  <span className="font-semibold block">Hours</span>
                  {schedule.metadata.totalHours.toFixed(1)} h
                </div>
                <div>
                  <span className="font-semibold block">Days Used</span>
                  {schedule.metadata.daysUsed.length}
                </div>
                <div className="col-span-2 md:col-span-4">
                  <span className="font-semibold mr-1">Conflicts:</span>
                  {conflicts.length === 0 ? (
                    <span className="text-green-600 text-xs">None</span>
                  ) : (
                    <span className="text-red-600 text-xs">
                      {conflicts.length} overlap{conflicts.length > 1 && "s"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selected.length === 0}
                  onClick={() => setSelected([])}
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  disabled={selected.length === 0}
                  onClick={() => {
                    console.log("Register payload:", {
                      courses: Array.from(
                        new Set(selected.map((s) => s.course.courseCode))
                      ),
                      sections: selected.map((s) => ({
                        code: s.course.courseCode,
                        section: s.course.section,
                        activity: s.course.activity,
                        id: sectionKey(s),
                      })),
                      conflicts: conflicts.map((c) => ({
                        a: sectionKey(c.a),
                        b: sectionKey(c.b),
                        overlapMinutes: c.overlapMinutes,
                      })),
                    });
                  }}
                >
                  Submit Registration (Console)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
