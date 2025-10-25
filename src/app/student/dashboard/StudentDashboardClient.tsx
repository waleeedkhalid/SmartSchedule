"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BookOpen,
  Calendar,
  MessageSquare,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import UpcomingEvents from "@/components/student/UpcomingEvents";

interface StudentDashboardClientProps {
  fullName: string;
  email: string;
  studentNumber: string;
  level: number;
  status: string;
}

interface StudentStatus {
  hasSchedule: boolean;
  scheduleId: string | null;
  feedbackOpen: boolean;
  schedulePublished: boolean;
  canSubmitFeedback: boolean;
  hasSubmittedPreferences: boolean;
  hasSubmittedFeedback: boolean;
  activeTerm: string | null;
}

export default function StudentDashboardClient({
  fullName,
  email,
  studentNumber,
  level,
  status,
}: StudentDashboardClientProps) {
  const [studentStatus, setStudentStatus] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/student/status");
        const data = await response.json();

        if (data.success) {
          setStudentStatus(data.data);
        } else {
          setError(data.error || "Failed to fetch status");
        }
      } catch (err) {
        console.error("Error fetching student status:", err);
        setError("Failed to load student status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section with Background */}
      <div className="rounded-lg bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-8 shadow-sm border">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {fullName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {studentStatus?.activeTerm
                ? `Academic Term: ${studentStatus.activeTerm}`
                : "Manage your academic schedule and preferences"}
            </p>
          </div>
        </div>
      </div>

      {/* Status & Events Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Cards - spans 2 columns on large screens */}
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-3">
          {/* Electives Status */}
          <Card className="border-2 bg-white dark:bg-gray-950 transition-all hover:shadow-lg hover:border-primary/50">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Elective Preferences
                </p>
                <div className="flex items-center gap-2">
                  {studentStatus?.hasSubmittedPreferences ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-xl font-bold">Submitted</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <p className="text-xl font-bold">Pending</p>
                    </>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                  studentStatus?.hasSubmittedPreferences
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                )}
              >
                <BookOpen
                  className={cn(
                    "h-7 w-7",
                    studentStatus?.hasSubmittedPreferences
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Status */}
        <Card className="border-2 bg-white dark:bg-gray-950 transition-all hover:shadow-lg hover:border-primary/50">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Schedule Status
                </p>
                <div className="flex items-center gap-2">
                  {studentStatus?.hasSchedule ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-xl font-bold">Available</p>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xl font-bold">Pending</p>
                    </>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                  studentStatus?.hasSchedule
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-muted"
                )}
              >
                <Calendar
                  className={cn(
                    "h-7 w-7",
                    studentStatus?.hasSchedule
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-muted-foreground"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Status */}
        <Card className="border-2 bg-white dark:bg-gray-950 transition-all hover:shadow-lg hover:border-primary/50">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Feedback Status
                </p>
                <div className="flex items-center gap-2">
                  {studentStatus?.hasSubmittedFeedback ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-xl font-bold">Submitted</p>
                    </>
                  ) : studentStatus?.canSubmitFeedback ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <p className="text-xl font-bold">Open</p>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xl font-bold">Closed</p>
                    </>
                  )}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-xl shadow-sm",
                  studentStatus?.hasSubmittedFeedback
                    ? "bg-green-100 dark:bg-green-900/30"
                    : studentStatus?.canSubmitFeedback
                      ? "bg-orange-100 dark:bg-orange-900/30"
                      : "bg-muted"
                )}
              >
                <MessageSquare
                  className={cn(
                    "h-7 w-7",
                    studentStatus?.hasSubmittedFeedback
                      ? "text-green-600 dark:text-green-400"
                      : studentStatus?.canSubmitFeedback
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-muted-foreground"
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Upcoming Events - spans 1 column on large screens */}
        <div className="lg:col-span-1">
          <UpcomingEvents
            termCode={studentStatus?.activeTerm || undefined}
            limit={5}
            showViewAll={true}
          />
        </div>
      </div>

      {/* Alert Messages */}
      {!studentStatus?.hasSubmittedPreferences && (
        <Alert className="border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            Action Required
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 mt-2">
            Please submit your elective course preferences to ensure your schedule
            can be generated. The scheduling committee is waiting for your input.
          </AlertDescription>
        </Alert>
      )}

      {studentStatus?.canSubmitFeedback && (
        <Alert className="border-2 border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950 shadow-sm">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
            Feedback Open
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
            The feedback period is now open! Share your thoughts about your schedule
            to help us improve future scheduling.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            Profile Overview
          </CardTitle>
          <CardDescription>
            Your account information and academic status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Full Name</p>
              <p className="text-lg font-semibold">{fullName || "—"}</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{email}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Student Number
              </p>
              <p className="text-xl font-bold">
                {studentNumber || "Pending"}
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Level</p>
              <p className="text-xl font-bold">Level {level}</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <Badge variant={status === "active" ? "default" : "secondary"} className="mt-2 text-sm px-3 py-1">
                {status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2 bg-white dark:bg-gray-950 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>
            Access your schedule, preferences, and feedback options
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
          {/* Elective Preferences */}
          <Card className="border-2 bg-gradient-to-br from-white to-primary/5 dark:from-gray-950 dark:to-primary/5 transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">Elective Preferences</CardTitle>
                </div>
                {!studentStatus?.hasSubmittedPreferences && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm mt-2">
                Select and rank your preferred elective courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full shadow-sm" size="lg">
                <Link href="/student/electives">
                  {studentStatus?.hasSubmittedPreferences
                    ? "View Preferences"
                    : "Submit Preferences"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Schedule */}
          <Card
            className={cn(
              "border-2 bg-gradient-to-br transition-all",
              studentStatus?.hasSchedule
                ? "from-white to-blue-50 dark:from-gray-950 dark:to-blue-950/20 hover:border-primary hover:shadow-lg hover:scale-[1.02]"
                : "from-white to-muted dark:from-gray-950 dark:to-muted opacity-75"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  studentStatus?.hasSchedule ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"
                )}>
                  <Calendar className={cn(
                    "h-5 w-5",
                    studentStatus?.hasSchedule ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"
                  )} />
                </div>
                <CardTitle className="text-base">My Schedule</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                {studentStatus?.hasSchedule
                  ? "View your course schedule and exam dates"
                  : "Schedule not yet available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild={studentStatus?.hasSchedule}
                variant={studentStatus?.hasSchedule ? "default" : "outline"}
                className="w-full shadow-sm"
                size="lg"
                disabled={!studentStatus?.hasSchedule}
              >
                {studentStatus?.hasSchedule ? (
                  <Link href="/student/schedule">
                    View Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    View Schedule
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Submit Feedback */}
          <Card
            className={cn(
              "border-2 bg-gradient-to-br transition-all",
              studentStatus?.canSubmitFeedback
                ? "from-white to-orange-50 dark:from-gray-950 dark:to-orange-950/20 hover:border-primary hover:shadow-lg hover:scale-[1.02]"
                : "from-white to-muted dark:from-gray-950 dark:to-muted opacity-75"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    studentStatus?.canSubmitFeedback ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted"
                  )}>
                    <MessageSquare className={cn(
                      "h-5 w-5",
                      studentStatus?.canSubmitFeedback ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"
                    )} />
                  </div>
                  <CardTitle className="text-base">Schedule Feedback</CardTitle>
                </div>
                {studentStatus?.hasSubmittedFeedback && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Done
                  </Badge>
                )}
                {!studentStatus?.canSubmitFeedback && !studentStatus?.hasSubmittedFeedback && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="mr-1 h-3 w-3" />
                    Locked
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm mt-2">
                {!studentStatus?.hasSchedule
                  ? "Available after schedule is assigned"
                  : !studentStatus?.feedbackOpen
                    ? "Feedback period is currently closed"
                    : studentStatus?.hasSubmittedFeedback
                      ? "Thank you for your feedback"
                      : "Share your thoughts on your schedule"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild={studentStatus?.canSubmitFeedback}
                variant={studentStatus?.canSubmitFeedback ? "default" : "outline"}
                className="w-full shadow-sm"
                size="lg"
                disabled={!studentStatus?.canSubmitFeedback}
              >
                {studentStatus?.canSubmitFeedback ? (
                  <Link href="/student/feedback">
                    Submit Feedback
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    {studentStatus?.hasSubmittedFeedback
                      ? "Feedback Submitted"
                      : "Feedback Unavailable"}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="border-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all hover:border-primary hover:shadow-lg hover:scale-[1.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <CardTitle className="text-base">Profile Settings</CardTitle>
              </div>
              <CardDescription className="text-sm mt-2">
                Update your personal and academic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full shadow-sm" size="lg">
                <Link href="/student/profile">
                  Manage Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

