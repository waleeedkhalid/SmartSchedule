"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FacultyStatusCardsProps {
  assignedCoursesCount: number;
  schedulePublished: boolean;
  canViewFeedback: boolean;
  feedbackOpen: boolean;
}

export default function FacultyStatusCards({
  assignedCoursesCount,
  schedulePublished,
  canViewFeedback,
  feedbackOpen,
}: FacultyStatusCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Assigned Courses */}
      <Card className="border-2 transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assigned Courses
              </p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">{assignedCoursesCount}</p>
                <p className="text-sm text-muted-foreground">
                  {assignedCoursesCount === 1 ? "course" : "courses"}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                assignedCoursesCount > 0
                  ? "bg-primary/10"
                  : "bg-muted"
              )}
            >
              <BookOpen
                className={cn(
                  "h-7 w-7",
                  assignedCoursesCount > 0
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Status */}
      <Card className="border-2 transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Schedule Status
              </p>
              <div className="flex items-center gap-2">
                {schedulePublished ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="text-xl font-bold">Published</p>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-warning" />
                    <p className="text-xl font-bold">In Progress</p>
                  </>
                )}
              </div>
            </div>
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                schedulePublished
                  ? "bg-success/10"
                  : "bg-warning/10"
              )}
            >
              <Calendar
                className={cn(
                  "h-7 w-7",
                  schedulePublished
                    ? "text-success"
                    : "text-warning"
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Status */}
      <Card className="border-2 transition-all hover:shadow-lg hover:border-primary/50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Feedback Access
              </p>
              <div className="flex items-center gap-2">
                {canViewFeedback ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <p className="text-xl font-bold">Available</p>
                  </>
                ) : feedbackOpen ? (
                  <>
                    <Clock className="h-5 w-5 text-primary" />
                    <p className="text-xl font-bold">In Progress</p>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <p className="text-xl font-bold">Locked</p>
                  </>
                )}
              </div>
            </div>
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                canViewFeedback
                  ? "bg-success/10"
                  : feedbackOpen
                    ? "bg-primary/10"
                    : "bg-muted"
              )}
            >
              <MessageSquare
                className={cn(
                  "h-7 w-7",
                  canViewFeedback
                    ? "text-success"
                    : feedbackOpen
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

