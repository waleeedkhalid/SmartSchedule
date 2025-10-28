import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-blue" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Ready to Transform Your Scheduling?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-white/95 md:text-xl leading-relaxed">
              Join institutions already using SmartSchedule to save time, reduce conflicts, 
              and improve collaboration across departments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              asChild 
              className="bg-white text-brand-blue-600 hover:bg-slate-50 font-semibold group shadow-lg"
            >
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-2 border-white text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          <p className="text-sm text-white/90">
            No credit card required • Free to get started • Full feature access
          </p>
        </div>
      </div>
    </section>
  );
}

