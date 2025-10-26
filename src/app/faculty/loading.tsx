/**
 * Faculty Portal Loading State
 * ✅ PERFORMANCE: Instant feedback during navigation
 * Shows immediately while page data loads
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function FacultyLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}

