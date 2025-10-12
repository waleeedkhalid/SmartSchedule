import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/utils/supabase/server";
import FacultySetupForm from "./faculty-setup-form";

export default async function FacultySetupPage() {
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

  if (role !== "faculty") {
    redirect(redirectByRole(role));
  }

  const { data: faculty } = await supabase
    .from("faculty")
    .select("faculty_number, title")
    .eq("id", user.id)
    .maybeSingle();

  if (faculty && faculty.faculty_number) {
    redirect("/faculty/dashboard");
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";

  return (
    <div className="bg-muted/10">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-16">
        <FacultySetupForm
          userId={user.id}
          fullName={fullName}
          email={email}
          initialFacultyNumber={faculty?.faculty_number}
          initialTitle={faculty?.title}
        />
      </div>
    </div>
  );
}
