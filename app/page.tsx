import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RoleBenefits } from "@/components/landing/role-benefits";
import { CTASection } from "@/components/landing/cta-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { Logo } from "@/components/brand/logo";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Header */}
      <LandingHeader />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <HowItWorks />
        <RoleBenefits />
        
        {/* Technical Highlights */}
        <section className="w-full py-12 border-y bg-muted/20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  Next.js 15+
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Blazing Fast Performance
                </span>
              </div>
              <Separator orientation="vertical" className="h-12 hidden md:block" />
              <div className="flex flex-col items-center space-y-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  Supabase
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Enterprise Security & RLS
                </span>
              </div>
              <Separator orientation="vertical" className="h-12 hidden md:block" />
              <div className="flex flex-col items-center space-y-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  Real-Time Sync
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Live Collaboration
                </span>
              </div>
              <Separator orientation="vertical" className="h-12 hidden md:block" />
              <div className="flex flex-col items-center space-y-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  Mobile Ready
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Fully Responsive Design
                </span>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-8 bg-muted/30">
          <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="space-y-3">
              <Link href="/" className="flex items-center">
                <Logo size="md" />
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Intelligent academic scheduling for modern institutions
              </p>
            </div>

            {/* Product */}
            <div className="space-y-3">
              <h3 className="font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#roles" className="text-muted-foreground hover:text-foreground">
                    User Roles
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h3 className="font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <span className="text-muted-foreground">Documentation</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Support</span>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h3 className="font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-muted-foreground">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-muted-foreground">Terms of Service</span>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} SmartSchedule. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with Next.js, Supabase, and shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
