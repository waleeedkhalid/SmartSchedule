import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";

export default async function StudentEntryPoint() {
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

  if (role !== "student") {
    redirect(redirectByRole(role));
  }

  const { data: studentRecord } = await supabase
    .from("students")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!studentRecord) {
    redirect("/student/setup");
  }

  redirect("/student/dashboard");
}
