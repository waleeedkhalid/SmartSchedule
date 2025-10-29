'use client';

import { useDemoContext } from '@/lib/demo/demo-context';
import { PersonaSwitcher } from '@/components/demo/persona-switcher';
import { FeatureHighlights } from '@/components/demo/feature-highlights';
import { DemoStudentDashboard } from '@/components/demo/demo-student-dashboard';
import { DemoFacultyDashboard } from '@/components/demo/demo-faculty-dashboard';
import { DemoSchedulingDashboard } from '@/components/demo/demo-scheduling-dashboard';
import { DemoTeachingLoadDashboard } from '@/components/demo/demo-teaching-load-dashboard';
import { DemoRegistrarDashboard } from '@/components/demo/demo-registrar-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  GraduationCap,
  Users,
  Calendar,
  BarChart3,
  UserCog,
  ArrowDown,
} from 'lucide-react';
import Link from 'next/link';

export default function DemoPage() {
  const { currentPersona } = useDemoContext();

  const renderDashboard = () => {
    switch (currentPersona) {
      case 'student':
        return <DemoStudentDashboard />;
      case 'faculty':
        return <DemoFacultyDashboard />;
      case 'scheduling':
        return <DemoSchedulingDashboard />;
      case 'teaching_load':
        return <DemoTeachingLoadDashboard />;
      case 'registrar':
        return <DemoRegistrarDashboard />;
      default:
        return null;
    }
  };

  const personaDescriptions = {
    student: {
      icon: GraduationCap,
      title: 'Student Experience',
      description: 'Register for electives with real-time credit tracking, view your complete weekly schedule combining required and elective courses, check exam timetables with conflict detection, and submit feedback on sections.',
      keyFeatures: [
        'Elective registration with 20-credit limit',
        'Level-based schedule view',
        'Exam timetable with conflict detection',
        'Dual-layer comment system',
      ],
    },
    faculty: {
      icon: Users,
      title: 'Faculty Portal',
      description: 'View your complete teaching schedule, manage availability preferences, track teaching load across sections, and provide feedback on schedule assignments.',
      keyFeatures: [
        'Personal teaching timetable',
        'Availability preference management',
        'Section details and enrollment stats',
        'Direct feedback submission',
      ],
    },
    scheduling: {
      icon: Calendar,
      title: 'Scheduling Committee',
      description: 'Generate conflict-free schedules with one click, manage all system data (courses, sections, rooms, instructors), visualize enrollment and room utilization, and create named schedule releases.',
      keyFeatures: [
        'One-click schedule generation',
        'Comprehensive data management',
        'Analytics dashboards with Chart.js',
        'Conflict detection & resolution',
      ],
    },
    teaching_load: {
      icon: BarChart3,
      title: 'Teaching Load Committee',
      description: 'Monitor instructor teaching loads, visualize workload distribution, identify overloaded faculty, and collaborate on load balancing with the scheduling committee.',
      keyFeatures: [
        'Instructor load visualization',
        'Workload distribution analysis',
        'Overload detection & alerts',
        'Section reassignment support',
      ],
    },
    registrar: {
      icon: UserCog,
      title: 'Registrar Office',
      description: 'Manage irregular students with custom curricula, perform manual course registrations with validation bypass, handle special cases and overrides, and maintain detailed documentation.',
      keyFeatures: [
        'Irregular student management',
        'Manual registration with overrides',
        'Custom curriculum definition',
        'Registration history tracking',
      ],
    },
  };

  const currentPersonaInfo = personaDescriptions[currentPersona];
  const PersonaIcon = currentPersonaInfo.icon;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <Badge variant="outline" className="text-lg px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          <Sparkles className="h-4 w-4 mr-2 inline" />
          Interactive Demo
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          SmartSchedule Demo
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Experience all five user personas in action with realistic data and complete functionality
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" asChild>
            <a href="#personas">
              Explore Personas
              <ArrowDown className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register">
              Try Full System
            </Link>
          </Button>
        </div>
      </section>

      {/* Key Metrics */}
      <section>
        <Card className="border-2 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">5</p>
                <p className="text-sm text-muted-foreground">User Personas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">0</p>
                <p className="text-sm text-muted-foreground">Schedule Conflicts</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">16</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">12</p>
                <p className="text-sm text-muted-foreground">Sections</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-600">6</p>
                <p className="text-sm text-muted-foreground">Instructors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Persona Switcher */}
      <section id="personas" className="scroll-mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Experience Every Perspective
          </h2>
          <p className="text-muted-foreground mt-2">
            Switch between user roles to see how SmartSchedule serves different stakeholders
          </p>
        </div>
        
        <PersonaSwitcher variant="full" />
      </section>

      {/* Current Persona Narrative */}
      <section>
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <PersonaIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentPersonaInfo.title}
                </h2>
                <p className="text-muted-foreground">
                  Current demo view
                </p>
              </div>
            </div>
            
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentPersonaInfo.description}
            </p>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Key Features:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {currentPersonaInfo.keyFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Dashboard Display */}
      <section>
        <div className="bg-white rounded-lg border-2 shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Live Dashboard
            </h2>
            <Badge variant="secondary" className="text-sm">
              Interactive Demo
            </Badge>
          </div>
          
          <div className="animate-in fade-in duration-500">
            {renderDashboard()}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12">
        <FeatureHighlights />
      </section>

      {/* Phase 7 Summary */}
      <section>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-8 space-y-6">
            <div className="text-center">
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                Phase 7 - Final Demo
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mt-4">
                Comprehensive Demonstration
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 pt-6">
              <Card>
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-bold">Smooth End-to-End</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless flow through all features with realistic data and zero conflicts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="font-bold">All Personas Showcased</h3>
                  <p className="text-sm text-muted-foreground">
                    Student, Faculty, Scheduling Committee, Teaching Load, and Registrar
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="font-bold">Professional Presentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear narrative, polished UI, and comprehensive feature coverage
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <Card className="border-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="pt-8 pb-8 space-y-6">
            <h2 className="text-3xl font-bold">
              Ready to Transform Your Scheduling?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Sign up to access the full SmartSchedule system with real data management,
              schedule generation, and collaboration features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

