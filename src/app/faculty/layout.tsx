import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { FacultySidebar } from "@/components/faculty/Sidebar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";

interface FacultyLayoutProps {
  children: ReactNode;
}

export default async function FacultyLayout({ children }: FacultyLayoutProps) {
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
    .select("faculty_number, title, status")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const title = faculty?.title ?? "Faculty";

  return (
    <ThemeProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <FacultySidebar fullName={fullName} title={title} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

