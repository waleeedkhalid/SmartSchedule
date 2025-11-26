import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { CardsSkeleton } from "./CardsSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { TabsSkeleton } from "./TabsSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { CardSkeleton } from "./CardSkeleton";
import { cn } from "@/lib/utils";

type DashboardLoadingVariant =
  | "default"
  | "with-tabs"
  | "with-charts"
  | "table-only";

interface DashboardLoadingProps {
  variant?: DashboardLoadingVariant;
  className?: string;
}

export const DashboardLoading = ({
  variant = "default",
  className,
}: DashboardLoadingProps) => {
  return (
    <div className={cn("p-8", className)}>
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeaderSkeleton />

        {variant === "default" && (
          <>
            <CardsSkeleton count={4} gridCols="md:grid-cols-2 lg:grid-cols-4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton contentLines={5} />
              <CardSkeleton contentLines={5} />
            </div>
          </>
        )}

        {variant === "with-tabs" && (
          <>
            <TabsSkeleton count={3} />
            <CardsSkeleton count={5} gridCols="md:grid-cols-2 lg:grid-cols-5" />
            <CardSkeleton contentLines={8} />
          </>
        )}

        {variant === "with-charts" && (
          <>
            <ChartSkeleton height="h-64" />
            <CardsSkeleton count={3} gridCols="md:grid-cols-3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton contentLines={6} />
              <CardSkeleton contentLines={6} />
            </div>
          </>
        )}

        {variant === "table-only" && (
          <TableSkeleton rows={10} columns={6} />
        )}
      </div>
    </div>
  );
};

