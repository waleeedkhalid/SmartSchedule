/**
 * Committee Portal Loading State
 * ✅ PERFORMANCE: Instant feedback during navigation
 * Shows immediately while page data loads
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function CommitteeLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}

