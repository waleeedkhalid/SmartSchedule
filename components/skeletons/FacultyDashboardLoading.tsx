import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { CardsSkeleton } from "./CardsSkeleton";
import { CardSkeleton } from "./CardSkeleton";

export const FacultyDashboardLoading = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeaderSkeleton />

        {/* Charts Section */}
        <div className="mb-8">
          <ChartSkeleton height="h-64" />
        </div>

        {/* Stats Grid - 3 cards */}
        <CardsSkeleton count={3} gridCols="md:grid-cols-3" className="mb-8" />

        {/* My Timetable - Large Card */}
        <CardSkeleton contentLines={8} className="mb-6" />

        {/* Quick Actions and Preferences Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton contentLines={6} />
          <CardSkeleton contentLines={6} />
        </div>

        {/* Feedback Summary Card */}
        <CardSkeleton contentLines={6} className="border-yellow-200 dark:border-yellow-800" />
      </div>
    </div>
  );
};

