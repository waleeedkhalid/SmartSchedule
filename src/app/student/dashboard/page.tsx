import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/utils/supabase/server";

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
    <div className="bg-muted/10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col gap-8 px-6 py-10">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Student Portal
          </p>
          <h1 className="text-3xl font-semibold">Welcome back, {fullName}</h1>
          <p className="text-muted-foreground">
            Review your registered information and stay up to date with your
            academic status.
          </p>
        </header>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Profile Overview</CardTitle>
            <CardDescription>
              Key account details associated with your SmartSchedule profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="text-lg font-medium">{fullName || "—"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg font-medium">{email}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Student Number
                </p>
                <p className="text-lg font-semibold">
                  {student.student_number || "Pending"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Level
                </p>
                <p className="text-lg font-semibold">Level {student.level}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <p className="text-lg font-semibold capitalize">
                  {student.status ?? "active"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Need to make changes? Update your registration details to keep
                your schedule recommendations accurate.
              </div>
              <Button variant="outline" size="lg" className="md:w-auto">
                Edit Info
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              You&apos;re all set. We&apos;ll notify you when new schedule
              updates or elective recommendations are available.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="font-medium">Stay informed</p>
              <p className="text-sm text-muted-foreground">
                Check back regularly or enable notifications to receive updates
                on schedule releases and faculty announcements.
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-4">
              <p className="font-medium">Keep your profile current</p>
              <p className="text-sm text-muted-foreground">
                If your academic level or status changes, update your
                information so SmartSchedule can adapt recommendations in
                real-time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
