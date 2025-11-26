import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardsSkeletonProps {
  count?: number;
  gridCols?: string;
  showCardHeader?: boolean;
  className?: string;
}

export const CardsSkeleton = ({
  count = 4,
  gridCols = "md:grid-cols-2 lg:grid-cols-4",
  showCardHeader = true,
  className,
}: CardsSkeletonProps) => {
  return (
    <div className={cn("grid grid-cols-1 gap-6", gridCols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`card-skeleton-${i}`}>
          {showCardHeader && (
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
          )}
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            {showCardHeader && <Skeleton className="h-3 w-32" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

