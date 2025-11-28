import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
  showHeader?: boolean;
  showContent?: boolean;
  contentLines?: number;
  className?: string;
}

export const CardSkeleton = ({
  showHeader = true,
  showContent = true,
  contentLines = 3,
  className,
}: CardSkeletonProps) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
      )}
      {showContent && (
        <CardContent className="space-y-2">
          {Array.from({ length: contentLines }).map((_, i) => (
            <Skeleton key={`card-line-${i}`} className="h-4 w-full" />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

