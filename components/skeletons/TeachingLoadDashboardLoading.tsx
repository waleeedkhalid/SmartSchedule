import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { CardsSkeleton } from "./CardsSkeleton";
import { CardSkeleton } from "./CardSkeleton";

export const TeachingLoadDashboardLoading = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeaderSkeleton />

        {/* Stats Grid - 3 cards */}
        <CardsSkeleton count={3} gridCols="md:grid-cols-3" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instructor Load Overview - Large Card */}
            <CardSkeleton className="lg:col-span-2" contentLines={3} />

            {/* Quick Actions */}
            <CardSkeleton contentLines={6} />

            {/* Guidelines */}
            <CardSkeleton contentLines={6} />
          </div>
      </div>
    </div>
  );
};

