/**
 * Course Management Page
 * Main page for managing courses and sections in the scheduler
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { CourseManagementClient } from "@/components/committee/scheduler/CourseManagementClient";

const COMMITTEE_TYPE = "scheduling_committee" as const;

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function CourseManagementPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== COMMITTEE_TYPE) {
    redirect(redirectByRole(role));
  }

  const { data: membership } = await supabase
    .from("committee_members")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/committee/scheduler/setup");
  }

  // Get active term
  const { data: activeTerm } = await supabase
    .from("academic_term")
    .select("code, name")
    .eq("is_active", true)
    .maybeSingle();

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "Committee member";

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
        <p className="text-muted-foreground">
          Manage courses, sections, and course offerings for{" "}
          {activeTerm?.name || "the current term"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Signed in as {displayName}
        </p>
      </div>

      <CourseManagementClient 
        termCode={activeTerm?.code || ""} 
        termName={activeTerm?.name || ""} 
      />
    </div>
  );
}

