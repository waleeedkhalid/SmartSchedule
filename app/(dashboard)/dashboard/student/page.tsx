/**
 * Student Dashboard Page
 * 
 * Purpose: Unified student portal with all key features
 * 
 * Features:
 * - Overview: Quick stats and notifications
 * - Registration: Elective section enrollment with constraint validation
 * - Schedule: Weekly class schedule (required + electives)
 * - Exams: Exam timetable with conflict detection
 * - Feedback: Comment and feedback system
 * 
 * Student Model:
 * - Auto-enrolled in all required courses for their level
 * - Manually register for elective sections (this page)
 * - Subject to 20-credit limit and capacity constraints
 * 
 * Navigation: Tabbed interface for easy feature access
 * Data: Server-rendered with client components for interactivity
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/supabase/server";
import { Calendar, BookOpen, MessageSquare, GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";
import { ElectiveRegistrationManager } from "@/components/elective-registration-manager";
import { StudentScheduleView } from "@/components/student-schedule-view";
import { StudentExamTimetable } from "@/components/student-exam-timetable";
import { StudentCommentManager } from "@/components/student-comment-manager";

export default async function StudentDashboardPage() {
  // Authentication: Verify user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Authorization: Verify user has student role and get level
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, name, level')
    .eq('user_id', user.id)
    .single();

  if (userRole?.role !== 'student') {
    redirect("/dashboard");
  }

  const studentLevel = userRole.level || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {userRole.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your schedule, register for electives, and track your exams
        </p>
        {studentLevel && (
          <p className="text-sm text-muted-foreground mt-1">
            Level {studentLevel} Student
          </p>
        )}
      </div>

      {/* Note: Level check removed - onboarding flow ensures level is always set */}

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Quick Summary */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Level</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentLevel ? `Level ${studentLevel}` : 'Not Set'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current academic year
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">View</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Required + elective courses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Check</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Exam timetable available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Share</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Comment on your schedule
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">1</div>
                <div>
                  <p className="font-medium">Register for Electives</p>
                  <p className="text-sm text-muted-foreground">
                    Browse available elective sections and register (max 20 credits total)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">2</div>
                <div>
                  <p className="font-medium">View Your Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    See your complete weekly schedule (required courses + registered electives)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">3</div>
                <div>
                  <p className="font-medium">Check Exam Dates</p>
                  <p className="text-sm text-muted-foreground">
                    Review your exam timetable and check for conflicts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium">4</div>
                <div>
                  <p className="font-medium">Provide Feedback</p>
                  <p className="text-sm text-muted-foreground">
                    Share comments about your schedule or specific sections
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Tab - Elective Section Enrollment */}
        <TabsContent value="registration">
          <ElectiveRegistrationManager />
        </TabsContent>

        {/* Schedule Tab - Weekly Schedule View */}
        <TabsContent value="schedule">
          <StudentScheduleView />
        </TabsContent>

        {/* Exams Tab - Exam Timetable */}
        <TabsContent value="exams">
          <StudentExamTimetable />
        </TabsContent>

        {/* Feedback Tab - Comment System */}
        <TabsContent value="feedback">
          <StudentCommentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
