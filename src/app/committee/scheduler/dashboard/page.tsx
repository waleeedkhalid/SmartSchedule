import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  UploadCloud,
  Sparkles,
  BellRing,
  FileJson,
  SendHorizontal,
} from "lucide-react";
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
import { createServerClient } from "@/lib/supabase/server-client";

const COMMITTEE_TYPE = "scheduling_committee" as const;
const SETUP_PATH = "/committee/scheduler/setup";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function SchedulerDashboardPage() {
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
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  const role = (profile?.role ?? user.user_metadata?.role) as
    | UserRole
    | undefined;

  if (role !== COMMITTEE_TYPE) {
    redirect(redirectByRole(role));
  }

  const { data: membership } = await supabase
    .from("committee_members")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(SETUP_PATH);
  }

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "Committee member";

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Scheduling Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Coordinate course imports, trigger schedule generation, and keep the
          registrar informed.
        </p>
        <p className="text-sm text-muted-foreground">
          Signed in as {displayName}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              Import External Courses
            </CardTitle>
            <CardDescription>
              Upload JSON files from partner departments to enrich course
              offerings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-10 text-center">
              <FileJson className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Ready for JSON uploads</p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your exported course data. Processing support is
                  coming soon.
                </p>
              </div>
              <Button variant="outline" disabled>
                Choose File
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Expected schema preview and validation will be surfaced here when
              the importer launches.
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Schedule
            </CardTitle>
            <CardDescription>
              Kick off the SmartSchedule engine once course data is ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-6 text-sm text-primary">
              Automated schedule generation orchestrates time slots, rooms, and
              faculty preferences. Preview will appear here.
            </div>
            <Button className="w-full" disabled>
              Begin Draft Run
            </Button>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Next steps</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Review imported courses for conflicts</li>
                <li>Validate faculty availability inputs</li>
                <li>Notify registrar once draft is generated</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Keep the registrar aligned as schedule changes roll out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
            <p>No outgoing notifications yet.</p>
            <p>
              Updates to generated schedules and conflicts will appear here for
              review and acknowledgment.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-foreground">
              Ready to alert the registrar?
            </p>
            <Button className="md:w-auto" disabled variant="secondary">
              <SendHorizontal className="mr-2 h-4 w-4" />
              Compose Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
