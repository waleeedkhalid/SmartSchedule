'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserCog,
  BookOpen,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { mockSections } from '@/lib/demo/mock-data';

export function DemoRegistrarDashboard() {
  // Mock irregular students data
  const irregularStudents = [
    {
      id: '1',
      student_id: 'S2021001',
      student_name: 'Ali Hassan',
      required_courses: ['SWE401', 'SWE501', 'SWE610'],
      notes: 'Transferred from another program, following custom curriculum',
      created_at: '2025-09-15',
    },
    {
      id: '2',
      student_id: 'S2020045',
      student_name: 'Fatima Ahmed',
      required_courses: ['SWE402', 'SWE502'],
      notes: 'Taking courses across multiple levels due to academic standing',
      created_at: '2025-09-20',
    },
  ];

  // Mock recent registrations
  const recentRegistrations = [
    {
      id: '1',
      student_name: 'Omar Khaled',
      student_id: 'S2022034',
      section: 'SWE410-01',
      course_title: 'Machine Learning Applications',
      registered_at: '2025-10-28',
      type: 'Override',
    },
    {
      id: '2',
      student_name: 'Mariam Hassan',
      student_id: 'S2021089',
      section: 'SWE510-01',
      course_title: 'Data Science',
      registered_at: '2025-10-27',
      type: 'Manual',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Registrar Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage irregular students and manual course registrations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Irregular Students</CardTitle>
            <UserCog className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{irregularStudents.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Custom curricula managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Manual Registrations</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentRegistrations.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSections.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Available for registration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Irregular Students Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-purple-500" />
            Irregular Students
          </CardTitle>
          <CardDescription>
            Students following custom curriculum paths
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {irregularStudents.map((student) => (
              <Card key={student.id} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {student.student_id}</p>
                      </div>
                      <Badge variant="outline">Custom Curriculum</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Required Courses:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.required_courses.map((course) => (
                          <Badge key={course} variant="secondary">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes:</p>
                      <p className="text-sm text-muted-foreground mt-1">{student.notes}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Created: {new Date(student.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" disabled>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button className="w-full" variant="outline" disabled>
              <UserCog className="mr-2 h-4 w-4" />
              Add Irregular Student
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Registration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Manual Student Registration
          </CardTitle>
          <CardDescription>
            Register students in sections with validation bypass
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Manual Registration Privileges
                </p>
                <p className="text-sm text-blue-700">
                  As registrar, you can override validation rules for special cases:
                  credit limits, capacity restrictions, and prerequisite requirements.
                </p>
              </div>
            </div>
            
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Student ID</label>
                    <input
                      type="text"
                      placeholder="Enter student ID..."
                      className="w-full mt-2 px-3 py-2 border rounded-md bg-background"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Select Section</label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md bg-background" disabled>
                      <option>Choose a section...</option>
                      {mockSections.slice(0, 5).map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.course_code}-{section.section_no} • {section.course_title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Registration Type</label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md bg-background" disabled>
                      <option>Override - Capacity Full</option>
                      <option>Override - Credit Limit</option>
                      <option>Override - Prerequisites</option>
                      <option>Manual - Special Case</option>
                    </select>
                  </div>
                  
                  <Button className="w-full" disabled>
                    Register Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Recent Manual Registrations
          </CardTitle>
          <CardDescription>
            Latest registrations processed by registrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRegistrations.map((reg) => (
              <Card key={reg.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{reg.student_name}</h4>
                        <Badge variant="outline" className="text-xs">{reg.student_id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reg.section} • {reg.course_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(reg.registered_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={reg.type === 'Override' ? 'destructive' : 'secondary'}>
                      {reg.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900">Registrar Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Irregular Students:</strong> Define custom required course lists for students
                not following standard level-based progression
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Manual Registration:</strong> Override system validations for special cases
                (capacity full, credit limits, prerequisites)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Documentation:</strong> Always add notes explaining the reason for overrides
                or custom curricula
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

