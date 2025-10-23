import { ReactNode } from "react";
import { PersonaNavigation } from "@/components/shared/PersonaNavigation";
import { studentNavItems } from "@/components/shared/navigation-config";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/shared/Footer";
import { Providers } from "../providers";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const navigationItems = studentNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    description: item.description,
  }));

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-muted/10">
        <PersonaNavigation
          personaName="Student Portal"
          navItems={navigationItems}
          className="sticky top-0 z-40"
        />
        <main className="flex-1">
          <div className="container mx-auto w-full max-w-7xl px-4 py-6">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
