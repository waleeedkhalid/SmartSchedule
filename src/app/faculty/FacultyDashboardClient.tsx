"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import {
  FacultyStatusCards,
  MyCoursesCard,
  TeachingScheduleCard,
  FacultyUpcomingEvents,
  AvailabilityStatusCard,
} from "@/components/faculty/dashboard";
import { QuickActions } from "@/components/faculty/QuickActions";

interface FacultyDashboardClientProps {
  fullName: string;
  email: string;
  facultyId: string;
  title: string;
  status: string;
  facultyStatus: {
    activeTerm: string | null;
    termName: string | null;
    termType: string | null;
    assignedCoursesCount: number;
    schedulePublished: boolean;
    feedbackOpen: boolean;
    canViewFeedback: boolean;
    hasPendingSuggestions: boolean;
    facultyInfo: {
      facultyId: string;
      title: string;
      status: string;
    };
  };
}

export default function FacultyDashboardClient({
  fullName,
  email,
  facultyId,
  title,
  status,
  facultyStatus,
}: FacultyDashboardClientProps) {
  // ✅ OPTIMIZED: Use useMemo for computed values
  const showScheduleAlert = useMemo(() => {
    return facultyStatus && !facultyStatus.schedulePublished;
  }, [facultyStatus]);

  const showFeedbackAlert = useMemo(() => {
    return facultyStatus?.canViewFeedback;
  }, [facultyStatus]);

  const displayTitle = useMemo(() => {
    return `${title} ${fullName}`;
  }, [title, fullName]);

  const termInfo = useMemo(() => {
    return facultyStatus?.termName
      ? `Academic Term: ${facultyStatus.termName}`
      : "Manage your teaching schedule and course information";
  }, [facultyStatus]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {displayTitle}
        </h1>
        <p className="text-muted-foreground">{termInfo}</p>
      </div>

      {/* Alert Messages */}
      {showScheduleAlert && (
        <Alert className="border-2 border-warning/20 bg-warning/5 shadow-sm">
          <AlertCircle className="h-5 w-5 text-warning" />
          <AlertTitle className="font-semibold">
            Schedule In Progress
          </AlertTitle>
          <AlertDescription className="mt-2">
            The academic schedule is currently being finalized. Your course assignments
            will be available once the schedule is published.
          </AlertDescription>
        </Alert>
      )}

      {showFeedbackAlert && (
        <Alert className="border-2 border-primary/20 bg-primary/5 shadow-sm">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold">
            Feedback Available
          </AlertTitle>
          <AlertDescription className="mt-2">
            Student feedback for your courses is now available. Review aggregated,
            anonymized responses to improve your teaching.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Status Cards */}
      <FacultyStatusCards
        assignedCoursesCount={facultyStatus.assignedCoursesCount}
        schedulePublished={facultyStatus.schedulePublished}
        canViewFeedback={facultyStatus.canViewFeedback}
        feedbackOpen={facultyStatus.feedbackOpen}
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Courses */}
        <MyCoursesCard />

        {/* Availability Status */}
        <AvailabilityStatusCard />
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Upcoming Events */}
        <FacultyUpcomingEvents
          termCode={facultyStatus?.activeTerm || undefined}
          limit={5}
        />
      </div>

      {/* Teaching Schedule */}
      <TeachingScheduleCard />

      {/* Profile Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <CardTitle className="text-xl">Faculty Profile</CardTitle>
          <CardDescription>
            Your account information and teaching status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full Name
              </p>
              <p className="text-lg font-semibold">{fullName || "—"}</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p className="text-lg font-semibold">{email}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mt-6">
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Faculty ID
              </p>
              <p className="text-xl font-bold">{facultyId || "Pending"}</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Title
              </p>
              <p className="text-xl font-bold">{title}</p>
            </div>
            <div className="space-y-2 rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="text-xl font-bold capitalize">{status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
