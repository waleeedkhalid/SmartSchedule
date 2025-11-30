import { redirect } from "next/navigation";
import { getServerUser, validateOnboardingAndProfile } from "@/lib/server-auth";
import { OnboardingForm } from "@/app/mobile/components/onboarding-form";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function OnboardingPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/mobile/login");
  }

  const { needsOnboarding } = await validateOnboardingAndProfile(user.id, user.role);

  if (!needsOnboarding) {
    redirect("/mobile/schedule");
  }

  // Calculate Hijri Year Server-Side to prevent hydration errors
  const currentDate = new Date();
  const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    year: "numeric",
  });
  const parts = hijriFormatter.formatToParts(currentDate);
  const yearPart = parts.find((part) => part.type === "year");
  let currentHijriYear = new Date().getFullYear() - 621;

  if (yearPart) {
    const val = parseInt(yearPart.value, 10);
    if (!isNaN(val)) currentHijriYear = val;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link href="/mobile/login" passHref>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Welcome to SmartSchedule</CardTitle>
                <CardDescription>
                  Let&apos;s set up your profile to get started
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <OnboardingForm
          userId={user.id}
          userName={user.name}
          userRole={user.role as any}
          currentHijriYear={currentHijriYear}
        />
      </div>
    </div>
  );
}

