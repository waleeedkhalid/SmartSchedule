import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  showButton?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const PageHeaderSkeleton = ({
  showButton = true,
  showSubtitle = true,
  className,
}: PageHeaderSkeletonProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <Skeleton className="h-9 w-64 mb-2" />
          {showSubtitle && <Skeleton className="h-5 w-96" />}
        </div>
        {showButton && <Skeleton className="h-10 w-32" />}
      </div>
    </div>
  );
};

