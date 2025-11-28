import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TabsSkeletonProps {
  count?: number;
  className?: string;
}

export const TabsSkeleton = ({
  count = 3,
  className,
}: TabsSkeletonProps) => {
  return (
    <div className={cn("flex gap-2 mb-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={`tab-skeleton-${i}`} className="h-10 w-24" />
      ))}
    </div>
  );
};

