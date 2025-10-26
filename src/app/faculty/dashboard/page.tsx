import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server";
import FacultyDashboardClient from "./FacultyDashboardClient";

export default async function FacultyDashboardPage() {
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

  const { data: faculty } = await supabase
    .from("faculty")
    .select("faculty_id, title, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!faculty) {
    redirect("/faculty/setup");
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";
  const title = faculty.title ?? "Faculty";
  const facultyId = faculty.faculty_id ?? "Pending";
  const status = faculty.status ?? "active";

  return (
    <FacultyDashboardClient
      fullName={fullName}
      email={email}
      facultyId={facultyId}
      title={title}
      status={status}
    />
  );
}
