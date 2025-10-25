/**
 * SchedulePreviewer Component
 * 
 * Displays a weekly calendar view of generated schedules with:
 * - Interactive weekly grid
 * - Color-coded courses
 * - Time slot visualization
 * - Course details on hover
 */

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  User
} from "lucide-react";
import type { DayOfWeek } from "@/types/database";

export interface ScheduleSection {
  id: string;
  course_code: string;
  course_name: string;
  instructor_name: string | null;
  room_number: string | null;
  capacity: number;
  time_slots: {
    day: DayOfWeek;
    start_time: string; // HH:MM
    end_time: string;   // HH:MM
  }[];
}

export interface SchedulePreviewerProps {
  sections: ScheduleSection[];
  title?: string;
  showNavigation?: boolean;
}

const DAYS_ORDER: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00"
];

// Color palette for different courses
const COURSE_COLORS = [
  "bg-blue-100 border-blue-300 text-blue-900",
  "bg-green-100 border-green-300 text-green-900",
  "bg-purple-100 border-purple-300 text-purple-900",
  "bg-orange-100 border-orange-300 text-orange-900",
  "bg-pink-100 border-pink-300 text-pink-900",
  "bg-indigo-100 border-indigo-300 text-indigo-900",
  "bg-teal-100 border-teal-300 text-teal-900",
  "bg-amber-100 border-amber-300 text-amber-900",
];

export function SchedulePreviewer({
  sections,
  title = "Schedule Preview",
  showNavigation = false,
}: SchedulePreviewerProps) {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Create a color map for courses
  const courseColorMap = useMemo(() => {
    const uniqueCourses = Array.from(new Set(sections.map(s => s.course_code)));
    const map = new Map<string, string>();
    uniqueCourses.forEach((course, idx) => {
      map.set(course, COURSE_COLORS[idx % COURSE_COLORS.length]);
    });
    return map;
  }, [sections]);

  // Build a grid structure: Map<day, Map<timeSlot, Section[]>>
  const scheduleGrid = useMemo(() => {
    const grid = new Map<DayOfWeek, Map<string, ScheduleSection[]>>();

    sections.forEach((section) => {
      section.time_slots.forEach((slot) => {
        if (!grid.has(slot.day)) {
          grid.set(slot.day, new Map());
        }
        const dayMap = grid.get(slot.day)!;
        
        if (!dayMap.has(slot.start_time)) {
          dayMap.set(slot.start_time, []);
        }
        dayMap.get(slot.start_time)!.push(section);
      });
    });

    return grid;
  }, [sections]);

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueCourses = new Set(sections.map(s => s.course_code));
    const totalCredits = sections.reduce((sum, s) => {
      // Assuming 3 credits per course (you might want to pass this in)
      return sum;
    }, 0);

    return {
      totalSections: sections.length,
      uniqueCourses: uniqueCourses.size,
      totalCredits: uniqueCourses.size * 3, // Assuming 3 credits per course
    };
  }, [sections]);

  if (sections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Schedule Generated</p>
            <p className="text-sm text-muted-foreground max-w-md">
              Generate a schedule to see the weekly view of classes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Weekly schedule view with {stats.uniqueCourses} courses
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {stats.totalSections} sections
            </Badge>
            <Badge variant="secondary">
              {stats.totalCredits} credits
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Navigation */}
        {showNavigation && (
          <div className="flex items-center justify-between pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(prev => Math.max(0, prev - 1))}
              disabled={currentWeek === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>

            <div className="text-center">
              <div className="text-sm font-medium">
                Week {currentWeek + 1}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(prev => prev + 1)}
            >
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Course Legend */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Courses:</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(sections.map(s => s.course_code))).map((code) => {
              const section = sections.find(s => s.course_code === code);
              return (
                <div
                  key={code}
                  className={`px-3 py-1.5 rounded-md border text-xs font-medium ${courseColorMap.get(code)}`}
                >
                  {code} - {section?.course_name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium w-20 sticky left-0 bg-muted z-10">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </th>
                  {DAYS_ORDER.map((day) => (
                    <th
                      key={day}
                      className="border p-3 text-center font-medium min-w-[160px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-muted/30 transition-colors">
                    <td className="border p-2 text-sm text-muted-foreground font-mono sticky left-0 bg-background z-10">
                      {timeSlot}
                    </td>
                    {DAYS_ORDER.map((day) => {
                      const dayMap = scheduleGrid.get(day);
                      const sectionsAtTime = dayMap?.get(timeSlot) || [];

                      return (
                        <td key={`${day}-${timeSlot}`} className="border p-1 align-top">
                          {sectionsAtTime.length > 0 && (
                            <div className="space-y-1">
                              {sectionsAtTime.map((section) => {
                                const timeSlot = section.time_slots.find(
                                  ts => ts.day === day && ts.start_time === timeSlot
                                );
                                
                                return (
                                  <div
                                    key={section.id}
                                    className={`p-2 rounded-md border-l-4 transition-all hover:shadow-md cursor-pointer ${courseColorMap.get(section.course_code)}`}
                                    title={`${section.course_name} - ${section.instructor_name || 'TBA'}`}
                                  >
                                    <div className="font-semibold text-sm mb-1">
                                      {section.course_code}
                                    </div>
                                    
                                    {section.instructor_name && (
                                      <div className="flex items-center gap-1 text-xs mb-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">
                                          {section.instructor_name}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {section.room_number && (
                                      <div className="flex items-center gap-1 text-xs mb-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>{section.room_number}</span>
                                      </div>
                                    )}
                                    
                                    {timeSlot && (
                                      <div className="flex items-center gap-1 text-xs font-mono">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                          {timeSlot.start_time} - {timeSlot.end_time}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.uniqueCourses}</div>
            <div className="text-sm text-muted-foreground">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalSections}</div>
            <div className="text-sm text-muted-foreground">Sections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
            <div className="text-sm text-muted-foreground">Total Credits</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
