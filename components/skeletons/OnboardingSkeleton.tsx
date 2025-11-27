import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface OnboardingSkeletonProps {
  role?: 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar';
}

export const OnboardingSkeleton = ({ role = 'student' }: OnboardingSkeletonProps) => {
  const isStudent = role === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            {/* Icon skeleton */}
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Student Academic Level Section */}
          {isStudent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              
              {/* Level Selector */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>
              
              {/* Program Selector */}
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-56" />
              </div>
              
              {/* Info Box */}
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          )}
          
          {/* Summary Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            
            {/* Summary Box */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              {isStudent ? (
                <>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              )}
            </div>
            
            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-3 pt-2">
              <Skeleton className="h-4 w-4 rounded mt-1" />
              <Skeleton className="h-4 w-64 flex-1" />
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

