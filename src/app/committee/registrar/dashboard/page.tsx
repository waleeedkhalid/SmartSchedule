import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Inbox,
  Upload,
  ClipboardCheck,
  FileWarning,
  FileSpreadsheet,
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
import { Textarea } from "@/components/ui/textarea";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server-client";

const COMMITTEE_TYPE = "registrar" as const;
const SETUP_PATH = "/committee/registrar/setup";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function RegistrarDashboardPage() {
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
          Registrar Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Finalize irregular student data, manage overrides, and prepare for
          publication.
        </p>
        <p className="text-sm text-muted-foreground">
          Signed in as {displayName}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Irregular Students Data
            </CardTitle>
            <CardDescription>
              Import advisement notes and irregular enrollment details to update
              draft schedules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-6 py-10 text-center">
              <Inbox className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Awaiting data upload</p>
                <p className="text-sm text-muted-foreground">
                  Drag JSON or CSV files here. Validation feedback will appear
                  once processing is enabled.
                </p>
              </div>
              <Button variant="outline" disabled>
                Select File
              </Button>
            </div>
            <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Next milestone</p>
              <p>
                Confirm irregular student cases before releasing the schedule to
                advisors.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Overrides &amp; Exceptions
            </CardTitle>
            <CardDescription>
              Draft registrar notes and approvals prior to publishing updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Document override rationale, registration caps, or special approvals."
              className="min-h-[140px] resize-none"
              disabled
            />
            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
              Pending approvals from teaching load and scheduling committees
              will sync here automatically.
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p className="font-medium text-foreground">
                No override requests yet.
              </p>
              <Button disabled>
                <FileWarning className="mr-2 h-4 w-4" />
                Log Exception
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Publication Checklist
          </CardTitle>
          <CardDescription>
            Ensure all dependencies are resolved before releasing the official
            schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <Separator />
          <ul className="list-disc list-inside space-y-1">
            <li>Validate irregular student placements</li>
            <li>Confirm override approvals with committees</li>
            <li>Prepare registrar announcement for campus community</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
