import { ExamsTable } from "@/components/exams-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";
import { getExams, getAllExamConflicts } from "@/lib/db/exams";
import { getCurrentSemester } from "@/lib/db/semesters";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // Only scheduling and registrar roles can access this page
  if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
    redirect("/dashboard");
  }

  // Check if current semester exists
  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
            <p className="text-muted-foreground mt-2">
              Manage exam schedules and check for conflicts
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Semester Required</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">
              Exams require a current semester to be set. Please initialize a semester first.
            </p>
            <Button asChild size="sm">
              <Link href="/dashboard/setup">
                <Settings className="mr-2 h-4 w-4" />
                Go to Setup
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch exams for current semester
  let exams = [];
  let error = null;
  
  try {
    exams = await getExams(currentSemester.id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load exams';
  }
  
  // Get conflicts for all exams
  const conflicts: Record<string, { has_conflicts: boolean }> = {};
  if (!error) {
    try {
      const conflictsData = await getAllExamConflicts(currentSemester.id);
      if (conflictsData) {
        for (const item of conflictsData) {
          if (item.exam_id && item.conflicts) {
            conflicts[item.exam_id] = {
              has_conflicts: item.conflicts.has_conflicts || false
            };
          }
        }
      }
    } catch (err) {
      console.error('Failed to load exam conflicts:', err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground mt-2">
            Manage exam schedules and check for conflicts
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Current Semester: <span className="font-medium">{currentSemester.name}</span> ({currentSemester.code})
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Exam
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ExamsTable exams={exams} conflicts={conflicts} />
    </div>
  );
}

