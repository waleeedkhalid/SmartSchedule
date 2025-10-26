"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  AlertCircle,
  GraduationCap,
  LayoutDashboard
} from "lucide-react";

// Import all feature components
import { StudentManagementPage } from "@/components/committee/scheduler/student-management-v2";
import { CourseAndSectionPage } from "@/components/committee/scheduler/course-section-v2";
import { TimelineManagementPage } from "@/components/committee/scheduler/timeline-v2";
import { RulesManagementPage } from "@/components/committee/scheduler/rules-v2";

/**
 * Scheduler Features Demo
 * Comprehensive demo showcasing all scheduler features
 */
export function SchedulerFeaturesDemo() {
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      id: "students",
      title: "Student Management",
      description: "Manage students, enrollments, and irregular cases",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      component: <StudentManagementPage />,
    },
    {
      id: "courses",
      title: "Course & Sections",
      description: "Manage course catalog and section assignments",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
      component: <CourseAndSectionPage />,
    },
    {
      id: "timeline",
      title: "Academic Timeline",
      description: "Track phases, milestones, and deadlines",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      component: <TimelineManagementPage />,
    },
    {
      id: "rules",
      title: "Rules Management",
      description: "Configure scheduling rules and priorities",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      component: <RulesManagementPage />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Scheduler Features Demo
                </h1>
                <p className="text-lg text-muted-foreground">
                  Comprehensive UI for scheduling committee workflows
                </p>
              </div>
            </div>

            {/* Tabs Navigation */}
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              {features.map((feature) => (
                <TabsTrigger key={feature.id} value={feature.id} className="gap-2">
                  <feature.icon className="h-4 w-4" />
                  {feature.title.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to Scheduler Features</CardTitle>
                <CardDescription>
                  This demo showcases the complete UI implementation for the SmartSchedule
                  scheduling committee workflows. All components use mock data and are ready
                  for backend integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {features.map((feature) => (
                    <Card
                      key={feature.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setActiveTab(feature.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                          </div>
                          <Badge variant="secondary">Ready</Badge>
                        </div>
                        <CardTitle className="text-xl mt-4">
                          {feature.title}
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                {/* Features List */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Key Features Implemented:</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Student Overview Dashboard</p>
                        <p className="text-sm text-muted-foreground">
                          Quick stats and enrollment metrics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Student List with Filters</p>
                        <p className="text-sm text-muted-foreground">
                          Search and filter by level, status
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Irregular Students Tracker</p>
                        <p className="text-sm text-muted-foreground">
                          Monitor and manage special cases
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Course Catalog Grid</p>
                        <p className="text-sm text-muted-foreground">
                          Visual course management with filters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Section Management Table</p>
                        <p className="text-sm text-muted-foreground">
                          Detailed section CRUD operations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Academic Timeline Visualization</p>
                        <p className="text-sm text-muted-foreground">
                          Phase tracking and event management
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Rules Configuration</p>
                        <p className="text-sm text-muted-foreground">
                          Manage scheduling constraints
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div>
                        <p className="font-medium">Priority Weights System</p>
                        <p className="text-sm text-muted-foreground">
                          Configure scheduling priorities
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Built With:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Next.js 15</Badge>
                    <Badge>TypeScript</Badge>
                    <Badge>shadcn/ui</Badge>
                    <Badge>Tailwind CSS</Badge>
                    <Badge>React Hooks</Badge>
                    <Badge>Mock Data Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Tabs */}
          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id}>
              {feature.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

