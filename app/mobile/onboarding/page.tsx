/**
 * Onboarding Page (Mobile)
 * 
 * First-time user profile setup for mobile users.
 * Redirects to schedule if onboarding is already complete.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { createClient } from "@/supabase/client";
import { OnboardingForm } from "@/app/mobile/components/onboarding-form";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/mobile/login");
      return;
    }

    checkOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router]);

  const checkOnboardingStatus = async () => {
    setIsChecking(true);
    try {
      const supabase = createClient();

      // Check onboarding_completed flag in user_roles table
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("onboarding_completed")
        .eq("user_id", user!.id)
        .maybeSingle();

      // If onboarding is already marked as completed, redirect
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((userRole as any)?.onboarding_completed === true) {
        router.push("/mobile/schedule");
        return;
      }

      // Check profile existence based on role
      let profileExists = false;

      if (user!.role === "student") {
        const { data: studentProfile } = await supabase
          .from("student_profile")
          .select("user_id")
          .eq("user_id", user!.id)
          .maybeSingle();
        profileExists = !!studentProfile;
      } else if (user!.role === "faculty") {
        const { data: facultyProfile } = await supabase
          .from("faculty_profile")
          .select("user_id")
          .eq("user_id", user!.id)
          .maybeSingle();
        profileExists = !!facultyProfile;
      } else if (["scheduling", "teaching_load", "registrar"].includes(user!.role)) {
        const { data: committeeProfile } = await supabase
          .from("committee_profile")
          .select("user_id")
          .eq("user_id", user!.id)
          .maybeSingle();
        profileExists = !!committeeProfile;
      }

      // If profile exists, onboarding is complete
      if (profileExists) {
        router.push("/mobile/schedule");
        return;
      }

      // Needs onboarding
      setNeedsOnboarding(true);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // On error, show onboarding form anyway
      setNeedsOnboarding(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  if (isChecking) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="py-8 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!needsOnboarding) {
    return null; // Will redirect
  }

  return (
    <OnboardingForm
      userId={user.id}
      userName={user.name}
      userRole={user.role as "student" | "faculty" | "scheduling" | "teaching_load" | "registrar"}
    />
  );
}

