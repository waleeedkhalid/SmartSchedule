"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckCircle, ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function HeroSection() {
  const { user, loading } = useAuth();

  return (
    <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-50 via-background to-background dark:from-brand-blue-950/10 dark:via-background dark:to-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50 dark:opacity-20" />
      </div>

      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Smart Scheduling for{" "}
              <span className="text-brand-blue-600 dark:text-brand-blue-500">Academic Excellence</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-400 md:text-xl leading-relaxed">
              Generate conflict-free schedules in seconds. Collaborate in real-time across departments. 
              Streamline scheduling for students, faculty, and administrators.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            {loading ? (
              // Show loading state while checking authentication
              <Button 
                size="lg" 
                disabled
                className="bg-brand-blue-600 text-white shadow-lg"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </Button>
            ) : user ? (
              <Button 
                size="lg" 
                asChild
                className="bg-brand-blue-600 text-white hover:bg-purple-600 dark:bg-brand-blue-500 dark:hover:bg-purple-500 shadow-lg transition-all"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  asChild
                  className="bg-brand-blue-600 text-white hover:bg-purple-600 dark:bg-brand-blue-500 dark:hover:bg-purple-500 shadow-lg transition-all"
                >
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  asChild
                  className="bg-white border-2 border-brand-blue-600 text-brand-blue-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-600 hover:scale-105 hover:shadow-2xl dark:bg-slate-800 dark:border-brand-blue-500 dark:text-brand-blue-500 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 shadow-lg"
                >
                  <Link href="/register">
                    Get Started Free
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 pt-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-500" />
              <span>Conflict-Free Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600 dark:text-teal-500" />
              <span>Real-Time Collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-blue-600 dark:text-brand-blue-500" />
              <span>Multi-Role Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

