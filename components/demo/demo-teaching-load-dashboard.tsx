'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  BookOpen,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import {
  mockInstructors,
  mockSections,
  mockCourses,
  getTeachingLoadStats,
} from '@/lib/demo/mock-data';

export function DemoTeachingLoadDashboard() {
  const instructorStats = getTeachingLoadStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Teaching Load Committee Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Review and balance instructor teaching loads
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInstructors.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total faculty members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSections.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total sections assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourses.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Available courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructor Load Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Instructor Load Overview
          </CardTitle>
          <CardDescription>
            Teaching hours per instructor (based on sections assigned)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {instructorStats.map((instructor) => {
              const isOverloaded = instructor.section_count > instructor.max_load_per_week;
              const loadPercentage = instructor.loadPercentage;

              return (
                <div key={instructor.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{instructor.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {instructor.sections.length} sections
                      </Badge>
                    </div>
                    <span className={isOverloaded ? "text-red-600 font-medium" : "text-gray-600"}>
                      {instructor.section_count} / {instructor.max_load_per_week} sections
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isOverloaded 
                          ? "bg-red-500" 
                          : loadPercentage > 80 
                          ? "bg-yellow-500" 
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                  
                  {/* Section details */}
                  <div className="ml-4 mt-2 space-y-1">
                    {instructor.sections.map((section) => (
                      <div key={section.id} className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {section.course_code}
                        </Badge>
                        <span>{section.course_title}</span>
                        <span className="text-gray-400">•</span>
                        <span>{section.meeting_pattern.days.join(', ')} {section.meeting_pattern.start}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Load Distribution Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-900">
              Optimal Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {instructorStats.filter(i => i.loadPercentage <= 80).length}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Instructors under 80% capacity
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-900">
              Near Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {instructorStats.filter(i => i.loadPercentage > 80 && i.loadPercentage <= 100).length}
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Instructors at 80-100% capacity
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-900">
              Overloaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {instructorStats.filter(i => i.loadPercentage > 100).length}
            </div>
            <p className="text-xs text-red-700 mt-1">
              Instructors over capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage teaching assignments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" disabled>
              <Users className="mr-2 h-4 w-4" />
              View All Instructors
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <Calendar className="mr-2 h-4 w-4" />
              Manage Section Assignments
            </Button>
            <Button className="w-full justify-start" variant="outline" disabled>
              <BookOpen className="mr-2 h-4 w-4" />
              View Courses
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Balancing Guidelines</CardTitle>
            <CardDescription>Best practices for assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">●</span>
                <span>Green: Instructor under 80% capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">●</span>
                <span>Yellow: Instructor at 80-100% capacity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">●</span>
                <span>Red: Instructor over capacity (reassign sections)</span>
              </li>
              <li className="flex items-start gap-2 mt-3">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <span>Collaborate with scheduling committee for optimal distribution</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

