/**
 * Student Exam Timetable Component
 *
 * Purpose: Display exam schedule in a modern calendar view with conflict detection
 *
 * Features:
 * - Calendar grid view for month overview
 * - List view with detailed exam information
 * - Conflict warnings for overlapping exams
 * - Countdown to next exam
 * - Room and duration information
 * - Uses React Query for optimal caching
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  List,
  Grid3X3,
  Timer,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  format,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { cn } from "@/lib/utils";

interface ExamData {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string | null;
  date: string;
  start_time: string;
  duration_minutes: number;
  end_time: string;
  room_codes: string[];
  has_conflict: boolean;
  conflicting_exams: {
    course_code: string;
    course_title: string;
  }[];
}

interface ExamsResponse {
  exams: ExamData[];
  total_exams: number;
  has_conflicts: boolean;
  is_empty?: boolean;
  message?: string;
}

type ViewMode = "calendar" | "list";

/**
 * Fetch exams from API with proper error handling
 */
async function fetchExams(): Promise<ExamsResponse> {
  const authHeader = await getAuthHeader();
  const response = await fetch("/api/v1/exams/me", {
    headers: authHeader ? { Authorization: authHeader } : {},
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch exams`);
  }

  const result = await response.json();
  return (
    result.data || {
      exams: [],
      total_exams: 0,
      has_conflicts: false,
      is_empty: true,
      message: "No exams available",
    }
  );
}

// Helper to get initial date for SSR-safe rendering
// Using a function that returns undefined initially to avoid hydration mismatch
function getInitialDate(): Date {
  // This will be called only on the client after hydration
  return new Date();
}

export function StudentExamTimetable() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  // Initialize with a stable value to avoid hydration mismatch
  // We'll set the actual date after mount
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Set the initial date after hydration to avoid mismatch
  useEffect(() => {
    if (!isHydrated) {
      setCurrentMonth(new Date());
      setIsHydrated(true);
    }
  }, [isHydrated]);

  // Use React Query for data fetching with proper caching
  const {
    data: examsData,
    isLoading,
    error,
  } = useQuery<ExamsResponse>({
    queryKey: ["student-exams"],
    queryFn: fetchExams,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Show error toast when query fails
  if (error) {
    toast.error(
      error instanceof Error ? error.message : "Failed to load exam timetable"
    );
  }

  // Create exam map by date for calendar view
  const examsByDate = useMemo(() => {
    const map = new Map<string, ExamData[]>();
    if (examsData?.exams) {
      examsData.exams.forEach((exam) => {
        const dateKey = exam.date;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(exam);
      });
    }
    return map;
  }, [examsData]);

  // Find next upcoming exam
  const nextExam = useMemo(() => {
    if (!examsData?.exams?.length) return null;
    const now = new Date();
    return (
      examsData.exams.find((exam) => {
        const examDate = new Date(`${exam.date}T${exam.start_time}`);
        return examDate > now;
      }) || null
    );
  }, [examsData]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    // Return empty array if currentMonth is not yet set (during hydration)
    if (!currentMonth) return [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for the start of the week
    const startPadding = getDay(monthStart);
    const paddingDays: (Date | null)[] = Array(startPadding).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  // Get exams for selected date
  const selectedDateExams = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return examsByDate.get(dateKey) || [];
  }, [selectedDate, examsByDate]);

  // Format time for display
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Navigation handlers
  const goToPreviousMonth = () =>
    currentMonth && setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () =>
    currentMonth && setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Show loading state during hydration
  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">
            Loading exam schedule...
          </p>
        </div>
      </div>
    );
  }

  const hasExams = examsData && examsData.exams && examsData.exams.length > 0;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Exams */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {examsData?.total_exams ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Exam Countdown */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Timer className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  {nextExam ? (
                    <>
                      <p className="text-sm font-semibold truncate">
                        {nextExam.course_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(`${nextExam.date}T${nextExam.start_time}`),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">All Done!</p>
                      <p className="text-xs text-muted-foreground">
                        No upcoming exams
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conflicts */}
          <Card
            className={cn(
              "border-border",
              examsData?.has_conflicts && "border-destructive/50"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    examsData?.has_conflicts ? "bg-destructive/10" : "bg-muted"
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "h-5 w-5",
                      examsData?.has_conflicts
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {examsData?.has_conflicts
                      ? "Conflicts Found"
                      : "No Conflicts"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {examsData?.has_conflicts
                      ? "Contact registrar"
                      : "Schedule looks good"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Exam Tips</p>
                <p className="text-xs text-muted-foreground">
                  Arrive 15 minutes early • Bring your student ID • Check room
                  locations in advance • Report conflicts to the registrar at
                  least one week before
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold min-w-[160px] text-center">
                  {currentMonth
                    ? format(currentMonth, "MMMM yyyy")
                    : "Loading..."}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs ml-2"
                  onClick={goToToday}
                >
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === "calendar" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode("calendar")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {viewMode === "calendar" ? (
              <div className="space-y-4">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {/* Calendar Days */}
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="bg-card p-2 min-h-[80px]"
                        />
                      );
                    }

                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayExams = examsByDate.get(dateKey) || [];
                    const hasExams = dayExams.length > 0;
                    const hasConflict = dayExams.some((e) => e.has_conflict);
                    const isSelected =
                      selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "bg-card p-2 min-h-[80px] text-left transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                          !isSameMonth(day as Date, currentMonth as Date) &&
                            "opacity-50",
                          isSelected && "ring-2 ring-primary ring-inset",
                          isToday(day as Date) && "bg-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-sm",
                              isToday(day) && "font-semibold text-primary"
                            )}
                          >
                            {format(day, "d")}
                          </span>
                          {hasConflict && (
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                          )}
                        </div>
                        {hasExams && (
                          <div className="space-y-1">
                            {dayExams.slice(0, 2).map((exam) => (
                              <Tooltip key={exam.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "text-xs px-1.5 py-0.5 rounded truncate",
                                      exam.has_conflict
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-primary/10 text-primary"
                                    )}
                                  >
                                    {exam.course_code}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-[200px]"
                                >
                                  <p className="font-medium">
                                    {exam.course_code}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {exam.course_title}
                                  </p>
                                  <p className="text-xs mt-1">
                                    {formatTime(exam.start_time)} -{" "}
                                    {formatTime(exam.end_time)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {dayExams.length > 2 && (
                              <div className="text-xs text-muted-foreground px-1.5">
                                +{dayExams.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Date Details */}
                {selectedDate && selectedDateExams.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">
                      {isHydrated && selectedDate
                        ? format(selectedDate, "EEEE, MMMM d, yyyy")
                        : ""}
                    </h3>
                    <div className="space-y-2">
                      {selectedDateExams.map((exam) => (
                        <ExamCard
                          key={exam.id}
                          exam={exam}
                          formatTime={formatTime}
                          isHydrated={isHydrated}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedDateExams.length === 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No exams scheduled for{" "}
                      {isHydrated && selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div className="space-y-3">
                {hasExams ? (
                  examsData!.exams.map((exam) => (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      formatTime={formatTime}
                      showDate
                      isHydrated={isHydrated}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      No exams scheduled yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

/**
 * Exam Card Component
 * Displays individual exam details in a clean, compact format
 */
function ExamCard({
  exam,
  formatTime,
  showDate = false,
  isHydrated = false,
}: {
  exam: ExamData;
  formatTime: (time: string) => string;
  showDate?: boolean;
  isHydrated?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-colors",
        exam.has_conflict
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card hover:bg-muted/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{exam.course_code}</span>
            {exam.section_no && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                Sec {exam.section_no}
              </Badge>
            )}
            {exam.has_conflict && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Conflict
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {exam.course_title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
        {showDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {isHydrated ? format(new Date(exam.date), "MMM d, yyyy") : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          <span>{exam.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">
            {exam.room_codes.join(", ") || "TBA"}
          </span>
        </div>
      </div>

      {exam.has_conflict && exam.conflicting_exams.length > 0 && (
        <div className="mt-2 pt-2 border-t border-destructive/20">
          <p className="text-xs text-destructive">
            <span className="font-medium">Conflicts with:</span>{" "}
            {exam.conflicting_exams.map((c) => c.course_code).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
