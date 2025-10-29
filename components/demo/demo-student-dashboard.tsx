'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import {
  mockSections,
  mockExams,
  mockCourses,
  getElectiveCourses,
  getRequiredCoursesByLevel,
  mockUserProfiles,
} from '@/lib/demo/mock-data';

export function DemoStudentDashboard() {
  const user = mockUserProfiles.student;
  const registeredSections = mockSections.filter(s => 
    user.registeredSections.includes(s.id)
  );
  const studentExams = mockExams.filter(e => 
    user.registeredSections.includes(e.section_id)
  );
  const electives = getElectiveCourses();
  const availableElectives = electives.filter(e => 
    !registeredSections.some(s => s.course_code === e.code)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your schedule, register for electives, and track your exams
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Level {user.level} Student
        </p>
      </div>

      {/* Main Tabbed Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic Level</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Level {user.level}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current academic standing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.totalCredits} / 20</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Credits registered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registered Courses</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{registeredSections.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active sections
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentExams.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Scheduled exams
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Registration Tab */}
        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Electives</CardTitle>
              <CardDescription>
                Register for elective courses (max 20 total credits)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableElectives.map(course => {
                  const sections = mockSections.filter(s => s.course_code === course.code);
                  return (
                    <Card key={course.code} className="border-2">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>{course.code} • {course.credits} Credits</CardDescription>
                          </div>
                          <Badge variant="secondary">Level {course.level}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sections.map(section => (
                            <div key={section.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Section {section.section_no}</p>
                                <p className="text-xs text-muted-foreground">
                                  {section.instructor_name} • {section.meeting_pattern.days.join(', ')} {section.meeting_pattern.start}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {section.enrolled}/{section.capacity} enrolled
                                </p>
                              </div>
                              <Button size="sm" disabled>
                                Register
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                My Weekly Schedule
              </CardTitle>
              <CardDescription>
                Your registered courses for Level {user.level}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registeredSections.map(section => (
                  <Card key={section.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{section.course_title}</h3>
                            <Badge variant="outline">{section.course_code}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {section.meeting_pattern.days.join(', ')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {section.meeting_pattern.start} ({section.meeting_pattern.duration} min)
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Room {section.room_code}
                            </div>
                          </div>
                          <p className="text-sm">
                            <strong>Instructor:</strong> {section.instructor_name}
                          </p>
                          {section.meeting_pattern.is_lab && (
                            <Badge variant="secondary">Lab Session</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Exam Timetable
              </CardTitle>
              <CardDescription>
                Final exam schedule for your registered courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentExams.map(exam => (
                  <Card key={exam.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{exam.course_title}</h3>
                          <Badge>{exam.course_code}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(exam.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Time</p>
                            <p className="font-medium">{exam.start} ({exam.duration} min)</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{exam.room_codes.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No exam conflicts detected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Share Feedback
              </CardTitle>
              <CardDescription>
                Provide general feedback or comment on specific sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    In the full system, students can submit feedback about their schedule,
                    specific sections, or general comments that the scheduling committee can review.
                  </p>
                </div>
                <Button disabled className="w-full">Submit Feedback</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

