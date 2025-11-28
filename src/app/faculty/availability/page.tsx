/**
 * Faculty Availability Page (Optimized - No Double Loading)
 * 
 * ✅ Fetches ALL data server-side (availability + term)
 * ✅ Single loading state from parent
 * ✅ No client-side useEffect fetching
 */

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import FacultyAvailabilityClient from "./FacultyAvailabilityClient";

export default async function FacultyAvailabilityPage() {
  const supabase = await createServerClient();

  // Use cached auth
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await getUserProfile();
  if (profile?.role !== "faculty") {
    redirect("/faculty");
  }

  // ✅ OPTIMIZED: Fetch both term AND availability data server-side
  const [{ data: activeTerm }, { data: existingAvailability }] = await Promise.all([
    supabase
      .from("academic_term")
      .select("*")
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("faculty_availability")
      .select("availability_data, updated_at")
      .eq("faculty_id", user.id)
      .maybeSingle()
  ]);

  return (
    <FacultyAvailabilityClient
      activeTerm={activeTerm}
      initialAvailability={existingAvailability?.availability_data || {}}
      lastSaved={existingAvailability?.updated_at || null}
    />
  );
}

