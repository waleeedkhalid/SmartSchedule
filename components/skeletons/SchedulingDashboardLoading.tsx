import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { TabsSkeleton } from "./TabsSkeleton";
import { CardsSkeleton } from "./CardsSkeleton";
import { CardSkeleton } from "./CardSkeleton";

export const SchedulingDashboardLoading = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeaderSkeleton />

        <div className="space-y-6">
          <TabsSkeleton count={3} />

          {/* Stats Grid - 5 cards */}
          <CardsSkeleton
            count={5}
            gridCols="md:grid-cols-2 lg:grid-cols-5"
          />

          {/* Schedule Generation Section */}
          <CardSkeleton contentLines={6} />

          {/* Setup Checklist */}
          <CardSkeleton contentLines={8} />
        </div>
      </div>
    </div>
  );
};

