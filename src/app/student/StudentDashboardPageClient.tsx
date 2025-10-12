// Student Dashboard - Main Entry Point
"use client";

import React, { useMemo, useState } from "react";
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
import {
  BookOpen,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/components/auth/use-auth";

interface StudentData {
  name: string;
  studentId: string;
  level: number;
  hasSubmittedPreferences: boolean;
  currentSchedule: null | object;
}

export default function StudentDashboardPageClient() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    const fetchStudentData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/student/profile?userId=${encodeURIComponent(user.id)}`
        );
        const data = await response.json();

        if (data.success) {
          setStudentData({
            name: data.student.name,
            studentId: data.student.studentId,
            level: data.student.level,
            hasSubmittedPreferences: false,
            currentSchedule: null,
          });
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
        setStudentData({
          name: user.user_metadata?.full_name || "Student",
          studentId: user.email?.split("@")[0] || "Unknown",
          level: 6,
          hasSubmittedPreferences: false,
          currentSchedule: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {studentData.name}
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        role="region"
        aria-label="Student statistics"
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Student ID
                </p>
                <p
                  className="text-2xl font-bold"
                  aria-label={`Student ID ${studentData.studentId}`}
                >
                  {studentData.studentId}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Level
                </p>
                <p
                  className="text-2xl font-bold"
                  aria-label={`Current level: ${studentData.level}`}
                >
                  Level {studentData.level}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Preferences
                </p>
                <p
                  className="text-2xl font-bold flex items-center gap-2"
                  aria-label={`Preferences status: ${
                    studentData.hasSubmittedPreferences
                      ? "Submitted"
                      : "Pending"
                  }`}
                >
                  {studentData.hasSubmittedPreferences ? (
                    <>
                      <CheckCircle2
                        className="h-5 w-5 text-green-500"
                        aria-hidden="true"
                      />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Clock
                        className="h-5 w-5 text-yellow-500"
                        aria-hidden="true"
                      />
                      Pending
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        role="region"
        aria-label="Main student actions"
      >
        <Card className="hover:shadow-lg transition-all border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                  Elective Course Selection
                </CardTitle>
                <CardDescription className="mt-2">
                  Select and rank your preferred elective courses for the
                  upcoming semester
                </CardDescription>
              </div>
              {!studentData.hasSubmittedPreferences && (
                <Badge variant="default" className="ml-2">
                  Action Required
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">What you can do:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Browse available elective courses</li>
                  <li>Check prerequisites and eligibility</li>
                  <li>Rank courses by preference</li>
                  <li>Submit your selections</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/student/electives">
                  {studentData.hasSubmittedPreferences
                    ? "Edit Preferences"
                    : "Select Electives"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Schedule
            </CardTitle>
            <CardDescription>
              View your current course schedule and exam dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentData.currentSchedule ? (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Your schedule is ready
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Schedule not yet available</p>
                  <p className="text-xs">
                    Your schedule will be generated after elective preferences
                    are processed
                  </p>
                </div>
              )}
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/student/schedule">
                  View Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Schedule Feedback
            </CardTitle>
            <CardDescription>
              Provide feedback on your schedule or report issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Help us improve:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Report time conflicts</li>
                  <li>Suggest improvements</li>
                  <li>Share concerns</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/student/feedback">
                  Submit Feedback
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Profile & Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Account information:</p>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">ID:</span>{" "}
                    {studentData.studentId}
                  </p>
                  <p>
                    <span className="font-medium">Level:</span>{" "}
                    {studentData.level}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/student/profile">
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {!studentData.hasSubmittedPreferences && (
        <Card className="mt-8 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Action Required: Elective Selection
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please submit your elective course preferences as soon as
                  possible. The deadline for submissions is approaching, and
                  your selections are important for generating your schedule.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/student/electives">Select Electives Now</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
