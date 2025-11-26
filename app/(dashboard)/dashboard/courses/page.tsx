import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getCoursesPaginated } from "@/lib/data/courses";
import { Plus, Info } from "lucide-react";
import { CoursesTable } from "@/components/courses-table";
import { CoursesSearch } from "@/components/courses-search";
import { CoursesPagination } from "@/components/courses-pagination";
import { CoursesSort } from "@/components/courses-sort";
import { CourseDialogProvider } from "@/components/courses-client";
import { CoursesHeader } from "@/components/courses-header";

interface CoursesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

// Separate component for data fetching to enable Suspense streaming
// This component is wrapped in Suspense, allowing the page shell to render instantly
// while data loads in the background (streaming SSR)
async function CoursesContent({ 
  currentPage, 
  searchTerm,
  sortBy,
  sortOrder
}: { 
  currentPage: number
  searchTerm: string
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours'
  sortOrder: 'asc' | 'desc'
}) {
  // Fetch courses from Supabase with optimized query:
  // - Only selects required columns (code, title, level, credits, weekly_hours, is_elective)
  // - Uses pagination (.range()) to limit data transfer
  // - Server-side search and sorting for performance
  const { courses, totalCount, totalPages, pageSize } = await getCoursesPaginated(
    currentPage,
    20,
    searchTerm,
    sortBy,
    sortOrder
  );

  return (
    <>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>
                {totalCount} course{totalCount !== 1 ? 's' : ''} in the system
                {searchTerm && (
                  <> (filtered by "{searchTerm}")</>
                )}
              </CardDescription>
            </div>
            <CoursesSearch />
          </div>
          <div className="flex items-center justify-between">
            <CoursesSort />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <CoursesTable courses={courses} />
        <CoursesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
        />
      </CardContent>
    </>
  );
}

// Loading fallback for Suspense boundary
function CoursesContentSkeleton() {
  return (
    <>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t p-4 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-4">
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9" />
            ))}
          </div>
        </div>
      </CardContent>
    </>
  );
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const searchTerm = params.search || '';
  
  // Validate and set sort parameters
  const validSortFields = ['code', 'title', 'level', 'credits', 'weekly_hours'] as const;
  const sortBy = (validSortFields.includes(params.sortBy as any) 
    ? params.sortBy 
    : 'code') as 'code' | 'title' | 'level' | 'credits' | 'weekly_hours';
  const sortOrder = (params.sortOrder === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  return (
    <CourseDialogProvider>
      <div className="max-w-7xl mx-auto w-full">
        <CoursesHeader />

      {/* Technical Note about Server-Side Pagination */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Server-Side Pagination & Sorting Technique</AlertTitle>
        <AlertDescription>
          This page uses <strong>server-side pagination with URL parameters</strong> for optimal performance. 
          Instead of loading all courses at once, we fetch only 20 courses per page directly from the database. 
          Sorting is also handled server-side for efficiency. This approach keeps the page as a Server Component 
          (faster initial load), makes URLs shareable and bookmarkable, enables browser navigation to work naturally, 
          and significantly reduces memory usage for large datasets. The page also uses <strong>React Suspense</strong> 
          for streaming, showing a loading state while data is being fetched.
        </AlertDescription>
      </Alert>

      <Card>
        <Suspense fallback={<CoursesContentSkeleton />}>
          <CoursesContent 
            currentPage={currentPage} 
            searchTerm={searchTerm}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </Suspense>
      </Card>
      </div>
    </CourseDialogProvider>
  );
}

