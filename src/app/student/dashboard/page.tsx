import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function StudentDashboardPage() {
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
    .select("full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== "student") {
    redirect(redirectByRole(role));
  }

  const { data: student } = await supabase
    .from("students")
    .select("student_number, level, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!student) {
    redirect("/student/setup");
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <StudentDashboardClient
      fullName={fullName}
      email={email}
      studentNumber={student.student_number || ""}
      level={student.level}
      status={student.status ?? "active"}
    />
  );
}
