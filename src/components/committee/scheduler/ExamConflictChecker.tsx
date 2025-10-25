/**
 * ExamConflictChecker Component
 * 
 * Detects and displays exam scheduling conflicts:
 * - Time overlaps (students with multiple exams at same time)
 * - Room conflicts (same room booked for multiple exams)
 * - Exam spacing violations (exams too close together)
 * - Provides resolution suggestions
 */

"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Users,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import type { ExamRecord } from "./ExamTable";
import type { ScheduleConflict } from "@/types/scheduler";

interface ExamConflictCheckerProps {
  exams: ExamRecord[];
  conflicts: ScheduleConflict[];
  termCode: string;
  onResolveConflict?: (conflictId: string) => void;
  onRefresh?: () => void;
}

interface DetectedConflict {
  id: string;
  type: "time_overlap" | "room_conflict" | "exam_spacing" | "missing_room";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedExams: ExamRecord[];
  suggestions: string[];
}

export const ExamConflictChecker: React.FC<ExamConflictCheckerProps> = ({
  exams,
  conflicts: apiConflicts,
  termCode,
  onResolveConflict,
  onRefresh,
}) => {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Detect local conflicts from exams data
   */
  const detectedConflicts = useMemo((): DetectedConflict[] => {
    const conflicts: DetectedConflict[] = [];

    // Check for time overlaps (same date and time)
    const examsByDateTime = new Map<string, ExamRecord[]>();
    exams.forEach((exam) => {
      const key = `${exam.date}_${exam.time}`;
      if (!examsByDateTime.has(key)) {
        examsByDateTime.set(key, []);
      }
      examsByDateTime.get(key)!.push(exam);
    });

    examsByDateTime.forEach((examsAtSameTime, dateTime) => {
      if (examsAtSameTime.length > 1) {
        conflicts.push({
          id: `time_overlap_${dateTime}`,
          type: "time_overlap",
          severity: "critical",
          title: "Time Overlap Detected",
          description: `${examsAtSameTime.length} exams scheduled at the same time`,
          affectedExams: examsAtSameTime,
          suggestions: [
            "Reschedule one or more exams to a different time",
            "Split exams across different dates",
            "Ensure students can attend all their exams",
          ],
        });
      }
    });

    // Check for room conflicts (same room at same time)
    const roomBookings = new Map<string, Map<string, ExamRecord[]>>();
    exams.forEach((exam) => {
      if (exam.room) {
        if (!roomBookings.has(exam.room)) {
          roomBookings.set(exam.room, new Map());
        }
        const roomSlots = roomBookings.get(exam.room)!;
        const timeKey = `${exam.date}_${exam.time}`;
        if (!roomSlots.has(timeKey)) {
          roomSlots.set(timeKey, []);
        }
        roomSlots.get(timeKey)!.push(exam);
      }
    });

    roomBookings.forEach((slots, room) => {
      slots.forEach((examsInRoom, timeKey) => {
        if (examsInRoom.length > 1) {
          conflicts.push({
            id: `room_conflict_${room}_${timeKey}`,
            type: "room_conflict",
            severity: "critical",
            title: "Room Double-Booked",
            description: `Room ${room} is booked for ${examsInRoom.length} exams at the same time`,
            affectedExams: examsInRoom,
            suggestions: [
              `Assign different rooms for these exams`,
              "Reschedule one exam to a different time",
              "Use larger room if capacity is the issue",
            ],
          });
        }
      });
    });

    // Check for missing room assignments
    const examsWithoutRooms = exams.filter((exam) => !exam.room);
    if (examsWithoutRooms.length > 0) {
      conflicts.push({
        id: "missing_rooms",
        type: "missing_room",
        severity: "warning",
        title: "Exams Without Room Assignments",
        description: `${examsWithoutRooms.length} exam${examsWithoutRooms.length !== 1 ? "s" : ""} need room assignments`,
        affectedExams: examsWithoutRooms,
        suggestions: [
          "Assign appropriate rooms based on expected attendance",
          "Consider room capacity when assigning",
          "Check room availability for the scheduled time",
        ],
      });
    }

    // Check for exam spacing (exams on consecutive days or same day)
    const examsByDate = new Map<string, ExamRecord[]>();
    exams.forEach((exam) => {
      if (!examsByDate.has(exam.date)) {
        examsByDate.set(exam.date, []);
      }
      examsByDate.get(exam.date)!.push(exam);
    });

    examsByDate.forEach((examsOnDate, date) => {
      if (examsOnDate.length > 3) {
        conflicts.push({
          id: `exam_spacing_${date}`,
          type: "exam_spacing",
          severity: "warning",
          title: "Heavy Exam Day",
          description: `${examsOnDate.length} exams scheduled on ${date}`,
          affectedExams: examsOnDate,
          suggestions: [
            "Consider spreading exams across more days",
            "Check if students have multiple exams on this day",
            "Ensure adequate time gaps between exams",
          ],
        });
      }
    });

    return conflicts;
  }, [exams]);

  // Combine API conflicts with detected conflicts
  const allConflicts = useMemo(() => {
    const combined = [...detectedConflicts];
    
    // Add API conflicts if they don't duplicate local detections
    apiConflicts.forEach((apiConflict) => {
      if (!combined.some(c => c.id === apiConflict.id)) {
        combined.push({
          id: apiConflict.id || `api_${Date.now()}`,
          type: apiConflict.type as any,
          severity: apiConflict.severity,
          title: apiConflict.title,
          description: apiConflict.description,
          affectedExams: [],
          suggestions: apiConflict.resolution_suggestions || [],
        });
      }
    });

    return combined;
  }, [detectedConflicts, apiConflicts]);

  // Group conflicts by severity
  const conflictsBySeverity = useMemo(() => {
    return {
      critical: allConflicts.filter((c) => c.severity === "critical"),
      warning: allConflicts.filter((c) => c.severity === "warning"),
      info: allConflicts.filter((c) => c.severity === "info"),
    };
  }, [allConflicts]);

  const handleRefresh = async () => {
    setIsChecking(true);
    await onRefresh?.();
    setTimeout(() => setIsChecking(false), 1000);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50";
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/50";
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/50";
      default:
        return "";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours ?? "", 10);
    if (Number.isNaN(hour) || !minutes) return time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Conflict Detection
              </CardTitle>
              <CardDescription>
                Automatically detect and resolve exam scheduling conflicts
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isChecking}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/50">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {conflictsBySeverity.critical.length}
                </div>
                <div className="text-xs text-red-600/80">Critical</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/50">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {conflictsBySeverity.warning.length}
                </div>
                <div className="text-xs text-yellow-600/80">Warnings</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/50">
              <Info className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {conflictsBySeverity.info.length}
                </div>
                <div className="text-xs text-blue-600/80">Info</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Conflicts Message */}
      {allConflicts.length === 0 && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-500">
            <strong>No conflicts detected!</strong> All exams are properly scheduled without conflicts.
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts List */}
      {allConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Detected Conflicts ({allConflicts.length})
            </CardTitle>
            <CardDescription>
              Review and resolve scheduling conflicts below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {allConflicts.map((conflict, index) => (
                <AccordionItem key={conflict.id} value={conflict.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left w-full">
                      {getSeverityIcon(conflict.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{conflict.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {conflict.description}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          conflict.severity === "critical"
                            ? "border-red-600 text-red-600"
                            : conflict.severity === "warning"
                            ? "border-yellow-600 text-yellow-600"
                            : "border-blue-600 text-blue-600"
                        }
                      >
                        {conflict.severity}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div
                      className={`p-4 rounded-lg border space-y-4 ${getSeverityColor(
                        conflict.severity
                      )}`}
                    >
                      {/* Affected Exams */}
                      {conflict.affectedExams.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Affected Exams ({conflict.affectedExams.length})
                          </div>
                          <div className="space-y-2">
                            {conflict.affectedExams.map((exam) => (
                              <div
                                key={exam.id}
                                className="p-3 bg-white dark:bg-gray-950 rounded border border-border text-sm"
                              >
                                <div className="font-medium">
                                  {exam.courseCode} - {exam.courseName}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(exam.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(exam.time)}
                                  </span>
                                  {exam.room && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {exam.room}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resolution Suggestions */}
                      {conflict.suggestions.length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Suggested Resolutions
                          </div>
                          <ul className="space-y-1">
                            {conflict.suggestions.map((suggestion, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => onResolveConflict?.(conflict.id)}
                        >
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamConflictChecker;

