import { ExamsTable } from "@/components/exams-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getExams, getAllExamConflicts } from "@/lib/db/exams";
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

  const exams = await getExams();
  
  // Get conflicts for all exams
  const conflictsData = await getAllExamConflicts();
  const conflicts: Record<string, { has_conflicts: boolean }> = {};
  if (conflictsData) {
    for (const item of conflictsData) {
      if (item.exam_id && item.conflicts) {
        conflicts[item.exam_id] = {
          has_conflicts: item.conflicts.has_conflicts || false
        };
      }
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
        </div>
        <Button asChild>
          <Link href="/dashboard/exams/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Exam
          </Link>
        </Button>
      </div>

      <ExamsTable exams={exams} conflicts={conflicts} />
    </div>
  );
}

