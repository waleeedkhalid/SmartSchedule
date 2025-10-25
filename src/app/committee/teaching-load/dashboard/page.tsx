import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  UsersRound,
  Settings2,
  LineChart,
  RotateCcw,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase";

const COMMITTEE_TYPE = "teaching_load_committee" as const;
const SETUP_PATH = "/committee/teaching-load/setup";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

export default async function TeachingLoadDashboardPage() {
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
          Teaching Load Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor workload distribution and collaborate on schedule refinements.
        </p>
        <p className="text-sm text-muted-foreground">
          Signed in as {displayName}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              View Generated Schedule
            </CardTitle>
            <CardDescription>
              Preview the current teaching assignments and section coverage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Load</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Schedule data has not been generated yet. Once available, it
                    will appear here for review.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last draft synced</span>
              <span>Waiting for scheduler handoff</span>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-primary" />
              Review Faculty Workload
            </CardTitle>
            <CardDescription>
              Spot imbalances and plan adjustments before publishing the
              schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-6 text-sm text-primary">
              Comparative analytics for contact hours, preparations, and
              overloads will be visualized here.
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Track overload requests awaiting approval</li>
              <li>Review upcoming sabbaticals and releases</li>
              <li>Coordinate with department chairs for conflicts</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Adjust Assignments
          </CardTitle>
          <CardDescription>
            Initiate changes to teaching assignments before registrar
            submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            <p>No adjustment requests have been submitted yet.</p>
            <p>
              Use the button below to start a reassignment workflow. You&apos;ll
              be able to coordinate directly with the registrar.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p className="font-medium text-foreground">
              Ready to propose updates?
            </p>
            <div className="flex flex-col gap-2 md:flex-row">
              <Button disabled>
                <ClipboardList className="mr-2 h-4 w-4" />
                Draft Adjustment
              </Button>
              <Button disabled variant="secondary">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Last Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
