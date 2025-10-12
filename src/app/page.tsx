// SmartSchedule Landing Page - Modern, conversion-optimized design
// Features Supabase integration, role-based access, and demo accounts

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Briefcase,
  Sparkles,
  Shield,
  Brain,
  ArrowRight,
  CheckCircle2,
  Zap,
  Clock,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SmartSchedule",
            applicationCategory: "EducationalApplication",
            description:
              "Rule-aware academic scheduling platform with real-time Supabase data and department-specific rules.",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            provider: {
              "@type": "Organization",
              name: "SmartSchedule",
            },
            featureList: [
              "AI-Powered Schedule Generation",
              "Automated Conflict Detection",
              "Faculty Load Management",
              "Student Elective Selection",
              "Real-time Notifications",
              "Analytics Dashboard",
              "Rule-Based Validation",
            ],
          }),
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-muted/5 to-background">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-slate-700/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

          <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-5xl text-center space-y-10">
              {/* Brand Logo */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <Image
                    src="/icon.png"
                    alt="SmartSchedule logo"
                    width={96}
                    height={96}
                    priority
                    className="relative drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Header Badge */}
              <div>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 gap-2 text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  Real-Time Academic Planning
                </Badge>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  Smart<span className="text-primary">Schedule</span>
                </h1>
                <p className="text-2xl font-medium text-muted-foreground md:text-3xl lg:text-4xl">
                  Academic scheduling that just works
                </p>
              </div>

              {/* Description */}
              <p className="mx-auto max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Stop wrestling with spreadsheets. SmartSchedule automates course
                planning with intelligent rules, real-time conflict detection,
                and seamless faculty-student coordination.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2 group shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 shadow-md"
                  asChild
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Real-time sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Rule-based validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>5 role types</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container mx-auto px-4 py-24 md:py-32"
          aria-label="Key Features"
        >
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-2">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything you need to schedule smarter
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Three core capabilities that transform academic scheduling from a
              headache into a seamless workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-2xl">
                    Live Curriculum Control
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Update courses, levels, and sections in real-time. Changes
                    sync instantly across the entire system&apos;s real-time
                    engine.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Clock className="h-4 w-4" />
                  <span>Real-time updates</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-2xl">
                    Intelligent Automation
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Generate conflict-free schedules automatically. The rules
                    engine validates every assignment against department
                    policies and constraints.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Zap className="h-4 w-4" />
                  <span>Conflict detection</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-8 space-y-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-2xl">
                    Enterprise-Grade Security
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Row-level security, role-based access control, and encrypted
                    data storage.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                  <Shield className="h-4 w-4" />
                  <span>Role-based access</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Roles Overview Section - Visual Showcase */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-2">
              Five Perspectives
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built for everyone in academic planning
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Each role has a tailored interface with the exact tools they need
            </p>
          </div>

          {/* Visual Grid Layout */}
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Top Row - 2 Large Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Card */}
              <Card className="relative overflow-hidden border-2 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl -z-10" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="secondary">Academic</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Students</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Choose electives, preview your schedule, and share
                      feedback on course planning.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Elective Selection",
                      "Schedule Preview",
                      "Feedback System",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Faculty Card */}
              <Card className="relative overflow-hidden border-2 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-10" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <Badge variant="secondary">Teaching</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Faculty</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Set your availability, manage teaching load, and review
                      course assignments.
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Time Availability",
                      "Load Management",
                      "Course Preferences",
                    ].map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - 3 Medium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Scheduler Card */}
              <Card className="relative overflow-hidden border-2 shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl -z-10" />
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Operations
                  </Badge>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Scheduling Committee
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Generate schedules, detect conflicts, and manage courses
                      across all levels.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Teaching Load Card */}
              <Card className="relative overflow-hidden border-2 shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl -z-10" />
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Management
                  </Badge>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Teaching Load Committee
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Balance faculty workloads and optimize instructor
                      assignments across departments.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Registrar Card */}
              <Card className="relative overflow-hidden border-2 shadow-lg">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-500/20 to-red-500/20 rounded-full blur-3xl -z-10" />
                <CardContent className="p-6 space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 shadow-lg">
                    <ClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Administration
                  </Badge>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Registrar</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Handle special cases, manage overrides, and control closed
                      section access.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Below */}
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/login" className="gap-2">
                Sign In to Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="relative border-t bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-grid-slate-700/25" />

          <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
            <div className="mx-auto max-w-3xl space-y-8">
              {/* Icon badge */}
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to streamline your scheduling?
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Join hundreds of academic institutions using SmartSchedule to
                automate course planning and eliminate scheduling conflicts.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="gap-2 group shadow-lg hover:shadow-xl"
                  asChild
                >
                  <Link href="/login">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 shadow-md"
                  asChild
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>

              {/* Additional trust elements */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                <div className="space-y-2">
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-sm text-muted-foreground">
                    User Roles
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-sm text-muted-foreground">
                    Real-time Sync
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">Zero</div>
                  <div className="text-sm text-muted-foreground">
                    Setup Required
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
