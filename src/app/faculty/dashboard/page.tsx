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

export default async function FacultyDashboardPage() {
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

  if (!faculty) {
    redirect("/faculty/setup");
  }

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? "";
  const email = profile?.email ?? user.email ?? "";
  const title = faculty.title ?? "Faculty";
  const facultyNumber = faculty.faculty_number ?? "Pending";
  const status = faculty.status ?? "active";

  return (
    <div className="bg-muted/10">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Faculty Portal
          </p>
          <h1 className="text-3xl font-semibold">
            Welcome back, {title} {fullName || "Faculty"}
          </h1>
          <p className="text-muted-foreground">
            Review your teaching profile and prepare upcoming availability and
            course preferences.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="h-full">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">My Info</CardTitle>
              <CardDescription>
                High-level details from your faculty profile managed by
                SmartSchedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Name
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

              <Separator />

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Title
                  </p>
                  <p className="text-lg font-semibold">{title}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Faculty Number
                  </p>
                  <p className="text-lg font-semibold">{facultyNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-lg font-semibold capitalize">{status}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Keep your profile updated so scheduling and teaching load
                  insights remain accurate.
                </p>
                <Button variant="outline" size="lg" className="md:w-auto">
                  Manage Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Availability</CardTitle>
                <CardDescription>
                  Set teaching availability to help the scheduler align courses
                  with your schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We&apos;re building an availability planner so you can share
                  preferred time blocks, constraints, and recurring commitments.
                </p>
                <Button className="w-full" disabled>
                  Coming soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Preferred Courses</CardTitle>
                <CardDescription>
                  Indicate the courses and sections you prefer to teach for
                  upcoming terms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This section will let you rank courses, highlight expertise
                  areas, and coordinate with department needs.
                </p>
                <Button className="w-full" variant="outline" disabled>
                  Coming soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
