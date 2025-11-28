"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { Calendar, Users, LayoutDashboard, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Conflict-free schedules generated automatically",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Real-Time Sync",
    description: "Collaborate with your team in real-time",
    color: "text-teal-600 dark:text-teal-400",
  },
  {
    icon: LayoutDashboard,
    title: "Role-Based Views",
    description: "Customized dashboards for every role",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: Clock,
    title: "Exam Management",
    description: "Automated conflict detection for exams",
    color: "text-orange-600 dark:text-orange-400",
  },
];

export default function MobileLandingPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to schedule if already authenticated
    if (isAuthenticated) {
      router.push("/mobile/schedule");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full px-4 py-6 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-center">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Smart Scheduling for{" "}
            <span className="text-blue-600 dark:text-blue-400">Academic Excellence</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Generate conflict-free schedules, manage courses, and collaborate in real-time.
          </p>
        </section>

        {/* CTA Buttons */}
        <section className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            <Link href="/mobile/login">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-semibold"
          >
            <Link href="/mobile/register">
              Create Account
            </Link>
          </Button>
        </section>

        {/* Features Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Key Features</h2>
          <div className="grid gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="border-border/40 bg-card/50 backdrop-blur-sm"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Info */}
        <section className="space-y-3">
          <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Create your account in seconds
              </p>
              <p>
                • Access your schedule from anywhere
              </p>
              <p>
                • Manage enrollments on the go
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-6 border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartSchedule
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}

