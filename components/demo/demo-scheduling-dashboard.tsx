'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Calendar,
  DoorOpen,
  Users,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Zap,
  TrendingUp,
} from 'lucide-react';
import {
  mockCourses,
  mockSections,
  mockRooms,
  mockInstructors,
  getSchedulingStats,
} from '@/lib/demo/mock-data';

export function DemoSchedulingDashboard() {
  const stats = getSchedulingStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Scheduling Committee Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Generate schedules, manage conflicts, and visualize data insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSections}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.releasedSections} released
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <DoorOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Enrollment</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageEnrollment}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Generation */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                Schedule Status: Released
              </CardTitle>
              <CardDescription className="text-green-700">
                All sections assigned • 0 conflicts detected
              </CardDescription>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalSections}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold text-green-600">{stats.releasedSections}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-muted-foreground">Conflicts</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Enrollment Overview
            </CardTitle>
            <CardDescription>Section capacity utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSections.slice(0, 5).map((section) => {
                const percentage = Math.round((section.enrolled / section.capacity) * 100);
                return (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {section.course_code}-{section.section_no}
                      </span>
                      <span className="text-muted-foreground">
                        {section.enrolled}/{section.capacity} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 90 ? 'bg-red-500' :
                          percentage > 75 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Room Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-purple-500" />
              Room Utilization
            </CardTitle>
            <CardDescription>Room assignment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRooms.slice(0, 5).map((room) => {
                const usageCount = mockSections.filter(s => s.room_code === room.code).length;
                return (
                  <div key={room.code} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{room.code}</p>
                      <p className="text-sm text-muted-foreground">{room.type}</p>
                    </div>
                    <Badge variant="secondary">{usageCount} sessions</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>Manage schedule and system data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col" disabled>
              <BookOpen className="h-6 w-6 mb-2" />
              <span>Manage Courses</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" disabled>
              <Calendar className="h-6 w-6 mb-2" />
              <span>Manage Sections</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" disabled>
              <DoorOpen className="h-6 w-6 mb-2" />
              <span>Manage Rooms</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" disabled>
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Instructors</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>System Setup</CardTitle>
          <CardDescription>All prerequisites completed</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✓ Courses configured ({mockCourses.length} courses)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✓ Rooms added ({mockRooms.length} rooms)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✓ Instructors registered ({mockInstructors.length} instructors)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✓ Sections created ({mockSections.length} sections)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>✓ Schedule generated & released</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

