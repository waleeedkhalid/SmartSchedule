"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

export type ExamType = "midterm" | "midterm2" | "final";

export interface ExamRecord {
  id: string;
  courseCode: string;
  courseName: string;
  type: ExamType;
  date: string;
  time: string;
  duration: number;
  room?: string;
  sectionIds: string[];
}

interface ExamTableProps {
  exams: ExamRecord[];
}

export const ExamTable: React.FC<ExamTableProps> = ({ exams }) => {
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return date;
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const getExamTypeBadge = (type: ExamType) => {
    const variants: Record<
      ExamType,
      { variant: "default" | "secondary" | "outline"; label: string }
    > = {
      midterm: { variant: "default", label: "Midterm" },
      midterm2: { variant: "secondary", label: "Midterm 2" },
      final: { variant: "outline", label: "Final" },
    };
    return variants[type];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Exam Schedule</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              View all scheduled exams for SWE courses
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{exams.length} exams scheduled</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Course</TableHead>
                <TableHead className="w-28">Type</TableHead>
                <TableHead className="w-48">Date</TableHead>
                <TableHead className="w-28">Time</TableHead>
                <TableHead className="w-24">Duration</TableHead>
                <TableHead className="w-28">Room</TableHead>
                <TableHead>Sections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => {
                const examBadge = getExamTypeBadge(exam.type);
                return (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm">
                          {exam.courseCode}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {exam.courseName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={examBadge.variant} className="text-xs">
                        {examBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(exam.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatTime(exam.time)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {exam.duration} min
                    </TableCell>
                    <TableCell>
                      {exam.room ? (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{exam.room}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          TBD
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {exam.sectionIds.slice(0, 3).map((sectionId) => (
                          <Badge
                            key={sectionId}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {sectionId}
                          </Badge>
                        ))}
                        {exam.sectionIds.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            +{exam.sectionIds.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-12 w-12 text-muted-foreground/50" />
                      <p className="font-medium">No exams scheduled yet</p>
                      <p className="text-xs">
                        Exams will appear here once they are scheduled
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamTable;
