import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { PersonaNavigation } from "@/components/shared/PersonaNavigation";
import { facultyNavItems } from "@/components/shared/navigation-config";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

interface FacultyLayoutProps {
  children: ReactNode;
}

/**
 * Faculty Layout - Server Component with Optimized Authentication
 * ✅ PERFORMANCE: Uses cached auth functions (10-100x faster)
 * Following performance.md guidelines
 */
export default async function FacultyLayout({ children }: FacultyLayoutProps) {
  // ✅ OPTIMIZED: Use cached auth functions - deduplicated per request
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const role = profile?.role;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  const navigationItems = facultyNavItems.map((item) => ({
    label: item.label,
    href: item.href,
    description: item.description,
  }));

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col bg-secondary/30">
        <PersonaNavigation
          personaName="Faculty Portal"
          navItems={navigationItems}
          className="sticky top-0 z-40 border-b bg-card shadow-sm"
        />
        <main className="flex-1">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            {children}
          </div>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

