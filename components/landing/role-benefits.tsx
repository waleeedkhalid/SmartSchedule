"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCog, Briefcase, GraduationCap, UserCircle, FileCheck } from "lucide-react";

const roles = [
  {
    id: "scheduling",
    label: "Scheduling",
    icon: CalendarCog,
    badge: "bg-brand-blue-100 text-brand-blue-800 dark:bg-brand-blue-900 dark:text-brand-blue-200",
    title: "Scheduling Committee",
    description: "Complete control over schedule generation and management",
    capabilities: [
      "Generate conflict-free schedules with one click",
      "Define and manage scheduling rules and constraints",
      "Create and publish named releases",
      "Import and export schedule data via JSON",
      "Real-time conflict detection and resolution",
      "Collaborate with teaching load committee",
    ],
  },
  {
    id: "teaching_load",
    label: "Teaching Load",
    icon: Briefcase,
    badge: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    title: "Teaching Load Committee",
    description: "Review workloads and optimize teaching assignments",
    capabilities: [
      "Review instructor teaching loads and distributions",
      "Filter schedules by instructor or workload metrics",
      "Add comments and suggest edits to schedules",
      "Collaborate with scheduling committee in real-time",
      "Track changes and receive notifications",
      "Ensure balanced workload distribution",
    ],
  },
  {
    id: "faculty",
    label: "Faculty",
    icon: GraduationCap,
    badge: "bg-success/10 text-success dark:bg-success/20 dark:text-success",
    title: "Faculty Members",
    description: "View assignments and provide feedback on schedules",
    capabilities: [
      "View personal teaching timetable and assignments",
      "See exam schedules and room assignments",
      "Submit time preferences and availability constraints",
      "Add feedback and comments on assignments",
      "Receive notifications about schedule changes",
      "Access preliminary and final schedules",
    ],
  },
  {
    id: "student",
    label: "Students",
    icon: UserCircle,
    badge: "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
    title: "Students",
    description: "Access schedules and submit elective preferences",
    capabilities: [
      "View class schedules and exam timetables",
      "Submit ranked preferences for elective courses",
      "Add comments and reviews on courses",
      "Track elective allocation status",
      "Receive schedule updates and notifications",
      "Access mobile-friendly schedule views",
    ],
  },
  {
    id: "registrar",
    label: "Registrar",
    icon: FileCheck,
    badge: "bg-error/10 text-error dark:bg-error/20 dark:text-error",
    title: "Registrar Office",
    description: "Final validation and publication of schedules",
    capabilities: [
      "Review and validate final schedules",
      "Publish official 'Released' schedules",
      "Export schedule data in JSON format",
      "Run validation checks for conflicts",
      "Archive historical schedule versions",
      "Oversee complete scheduling workflow",
    ],
  },
];

export function RoleBenefits() {
  return (
    <section id="roles" className="w-full py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Built for Every Role
          </h2>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400 md:text-lg">
            Customized experiences designed for each stakeholder in the scheduling process
          </p>
        </div>

        <Tabs defaultValue="scheduling" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 h-auto bg-slate-100 dark:bg-slate-800">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <TabsTrigger 
                  key={role.id} 
                  value={role.id}
                  className="flex flex-col md:flex-row items-center gap-2 py-3 data-[state=active]:bg-brand-blue-600 data-[state=active]:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs md:text-sm">{role.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <TabsContent key={role.id} value={role.id} className="mt-6">
                <Card className="border-2 border-brand-blue-200 dark:border-brand-blue-900 shadow-md">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg gradient-blue shadow-sm">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{role.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {role.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={role.badge}>{role.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {role.capabilities.map((capability, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200"
                        >
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-brand-blue-100 dark:bg-brand-blue-900 flex items-center justify-center flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-brand-blue-600 dark:bg-brand-blue-500" />
                          </div>
                          <span className="text-sm leading-relaxed">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}

