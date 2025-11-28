"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export function CTASection() {
  const { user, loading } = useAuth();

  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-blue" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {loading 
                ? "Loading..." 
                : user 
                  ? "Welcome Back!" 
                  : "Ready to Transform Your Scheduling?"
              }
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/95 md:text-xl leading-relaxed">
              {loading
                ? "Checking your account..."
                : user 
                  ? "Continue managing your schedules and collaborating with your team."
                  : "Join institutions already using SmartSchedule to save time, reduce conflicts, and improve collaboration across departments."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {loading ? (
              // Show loading state while checking authentication
              <Button 
                size="lg" 
                disabled
                className="bg-white/80 text-brand-blue-600 font-semibold shadow-lg"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </Button>
            ) : user ? (
              <Button 
                size="lg" 
                asChild 
                className="bg-white text-brand-blue-600 hover:bg-indigo-50 hover:text-indigo-700 hover:scale-105 hover:shadow-2xl font-semibold group shadow-lg transition-all duration-200"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white text-brand-blue-600 hover:bg-indigo-50 hover:text-indigo-700 hover:scale-105 hover:shadow-2xl font-semibold group shadow-lg transition-all duration-200"
                >
                  <Link href="/login">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  asChild
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:border-white hover:text-purple-600 hover:scale-105 hover:shadow-2xl transition-all duration-200 shadow-lg"
                >
                  <Link href="/register">
                    Create Free Account
                  </Link>
                </Button>
              </>
            )}
          </div>

          {!loading && !user && (
            <p className="text-sm text-white/90">
              No credit card required • Free to get started • Full feature access
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

