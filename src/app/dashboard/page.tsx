"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Get user role from the database
        const { data: userData, error } = await supabase
          .from("user")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !userData) {
          console.error("Error fetching user role:", error);
          router.push("/login");
          return;
        }

        // Redirect based on role
        switch (userData.role) {
          case "student":
            router.push("/student");
            break;
          case "faculty":
            router.push("/faculty");
            break;
          case "scheduling_committee":
            router.push("/committee/scheduler");
            break;
          case "teaching_load_committee":
            router.push("/committee/teaching-load");
            break;
          case "registrar":
            router.push("/committee/registrar");
            break;
          default:
            router.push("/login");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
