import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import FacultyCoursesClient from "./FacultyCoursesClient";

export default async function FacultyCoursesPage() {
    const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  return <FacultyCoursesClient />;
}

