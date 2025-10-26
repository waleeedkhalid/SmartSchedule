import { Skeleton } from "@/components/ui/skeleton";

/**
 * Faculty Dashboard Loading State
 * Simple, minimal loading indicator
 */
export default function FacultyLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Content Loading */}
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading ...</p>
        </div>
      </div>
    </div>
  );
}

