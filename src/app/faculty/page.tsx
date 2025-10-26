import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";

export default async function FacultyLandingPage() {
    const supabase = await createServerClient();

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

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  const { data: faculty } = await supabase
    .from("faculty")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (faculty) {
    redirect("/faculty/dashboard");
  }

  redirect("/faculty/setup");
}
