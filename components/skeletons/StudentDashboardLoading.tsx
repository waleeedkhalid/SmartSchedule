import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { TabsSkeleton } from "./TabsSkeleton";
import { ChartSkeleton } from "./ChartSkeleton";
import { CardsSkeleton } from "./CardsSkeleton";
import { CardSkeleton } from "./CardSkeleton";

export const StudentDashboardLoading = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeaderSkeleton showButton={false} />

      {/* Main Tabbed Interface */}
      <div className="space-y-6">
        <TabsSkeleton count={5} />

        {/* Overview Tab Content */}
        <div className="space-y-6">
          {/* Charts Section */}
          <ChartSkeleton height="h-64" />

          {/* Stats Grid - 4 cards */}
          <CardsSkeleton count={4} gridCols="md:grid-cols-2 lg:grid-cols-4" />

          {/* Quick Start Guide */}
          <CardSkeleton contentLines={8} />
        </div>
      </div>
    </div>
  );
};

