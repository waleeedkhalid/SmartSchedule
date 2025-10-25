"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  BookOpen,
  Settings,
  FileText,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface SchedulerData {
  name: string;
  email: string;
  role: string;
  totalCourses: number;
  totalStudents: number;
  scheduleGenerated: boolean;
}

interface FeedbackSettings {
  feedback_open: boolean;
  schedule_published: boolean;
}

export default function SchedulerDashboardPage() {
  const [schedulerData, setSchedulerData] = useState<SchedulerData | null>(
    null
  );
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>({
    feedback_open: false,
    schedule_published: false,
  });
  const [loading, setLoading] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchedulerData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get scheduler data from the database
        const { data: userData, error } = await supabase
          .from("user")
          .select("full_name,email,role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("Error fetching scheduler data:", error);
          setLoading(false);
          return;
        }

        const profile = userData as {
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
        };

        // Get course and student counts
        const { count: courseCount } = await supabase
          .from("course")
          .select("*", { count: "exact", head: true });

        const { count: studentCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        setSchedulerData({
          name:
            profile.full_name ?? user.user_metadata?.full_name ?? "Scheduler",
          email: profile.email ?? user.email ?? "",
          role: profile.role ?? "scheduling_committee",
          totalCourses: courseCount || 0,
          totalStudents: studentCount || 0,
          scheduleGenerated: false, // TODO: Check if schedule exists
        });
      } catch (error) {
        console.error("Error fetching scheduler data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedulerData();
    fetchFeedbackSettings();
  }, []);

  const fetchFeedbackSettings = async () => {
    try {
      const response = await fetch("/api/committee/scheduler/feedback-settings");
      const data = await response.json();
      
      if (data.success) {
        setFeedbackSettings({
          feedback_open: data.data.feedback_open || false,
          schedule_published: data.data.schedule_published || false,
        });
      }
    } catch (error) {
      console.error("Error fetching feedback settings:", error);
    }
  };

  const updateFeedbackSetting = async (key: keyof FeedbackSettings, value: boolean) => {
    setUpdatingSettings(true);
    try {
      const response = await fetch("/api/committee/scheduler/feedback-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedbackSettings((prev) => ({ ...prev, [key]: value }));
        toast({
          title: "Settings updated",
          description: `Feedback ${key === "feedback_open" ? "period" : "publication"} has been ${value ? "enabled" : "disabled"}.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating feedback settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSettings(false);
    }
  };

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

  if (!schedulerData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Scheduling Committee Dashboard
          </h1>
          <p className="text-muted-foreground">
            Unable to load scheduler data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Scheduling Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {schedulerData.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Courses
                </p>
                <p className="text-2xl font-bold">
                  {schedulerData.totalCourses}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
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
                  Total Students
                </p>
                <p className="text-2xl font-bold">
                  {schedulerData.totalStudents}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Schedule Status
                </p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {schedulerData.scheduleGenerated ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Generated
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500" />
                      Pending
                    </>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Management */}
        <Card className="hover:shadow-lg transition-all border-2 hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Management
            </CardTitle>
            <CardDescription>
              Manage courses, sections, and course offerings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Course management tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View and edit course catalog</li>
                  <li>Manage course sections</li>
                  <li>Set course prerequisites</li>
                  <li>Configure course offerings</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/committee/scheduler/courses">
                  Manage Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Generation */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Generation
            </CardTitle>
            <CardDescription>
              Generate and manage academic schedules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Schedule generation tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Generate automated schedules</li>
                  <li>Review and edit schedules</li>
                  <li>Resolve conflicts</li>
                  <li>Export schedule data</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/scheduler/generate">
                  Generate Schedule
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exam Management */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Management
            </CardTitle>
            <CardDescription>
              Schedule and manage exam dates and times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Exam scheduling tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Schedule midterm exams</li>
                  <li>Plan final exam periods</li>
                  <li>Avoid exam conflicts</li>
                  <li>Manage exam rooms</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/scheduler/exams">
                  Manage Exams
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rules & Settings */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Rules & Settings
            </CardTitle>
            <CardDescription>
              Configure scheduling rules and system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Configuration options:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set scheduling constraints</li>
                  <li>Configure time slots</li>
                  <li>Manage room assignments</li>
                  <li>System preferences</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/scheduler/rules">
                  Configure Rules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Control Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Student Feedback Controls
          </CardTitle>
          <CardDescription>
            Manage when students can submit feedback about their schedules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use these controls to open or close the feedback period for students.
              Students can only submit feedback when both their schedule is assigned and
              the feedback period is open.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Schedule Published Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="schedule-published" className="text-base font-medium">
                  Schedules Published
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mark schedules as published and visible to students
                </p>
              </div>
              <Switch
                id="schedule-published"
                checked={feedbackSettings.schedule_published}
                onCheckedChange={(checked) =>
                  updateFeedbackSetting("schedule_published", checked)
                }
                disabled={updatingSettings}
              />
            </div>

            {/* Feedback Open Toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="feedback-open" className="text-base font-medium">
                  Feedback Period Open
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to submit feedback about their schedules
                </p>
              </div>
              <Switch
                id="feedback-open"
                checked={feedbackSettings.feedback_open}
                onCheckedChange={(checked) =>
                  updateFeedbackSetting("feedback_open", checked)
                }
                disabled={updatingSettings}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="mb-2 text-sm font-medium">Current Status</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Schedules Published:</span>
                <span className="font-medium">
                  {feedbackSettings.schedule_published ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Feedback Open:</span>
                <span className="font-medium">
                  {feedbackSettings.feedback_open ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-muted-foreground">Students Can Submit Feedback:</span>
                <span className="font-medium">
                  {feedbackSettings.schedule_published && feedbackSettings.feedback_open ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      {!schedulerData.scheduleGenerated && (
        <Card className="mt-8 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Schedule Generation Required
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  No schedule has been generated yet. Use the schedule
                  generation tools to create an optimal schedule based on
                  current course offerings and student preferences.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/committee/scheduler/generate">
                    Generate Schedule Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
