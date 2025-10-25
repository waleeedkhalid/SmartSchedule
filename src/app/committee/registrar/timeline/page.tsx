/**
 * Registrar Timeline Page
 * Academic events and timeline management for registrar committee
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase";
import RegistrarTimelineClient from "./RegistrarTimelineClient";

const COMMITTEE_TYPE = "registrar" as const;
const SETUP_PATH = "/committee/registrar/setup";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function RegistrarTimelinePage() {
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
    redirect(SETUP_PATH);
  }

  // Fetch active term
  const { data: activeTerm } = await supabase
    .from("academic_term")
    .select("code, name")
    .eq("is_active", true)
    .maybeSingle();

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "Committee member";

  return (
    <RegistrarTimelineClient
      displayName={displayName}
      defaultTermCode={activeTerm?.code || "471"}
      defaultTermName={activeTerm?.name || "Fall 2024/2025"}
    />
  );
}

