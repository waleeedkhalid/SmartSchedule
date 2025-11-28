import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { TableSkeleton } from "./TableSkeleton";

export const RegistrarDashboardLoading = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeaderSkeleton showButton={false} />

        {/* Irregular Students Management */}
        <TableSkeleton rows={8} columns={6} showPagination={true} />

        {/* Manual Student Registration */}
        <TableSkeleton rows={5} columns={5} showPagination={false} />
      </div>
    </div>
  );
};

