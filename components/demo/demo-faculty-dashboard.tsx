'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  MapPin,
  Users,
} from 'lucide-react';
import {
  mockSections,
  mockUserProfiles,
  getSectionsByInstructor,
  mockComments,
} from '@/lib/demo/mock-data';

export function DemoFacultyDashboard() {
  const user = mockUserProfiles.faculty;
  const sections = getSectionsByInstructor(user.instructor_id);
  const uniqueCourses = new Set(sections.map(s => s.course_code)).size;
  const facultyComments = mockComments.filter(c => c.author_role === 'faculty');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Faculty Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome, {user.name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Sections</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Current semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Weekly Load</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sections.length} / 12
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sections per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueCourses}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Timetable */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            My Teaching Schedule
          </CardTitle>
          <CardDescription>
            Your assigned sections and meeting times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sections.map((section) => (
              <Card key={section.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{section.course_title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{section.course_code}</Badge>
                          <Badge variant="secondary">Section {section.section_no}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{section.meeting_pattern.days.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{section.meeting_pattern.start} ({section.meeting_pattern.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Room {section.room_code}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{section.enrolled}/{section.capacity} students enrolled</span>
                      </div>
                    </div>

                    {section.meeting_pattern.is_lab && (
                      <Badge>Lab Session</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your teaching profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" disabled>
              <MessageSquare className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <Clock className="mr-2 h-4 w-4" />
              Update Availability
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <Calendar className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Preferences</CardTitle>
            <CardDescription>Your configured preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-gray-700">Max Load</p>
                <p className="text-gray-600">12 sections per week</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Preferred Times</p>
                <p className="text-gray-600">Morning sessions (8:00 AM - 12:00 PM)</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Unavailable Times</p>
                <p className="text-gray-600">Thursday afternoons</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            My Feedback & Comments
          </CardTitle>
          <CardDescription>Your submitted comments on the schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {facultyComments.map(comment => (
              <Card key={comment.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={comment.is_resolved ? 'secondary' : 'default'}>
                        {comment.is_resolved ? 'Resolved' : 'Open'}
                      </Badge>
                      {comment.section_label && (
                        <span className="text-sm text-muted-foreground">{comment.section_label}</span>
                      )}
                    </div>
                    <p className="text-sm">{comment.comment_text}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted on {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

