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

  if (!user || !["scheduling", "registrar"].includes(user.role)) {
    redirect("/dashboard");
  }

  // Fetch exams from database with error handling
  let exams: Exam[] = [];
  let error: string | null = null;

  try {
    exams = await getAllExams();
  } catch (err) {
    console.error("Error fetching exams:", err);
    error =
      err instanceof Error
        ? err.message
        : "Failed to fetch exams. Please try again later.";
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

  const currentSemester = currentTerm
    ? {
        name: currentTerm.name || "Current Term",
        code: currentTerm.code || "",
      }
    : {
        name: "No Active Term",
        code: "",
      };

  // Check conflicts for each exam
  // Group exams by date for efficient conflict checking
  const conflicts: Record<string, { has_conflicts: boolean }> = {};

  // Build a map of exams by date for conflict detection
  const examsByDate = new Map<string, Exam[]>();
  exams.forEach((exam) => {
    const date = exam.date;
    if (date) {
      if (!examsByDate.has(date)) {
        examsByDate.set(date, []);
      }
      examsByDate.get(date)!.push(exam);
    }
    conflicts[exam.id] = { has_conflicts: false };
  });

  // Helper function to check if two time ranges overlap
  const timesOverlap = (
    start1: string,
    duration1: number,
    start2: string,
    duration2: number
  ): boolean => {
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const start1Min = toMinutes(start1);
    const end1Min = start1Min + duration1;
    const start2Min = toMinutes(start2);
    const end2Min = start2Min + duration2;
    return start1Min < end2Min && start2Min < end1Min;
  };

  // Check for conflicts (room overlaps and potential student conflicts)
  for (const [, dateExams] of examsByDate) {
    for (let i = 0; i < dateExams.length; i++) {
      for (let j = i + 1; j < dateExams.length; j++) {
        const exam1 = dateExams[i];
        const exam2 = dateExams[j];

        // Check if times overlap
        if (
          exam1.start_time &&
          exam2.start_time &&
          exam1.duration_minutes &&
          exam2.duration_minutes
        ) {
          const overlap = timesOverlap(
            exam1.start_time,
            exam1.duration_minutes,
            exam2.start_time,
            exam2.duration_minutes
          );

          if (overlap) {
            // Check for room conflicts
            const rooms1 = new Set(exam1.room_codes || []);
            const rooms2 = exam2.room_codes || [];
            const hasRoomConflict = rooms2.some((room) => rooms1.has(room));

            if (hasRoomConflict) {
              conflicts[exam1.id] = { has_conflicts: true };
              conflicts[exam2.id] = { has_conflicts: true };
            }
          }
        }
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
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Current Semester:{" "}
            <span className="font-medium">{currentSemester.name}</span> (
            {currentSemester.code})
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
