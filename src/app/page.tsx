// PRD 3.1 - Landing Page: Gateway to SmartSchedule System
// Modern, role-based interface for KSU SWE Department Timetabling
// Uses shadcn/ui components with academic-inspired design
// PRD 3.2 - Authentication: Protected role access with sign in/up flow

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AuthDialog } from "@/components/auth/AuthDialog";
import {
  Calendar,
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Briefcase,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Brain,
  ArrowRight,
  LucideIcon,
  LogIn,
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

// System features - PRD Section 4 (Core Features)
const features = [
  {
    icon: Brain,
    title: "Intelligent Generation",
    description: "AI-powered schedule creation with conflict detection",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Instant notifications and collaborative workflows",
  },
  {
    icon: Shield,
    title: "Rule Enforcement",
    description: "Automated validation of prerequisites and constraints",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Comprehensive insights into scheduling patterns",
  },
];

export default function HomePage() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleCardData | null>(null);

  const handleRoleClick = (role: RoleCardData) => {
    setSelectedRole(role);
    setAuthDialogOpen(true);
  };

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
              "Intelligent academic timetabling and course management system for universities. Features AI-powered scheduling, automated conflict detection, faculty load management, and comprehensive student registration tools.",
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
                  src="/branding/icon.png"
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
                  King Saud University
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Smart<span className="text-primary">Schedule</span>
                </h1>
                <p className="text-xl text-muted-foreground md:text-2xl">
                  Software Engineering Department
                </p>
              </div>

              {/* SEO-Optimized Description */}
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Transform academic planning with our intelligent timetabling
                system. Automate course scheduling, eliminate conflicts,
                optimize faculty workloads, and streamline student
                registration—all powered by advanced algorithms designed for
                educational excellence at King Saud University.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => handleRoleClick(roles[0])}
                >
                  <LogIn className="h-4 w-4" />
                  Get Started
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#roles">Explore Roles</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className="container mx-auto px-4 py-16"
          aria-label="Key Features"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden border-muted transition-all duration-300 hover:shadow-lg hover:border-primary/50"
              >
                <CardHeader>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Roles Section */}
        <section
          id="roles"
          className="container mx-auto px-4 py-16"
          aria-label="User Roles"
        >
          <div className="text-center mb-12 space-y-4">
            <Badge variant="outline" className="px-4 py-1">
              User Roles
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Secure Role-Based Access
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Sign in to access specialized tools and workflows designed for
              your role. Each dashboard is tailored to your specific needs and
              permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <HoverCard key={role.id} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <button
                      onClick={() => handleRoleClick(role)}
                      className="w-full text-left"
                    >
                      <Card
                        className={`relative overflow-hidden border-2 ${role.borderColor} bg-gradient-to-br ${role.color} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer group`}
                      >
                        <CardHeader className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div
                              className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${role.color} border-2 ${role.borderColor} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                            >
                              <Icon className={`h-7 w-7 ${role.iconColor}`} />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {role.badge}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {role.title}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {role.description}
                            </CardDescription>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {role.features.map((feature, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >
                                <CheckCircle2
                                  className={`h-4 w-4 ${role.iconColor}`}
                                />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2"
                          >
                            <LogIn className="h-4 w-4" />
                            Sign In
                          </Button>
                        </CardContent>

                        {/* Hover Arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <ArrowRight className={`h-5 w-5 ${role.iconColor}`} />
                        </div>
                      </Card>
                    </button>
                  </HoverCardTrigger>

                  <HoverCardContent className="w-80" side="top">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Secure Access Required
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Click to sign in and access the{" "}
                        {role.title.toLowerCase()} dashboard with full access to
                        all features and workflows.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section
          className="border-t bg-muted/30"
          aria-label="System Statistics"
        >
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "5", label: "User Roles", icon: Users },
                { value: "100+", label: "Courses", icon: BookOpen },
                { value: "24/7", label: "Availability", icon: Calendar },
                { value: "Auto", label: "Generation", icon: Sparkles },
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div key={idx} className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
                      <StatIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to Transform Your Academic Planning?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join hundreds of faculty and students using SmartSchedule to
                streamline course management, optimize resources, and enhance
                the academic experience at King Saud University.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={() => handleRoleClick(roles[0])}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Access Student Portal
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleRoleClick(roles[1])}
                >
                  Faculty Login
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Authentication Dialog */}
      {selectedRole && (
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
          roleTitle={selectedRole.title}
          redirectPath={selectedRole.link}
        />
      )}
    </>
  );
}
