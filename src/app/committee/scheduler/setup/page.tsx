import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { redirectByRole, type UserRole } from "@/lib/auth/redirect-by-role";
import { createServerClient } from "@/lib/supabase/server-client";

const COMMITTEE_TYPE = "scheduling_committee" as const;
const DASHBOARD_PATH = "/committee/scheduler/dashboard";

type Profile = {
  full_name?: string | null;
  role?: string | null;
};

async function completeSchedulerSetup(formData: FormData) {
  "use server";

  const committeeType = formData.get("committee_type");

  if (committeeType !== COMMITTEE_TYPE) {
    redirect("/committee/scheduler/setup");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("committee_members").upsert({
    id: user.id,
    committee_type: COMMITTEE_TYPE,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(DASHBOARD_PATH);
}

export default async function SchedulerSetupPage() {
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

  if (membership) {
    redirect(DASHBOARD_PATH);
  }

  const displayName =
    profile?.full_name ?? user.user_metadata?.full_name ?? "Committee member";

  return (
    <div className="bg-muted/10">
      <div className="container mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
        <Card className="shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-2xl">
                  Scheduling Committee Onboarding
                </CardTitle>
                <CardDescription>
                  Welcome back, {displayName}. Confirm your role to unlock the
                  dashboard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                The scheduling committee ensures course offerings and time slots
                align with faculty availability and student demand. Completing
                this quick setup verifies your access and prepares the workspace
                for schedule generation.
              </p>
              <div className="flex items-center gap-2 rounded-md border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  Review responsibilities, then continue to the dashboard.
                </span>
              </div>
            </div>

            <Separator />

            <form action={completeSchedulerSetup} className="space-y-4">
              <input
                type="hidden"
                name="committee_type"
                value={COMMITTEE_TYPE}
              />
              <div className="flex items-start gap-3 rounded-md border bg-muted/50 px-4 py-3 text-sm">
                <ClipboardList className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p>
                  You will gain access to schedule generation tools, external
                  course imports, and registrar notifications.
                </p>
              </div>
              <Button type="submit" className="w-full">
                Continue to Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
