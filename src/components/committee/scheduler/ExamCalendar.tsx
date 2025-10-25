/**
 * ExamCalendar Component
 * 
 * Calendar view of all scheduled exams with:
 * - Monthly calendar layout
 * - Exam badges on dates
 * - Color-coded by exam type
 * - Click to view exam details
 */

"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  MapPin,
  BookOpen,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { ExamRecord } from "./ExamTable";

interface ExamCalendarProps {
  exams: ExamRecord[];
  termCode: string;
  onExamClick?: (exam: ExamRecord) => void;
}

export const ExamCalendar: React.FC<ExamCalendarProps> = ({
  exams,
  termCode,
  onExamClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Group exams by date
  const examsByDate = useMemo(() => {
    const grouped = new Map<string, ExamRecord[]>();
    
    exams.forEach((exam) => {
      const dateKey = exam.date; // YYYY-MM-DD format
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(exam);
    });
    
    return grouped;
  }, [exams]);

  // Get exams for selected date
  const selectedDateExams = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split("T")[0];
    return examsByDate.get(dateKey) || [];
  }, [selectedDate, examsByDate]);

  // Get all dates with exams
  const datesWithExams = useMemo(() => {
    return Array.from(examsByDate.keys()).map(dateStr => new Date(dateStr));
  }, [examsByDate]);

  // Exam type styling
  const getExamTypeColor = (type: ExamRecord["type"]): string => {
    switch (type) {
      case "midterm":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "midterm2":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "final":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getExamTypeLabel = (type: ExamRecord["type"]): string => {
    switch (type) {
      case "midterm":
        return "Midterm";
      case "midterm2":
        return "Midterm 2";
      case "final":
        return "Final";
      default:
        return type;
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return "—";
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours ?? "", 10);
    if (Number.isNaN(hour) || !minutes) return time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateKey = date.toISOString().split("T")[0];
      const examsOnDate = examsByDate.get(dateKey);
      if (examsOnDate && examsOnDate.length > 0) {
        setDetailsOpen(true);
      }
    }
  };

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Get exam count for a specific date
  const getExamCountForDate = (date: Date): number => {
    const dateKey = date.toISOString().split("T")[0];
    return examsByDate.get(dateKey)?.length || 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar View */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Exam Calendar</CardTitle>
              <CardDescription>
                Click on a date to view scheduled exams
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                {selectedMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            className="rounded-md border"
            modifiers={{
              hasExam: datesWithExams,
            }}
            modifiersClassNames={{
              hasExam: "bg-primary/10 font-bold",
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {selectedDate ? formatDate(selectedDate) : "Select a Date"}
          </CardTitle>
          <CardDescription>
            {selectedDateExams.length > 0
              ? `${selectedDateExams.length} exam${selectedDateExams.length !== 1 ? "s" : ""} scheduled`
              : "No exams scheduled"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateExams.length > 0 ? (
            <div className="space-y-3">
              {selectedDateExams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    onExamClick?.(exam);
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {exam.courseCode}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {exam.courseName}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] uppercase ${getExamTypeColor(exam.type)}`}
                    >
                      {getExamTypeLabel(exam.type)}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(exam.time)} ({exam.duration} min)</span>
                    </div>
                    {exam.room && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{exam.room}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No exams scheduled for this date</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exam Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? formatDate(selectedDate) : "Exam Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDateExams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-semibold">
                        {exam.courseCode}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {exam.courseName}
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={getExamTypeColor(exam.type)}
                    >
                      {getExamTypeLabel(exam.type)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-muted-foreground">
                          {formatTime(exam.time)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div className="text-muted-foreground">
                          {exam.duration} minutes
                        </div>
                      </div>
                    </div>

                    {exam.room && (
                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Room</div>
                          <div className="text-muted-foreground">
                            {exam.room}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {exam.sectionIds && exam.sectionIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-medium mb-2">Sections</div>
                      <div className="flex flex-wrap gap-1">
                        {exam.sectionIds.map((sectionId) => (
                          <Badge
                            key={sectionId}
                            variant="outline"
                            className="text-xs"
                          >
                            {sectionId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamCalendar;

