"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  ArrowRight,
  Users,
  BookOpen,
  UserCheck,
  ClipboardList,
  Settings,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        {/* Theme Switcher - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeSwitcher />
        </div>

        {/* Centered Content */}
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">SmartSchedule</h1>
            <p className="text-xl text-muted-foreground">
              SWE Department Course Scheduling System
            </p>
            <p className="text-sm text-muted-foreground">
              Automated schedule generation for all levels with conflict
              detection
            </p>
          </div>

          {/* Main CTA */}
          <div className="pt-4">
            <Link href="/demo/schedule-phase5">
              <Button size="lg" className="text-lg px-8 py-6 h-auto group">
                Go to Schedule Generator
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="pt-8 space-y-2">
            <p className="text-sm text-muted-foreground">
              Generate optimized schedules for 5 SWE levels with automatic
              conflict resolution
            </p>
            <p className="text-xs text-muted-foreground/70">
              Helps administrators, faculty, and students save time and reduce
              errors
            </p>
          </div>
        </div>

        {/* Feature Demo Cards */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Explore Core Features</h2>
            <p className="text-muted-foreground">
              Interactive demos for all user personas and workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Scheduling Committee */}
            <Link href="/demo/committee/scheduler" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Scheduling Committee</CardTitle>
                  <CardDescription>
                    Manage exam schedules, course sections, version control, and
                    conflict resolution
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Teaching Load Committee */}
            <Link href="/demo/committee/teaching-load" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Teaching Load</CardTitle>
                  <CardDescription>
                    Assign instructors to sections, manage workload, and balance
                    teaching hours
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Registrar */}
            <Link href="/demo/committee/registrar" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Registrar</CardTitle>
                  <CardDescription>
                    Manage irregular student cases, section changes, and
                    enrollment exceptions
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Faculty */}
            <Link href="/demo/faculty" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Faculty Dashboard</CardTitle>
                  <CardDescription>
                    Submit availability, view assignments, and provide schedule
                    feedback
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Student */}
            <Link href="/demo/student" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Student Portal</CardTitle>
                  <CardDescription>
                    Set elective preferences, view schedule, and submit feedback
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            {/* Theme System */}
            <Link href="/demo/themes" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Theme System</CardTitle>
                  <CardDescription>
                    Explore 4 beautiful themes with dark mode and KSU branding
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Additional Resources */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Built with Next.js 15, TypeScript, shadcn/ui, and Tailwind CSS
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
              <span>5 User Personas</span>
              <span>•</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
