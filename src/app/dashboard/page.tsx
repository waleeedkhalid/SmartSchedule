"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        const supabase = createBrowserClient();
        
        // Get authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Auth error:", authError);
          setError(`Authentication error: ${authError.message}`);
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        if (!user) {
          if (process.env.NODE_ENV === "development") {
            console.log("No user found, redirecting to login");
          }
          router.push("/login");
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("User authenticated:", user.id);
        }

        // Get user role from the database
        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (dbError) {
          console.error("Database error fetching user role:", dbError);
          setError(`Database error: ${dbError.message}`);
          setTimeout(() => router.push("/login"), 2000);
          return;
        }

        if (!userData) {
          console.error("No user data found in database for user:", user.id);
          setError("User profile not found. Please contact support.");
          setTimeout(() => router.push("/login"), 3000);
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("User role:", userData.role);
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
            console.error("Unknown role:", userData.role);
            setError(`Unknown role: ${userData.role}`);
            setTimeout(() => router.push("/login"), 2000);
            break;
        }
      } catch (error) {
        console.error("Unexpected error checking user:", error);
        setError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        setTimeout(() => router.push("/login"), 2000);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndRedirect();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl font-semibold">Error</div>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

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
