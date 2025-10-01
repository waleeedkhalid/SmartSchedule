"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  GraduationCap,
  BarChart3,
  ClipboardList,
  UserCircle,
} from "lucide-react";

const personas = [
  {
    name: "Scheduling Committee",
    description: "Manage course schedules, exams, and conflicts",
    href: "/demo/committee/scheduler",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    name: "Teaching Load Committee",
    description: "Review instructor loads and resolve conflicts",
    href: "/demo/committee/teaching-load",
    icon: BarChart3,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    name: "Registrar",
    description: "Manage irregular students and enrollment",
    href: "/demo/committee/registrar",
    icon: ClipboardList,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    name: "Faculty",
    description: "View assignments and provide availability",
    href: "/demo/faculty",
    icon: UserCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    name: "Student",
    description: "View schedule and submit preferences",
    href: "/demo/student",
    icon: GraduationCap,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            SmartSchedule
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            SWE Department Course Scheduling System - Phase 3 Prototype
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <Link key={persona.href} href={persona.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${persona.bgColor} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${persona.color}`} />
                    </div>
                    <CardTitle>{persona.name}</CardTitle>
                    <CardDescription>{persona.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Enter Dashboard →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            This is a prototype for the SWE Department scheduling workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
