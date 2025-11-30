/**
 * Student Exam Timetable Component
 *
 * Purpose: Display exam schedule with conflict detection
 *
 * Features:
 * - List of all exams sorted by date/time
 * - Conflict warnings for overlapping exams
 * - Countdown to next exam
 * - Room and duration information
 * - Grouped by date for clarity
 *
 * Data Flow:
 * 1. Fetch exams from API (includes conflict detection)
 * 2. Group by date
 * 3. Calculate time until next exam
 * 4. Display with warnings for conflicts
 */

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { cachedFetch, CacheTTL } from "@/lib/utils/api-cache";

interface ExamData {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
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

export function StudentExamTimetable() {
  const [examsData, setExamsData] = useState<ExamsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextExam, setNextExam] = useState<ExamData | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  /**
   * Fetch exam timetable from API
   * Only fetches if schedule is released
   */
  async function fetchExams() {
    setLoading(true);
    try {
      const authHeader = await getAuthHeader();
      // Cache exams for 15 minutes - exam schedules don't change frequently
      const result = await cachedFetch<{ data: ExamsResponse }>(
        "/api/v1/exams/me",
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
        undefined,
        CacheTTL.LONG
      );
      const data: ExamsResponse = result.data || {
        exams: [],
        total_exams: 0,
        has_conflicts: false,
        is_empty: true,
        message: "No exams available",
      };

      // Preserve message if it exists in the response
      if (result.data?.message) {
        data.message = result.data.message;
      }

      setExamsData(data);

      // Find next upcoming exam
      if (data.exams && data.exams.length > 0) {
        const now = new Date();
        const upcoming = data.exams.find((exam: ExamData) => {
          const examDate = new Date(`${exam.date}T${exam.start_time}`);
          return examDate > now;
        });
        setNextExam(upcoming || null);
      }
    } catch (error: unknown) {
      console.error("Error fetching exams:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load exam timetable";
      toast.error(errorMessage);
      setExamsData({
        exams: [],
        total_exams: 0,
        has_conflicts: false,
        is_empty: true,
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Group exams by date for organized display
   */
  function groupExamsByDate(exams: ExamData[]) {
    const grouped: { [date: string]: ExamData[] } = {};

    exams.forEach((exam) => {
      if (!grouped[exam.date]) {
        grouped[exam.date] = [];
      }
      grouped[exam.date].push(exam);
    });

    // Sort exams within each date by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  }

  /**
   * Format date for display
   */
  function formatExamDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format time for display (remove seconds)
   */
  function formatTime(timeStr: string): string {
    return timeStr.substring(0, 5);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam timetable...</p>
        </div>
      </div>
    );
  }

  if (!examsData || examsData.total_exams === 0 || examsData.is_empty) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-xl font-semibold mb-2">No Exams Scheduled</p>
          <p className="text-sm text-muted-foreground mb-4">
            {examsData?.message ||
              "Exam dates will appear here once published by your department."}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-sm text-left">
            <p className="font-medium text-blue-900 mb-2">Exam Information:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Exam schedules are published by the registrar</li>
              <li>• Check back regularly for updates</li>
              <li>• Contact your department if you have questions</li>
              <li>• Exam conflicts will be flagged when detected</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const groupedExams = groupExamsByDate(examsData.exams);
  const examDates = Object.keys(groupedExams).sort();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Exam Timetable
          </CardTitle>
          <CardDescription>
            {examsData.total_exams} exams scheduled
            {examsData.has_conflicts && (
              <span className="text-yellow-600 font-medium ml-2">
                ⚠️ Conflicts detected
              </span>
            )}
          </CardDescription>
        </CardHeader>
        {nextExam && (
          <CardContent>
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <span className="font-semibold">Next Exam:</span>{" "}
                {nextExam.course_code} on {formatExamDate(nextExam.date)} at{" "}
                {formatTime(nextExam.start_time)}
                <span className="ml-2 text-xs">
                  (
                  {formatDistanceToNow(
                    new Date(`${nextExam.date}T${nextExam.start_time}`),
                    { addSuffix: true }
                  )}
                  )
                </span>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Global Conflict Warning */}
      {examsData.has_conflicts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have exam schedule conflicts. Please contact the registrar
            immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Exams Grouped by Date */}
      {examDates.map((date) => (
        <Card key={date}>
          <CardHeader>
            <CardTitle className="text-lg">{formatExamDate(date)}</CardTitle>
            <CardDescription>
              {groupedExams[date].length} exam
              {groupedExams[date].length !== 1 ? "s" : ""} on this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupedExams[date].map((exam) => (
                <div
                  key={exam.id}
                  className={`p-4 border rounded-lg ${
                    exam.has_conflict ? "border-red-300 bg-red-50" : "bg-white"
                  }`}
                >
                  {/* Exam Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg">
                          {exam.course_code}
                        </span>
                        {exam.section_no && (
                          <Badge variant="secondary">
                            Section {exam.section_no}
                          </Badge>
                        )}
                        {exam.has_conflict && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Conflict
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exam.course_title}
                      </p>
                    </div>
                  </div>

                  {/* Exam Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p className="text-muted-foreground">
                          {formatTime(exam.start_time)} -{" "}
                          {formatTime(exam.end_time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">
                          {exam.duration_minutes} minutes (
                          {(exam.duration_minutes / 60).toFixed(1)} hours)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Room{exam.room_codes.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-muted-foreground">
                          {exam.room_codes.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Details */}
                  {exam.has_conflict && exam.conflicting_exams.length > 0 && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-medium">Conflicts with:</span>{" "}
                        {exam.conflicting_exams
                          .map((c) => c.course_code)
                          .join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Exam Preparation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exam Preparation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Arrive at least 15 minutes before the exam start time</li>
            <li>• Bring your student ID and any required materials</li>
            <li>• Check the room location in advance to avoid delays</li>
            <li>
              • Review exam policies and allowed materials with your instructor
            </li>
            <li>
              • Report any conflicts to the registrar at least one week in
              advance
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
