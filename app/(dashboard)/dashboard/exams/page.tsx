import { ExamsTable } from "@/components/exams-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, AlertCircle, Settings } from "lucide-react";
import Link from "next/link";
import { getMockExams, getMockUserRole } from "@/lib/demo-data";
import { redirect } from "next/navigation";

export default async function ExamsPage() {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
    redirect("/dashboard");
  }

  // DEMO MODE: Use mock data
  const exams = await getMockExams();
  const error = null;
  
  // Mock conflicts for demo
  const conflicts: Record<string, { has_conflicts: boolean }> = {};
  exams.forEach(exam => {
    conflicts[exam.id] = { has_conflicts: false }; // No conflicts in demo
  });
  
  // Mock current semester for demo
  const currentSemester = {
    name: "Fall 2024",
    code: "2024-FALL",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground mt-2">
            Manage exam schedules and check for conflicts
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Current Semester: <span className="font-medium">{currentSemester.name}</span> ({currentSemester.code}) (Demo Mode)
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

