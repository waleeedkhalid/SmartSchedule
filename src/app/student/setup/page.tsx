import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/utils/supabase/server";
import StudentSetupForm from "@/app/student/setup/student-setup-form";

export default async function StudentSetupPage() {
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

  const { data: existingStudent } = await supabase
    .from("students")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingStudent) {
    redirect("/student/dashboard");
  }

  return (
    <div className="bg-muted/10">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
        <StudentSetupForm
          userId={user.id}
          fullName={profile?.full_name ?? user.user_metadata?.full_name ?? ""}
          email={profile?.email ?? user.email ?? ""}
        />
      </div>
    </div>
  );
}
