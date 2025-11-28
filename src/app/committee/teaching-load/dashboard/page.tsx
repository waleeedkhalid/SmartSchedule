import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import TeachingLoadDashboardPageClient from "../TeachingLoadDashboardPageClient";

const COMMITTEE_TYPE = "teaching_load_committee" as const;
const SETUP_PATH = "/committee/teaching-load/setup";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function TeachingLoadDashboardPage() {
    const supabase = await createServerClient();

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
    redirect(SETUP_PATH);
  }

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "Committee member";

  return (
    <TeachingLoadDashboardPageClient
      displayName={displayName}
      userId={user.id}
    />
  );
}
