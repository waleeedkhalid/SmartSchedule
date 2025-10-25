import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import FacultyAvailabilityClient from "./FacultyAvailabilityClient";

export default async function FacultyAvailabilityPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify faculty role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "faculty") {
    redirect("/dashboard");
  }

  // Get active term for permission checking
  const { data: activeTerm } = await supabase
    .from("academic_term")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  return <FacultyAvailabilityClient activeTerm={activeTerm} />;
}

