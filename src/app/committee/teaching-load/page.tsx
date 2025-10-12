import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server-client";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";

const DASHBOARD_PATH = "/committee/teaching-load/dashboard";
const SETUP_PATH = "/committee/teaching-load/setup";

export default async function TeachingLoadLandingPage() {
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== "teaching_load_committee") {
    redirect(redirectByRole(role));
  }

  const { data: membership } = await supabase
    .from("committee_members")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(SETUP_PATH);
  }

  redirect(DASHBOARD_PATH);
}
