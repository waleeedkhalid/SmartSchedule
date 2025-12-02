import { ExamsTable } from "@/components/exams-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllExams, type Exam } from "@/lib/data/exams";
import { getServerUser } from "@/lib/server-auth";
import { createClient } from "@/supabase/server";

export default async function ExamsPage() {
  // Check authentication and role
  const user = await getServerUser();

  if (!user || !['scheduling', 'registrar'].includes(user.role)) {
    redirect("/dashboard");
  }

  // Fetch exams from database with error handling
  let exams: Exam[] = [];
  let error: string | null = null;

  try {
    exams = await getAllExams();
  } catch (err) {
    console.error("Error fetching exams:", err);
    error = err instanceof Error ? err.message : "Failed to fetch exams. Please try again later.";
  }

  // Get current term info
  const supabase = await createClient();
  const { data: currentTerm } = await supabase
    .from("academic_term")
    .select("name, code")
    .in("status", ["draft", "released"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const currentSemester = currentTerm ? {
    name: currentTerm.name || "Current Term",
    code: currentTerm.code || "",
  } : {
    name: "No Active Term",
    code: "",
  };

  // Mock conflicts for demo (TODO: implement real conflict checking)
  const conflicts: Record<string, { has_conflicts: boolean }> = {};
  exams.forEach(exam => {
    conflicts[exam.id] = { has_conflicts: false };
  });

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

