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
import { Button } from "@/components/ui/button";
import { getMockCreditStats, getMockEnrollments, getMockStudentExams } from "@/lib/demo-data";
import { Calendar, BookOpen, MessageSquare, GraduationCap, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ElectiveRegistrationManager } from "@/components/elective-registration-manager";
import { StudentScheduleView } from "@/components/student-schedule-view";
import { StudentExamTimetable } from "@/components/student-exam-timetable";
import { StudentDashboardCharts } from "@/components/student-dashboard-charts";
import { getServerUser } from "@/lib/server-auth";
// import { StudentCommentManager } from "@/components/student-comment-manager"; // Temporarily disabled during maintenance

export default async function StudentDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // If authenticated but wrong role, redirect to dashboard (which will redirect to correct role)
  if (user.role !== 'student') {
    redirect("/dashboard");
  }

  const studentLevel = user.level || null;
  
  // Fetch dashboard stats
  const [creditStats, enrollments, exams] = await Promise.all([
    getMockCreditStats(),
    getMockEnrollments(),
    getMockStudentExams(),
  ]);
  
  const totalEnrollments = enrollments.length;
  const upcomingExams = exams.filter(e => {
    const examDate = new Date(`${e.date}T${e.start}`);
    return examDate > new Date();
  }).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user.name.split(" ")[0]}! 👋
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
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Quick Summary */}
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <StudentDashboardCharts />
          
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
                  Current academic standing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creditStats?.total || 0} / 20
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {creditStats?.required_credits || 0} required, {creditStats?.elective_credits || 0} elective
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active course sections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingExams}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {exams.length} total exams scheduled
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

        {/* Feedback Tab - Comment System - TEMPORARILY DISABLED */}
        <TabsContent value="feedback">
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-yellow-500" />
                Schedule Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30 animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg mb-1">
                        Feature Under Maintenance
                      </h3>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We&apos;re upgrading the feedback system to support comments from all users (students, faculty, and staff). 
                        This feature will be back online shortly.
                      </p>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        What&apos;s being updated:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>Multi-user comment support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>Enhanced feedback management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>Improved comment resolution tracking</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Link href="/maintenance">
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </Link>
                      <Link href="/dashboard/student">
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Use Other Features
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
