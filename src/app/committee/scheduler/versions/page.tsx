/**
 * Schedule Versions Page
 * View schedule version history and changes
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthenticatedUser, getUserProfile } from "@/lib/auth/cached-auth";
import { getRecentChanges } from "@/lib/queries/version-queries";
import { redirectByRole } from "@/lib/auth/redirect-by-role";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, History } from "lucide-react";
import { VersionTimeline } from "@/components/committee/VersionTimeline";

export default async function VersionsPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();
  const allowedRoles = ["scheduling_committee", "teaching_load_committee", "registrar"];

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    redirect(redirectByRole(profile?.role));
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/committee/scheduler">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Scheduler
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Version History</h1>
            <p className="text-muted-foreground">
              Track all changes made to schedules and sections
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<VersionsSkeleton />}>
        <VersionsContent />
      </Suspense>
    </div>
  );
}

async function VersionsContent() {
  const versions = await getRecentChanges(50);

  return <VersionTimeline versions={versions} />;
}

function VersionsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

