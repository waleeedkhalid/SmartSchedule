import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  className?: string;
}

export const TableSkeleton = ({
  rows = 5,
  columns = 5,
  showHeader = true,
  showPagination = true,
  className,
}: TableSkeletonProps) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="border-t">
          {/* Table Header Row */}
          <div className="p-4 border-b grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-4 w-full" />
            ))}
          </div>
          {/* Table Data Rows */}
          <div className="p-4 space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-6 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between border-t px-4 py-4">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`pagination-${i}`} className="h-9 w-9" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

