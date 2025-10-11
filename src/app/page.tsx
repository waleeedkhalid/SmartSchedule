// SmartSchedule Landing Page - Modern, responsive design with live data integration
// Features demo account integration and role-based access

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
import { Separator } from "@/components/ui/separator";
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
  LucideIcon,
  LogIn,
  Github,
} from "lucide-react";

// Role card data - PRD Section 3 (User Roles)
interface RoleCardData {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  iconColor: string;
  badge: string;
  features: string[];
  link: string;
}

const roles: RoleCardData[] = [
  {
    id: "student",
    title: "Students",
    description:
      "Complete elective surveys, view schedules, and provide feedback",
    icon: GraduationCap,
    color:
      "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
    borderColor: "border-blue-500/20 dark:border-blue-500/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "Academic",
    features: ["Elective Selection", "Schedule Preview", "Feedback System"],
    link: "/student",
  },
  {
    id: "faculty",
    title: "Faculty",
    description:
      "Manage teaching assignments and submit availability preferences",
    icon: Users,
    color:
      "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
    borderColor: "border-purple-500/20 dark:border-purple-500/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    badge: "Teaching",
    features: ["Time Availability", "Load Management", "Course Preferences"],
    link: "/demo/faculty",
  },
  {
    id: "scheduler",
    title: "Scheduling Committee",
    description: "Oversee courses, generate schedules, and resolve conflicts",
    icon: Calendar,
    color:
      "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20",
    borderColor: "border-emerald-500/20 dark:border-emerald-500/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "Operations",
    features: [
      "Schedule Generation",
      "Conflict Detection",
      "Course Management",
    ],
    link: "/demo/committee/scheduler",
  },
  {
    id: "load-committee",
    title: "Teaching Load Committee",
    description: "Balance faculty workloads and manage instructor assignments",
    icon: Briefcase,
    color:
      "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20",
    borderColor: "border-amber-500/20 dark:border-amber-500/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "Management",
    features: ["Load Balancing", "Assignment Review", "Faculty Analytics"],
    link: "/demo/committee/teaching-load",
  },
  {
    id: "registrar",
    title: "Registrar",
    description: "Handle special cases and manage closed section registrations",
    icon: ClipboardCheck,
    color:
      "from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20",
    borderColor: "border-rose-500/20 dark:border-rose-500/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    badge: "Administration",
    features: ["Override Management", "Special Cases", "Section Control"],
    link: "/demo/committee/registrar",
  },
];


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
              "@type": "EducationalOrganization",
              name: "King Saud University",
              department: "Software Engineering Department",
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
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              {/* Brand Logo */}
              <div className="flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="SmartSchedule logo"
                  width={80}
                  height={80}
                  priority
                  className="drop-shadow-lg"
                />
              </div>

              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Live Supabase Integration
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Smart<span className="text-primary">Schedule</span>
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl">
                  Rule-Aware Academic Scheduling Platform
                </p>
              </div>

              {/* Description */}
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Automate course planning with real-time Supabase data and department-specific rules. 
                Intelligent scheduling with conflict detection, faculty load management, and student registration.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Try Demo
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container mx-auto px-4 py-16"
          aria-label="Key Features"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful features that make SmartSchedule the perfect solution for academic scheduling
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 border-primary/20 hover:border-primary/40 transition-all">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-4">Curriculum Control</CardTitle>
              <CardDescription className="text-base">
                Edit courses and levels live with real-time Supabase data integration
              </CardDescription>
            </Card>
            
            <Card className="text-center p-8 border-2 border-primary/20 hover:border-primary/40 transition-all">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-4">Automated Scheduling</CardTitle>
              <CardDescription className="text-base">
                Rule-aware generator with conflict detection and optimization
              </CardDescription>
            </Card>
            
            <Card className="text-center p-8 border-2 border-primary/20 hover:border-primary/40 transition-all">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl mb-4">Secure Supabase Backend</CardTitle>
              <CardDescription className="text-base">
                Role-based access with RLS policies and real-time data synchronization
              </CardDescription>
            </Card>
          </div>
        </section>

        {/* Demo Accounts Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Try Demo Accounts
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience SmartSchedule with pre-configured demo accounts for each role
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card key={role.id} className={`border-2 ${role.borderColor} bg-gradient-to-br ${role.color} hover:shadow-lg transition-all`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${role.color} border-2 ${role.borderColor} mb-4`}>
                      <Icon className={`h-6 w-6 ${role.iconColor}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{role.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                    <Button asChild size="sm" className="w-full">
                      <Link href="/login">
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to Experience SmartSchedule?
              </h2>
              <p className="text-lg text-muted-foreground">
                Try our demo accounts to explore the full capabilities of our 
                rule-aware academic scheduling platform with live Supabase data.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Try Demo Now
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.png"
                  alt="SmartSchedule"
                  width={24}
                  height={24}
                />
                <span className="font-semibold">SmartSchedule</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>v4.0.0</span>
                <Separator orientation="vertical" className="h-4" />
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  GitHub
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
