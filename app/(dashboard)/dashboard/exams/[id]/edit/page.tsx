import { ExamForm } from "@/components/exam-form";
import { getAllCourses, getAllRooms } from "@/lib/data/sections-helpers";
import { getServerUser } from "@/lib/server-auth";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditExamPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getServerUser();

  if (!user || !['scheduling', 'registrar'].includes(user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch exam from database
  const { data: exam, error } = await supabase
    .from("exam")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !exam) {
    notFound();
  }

  const [courses, rooms] = await Promise.all([
    getAllCourses(),
    getAllRooms(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
        <p className="text-muted-foreground mt-2">
          Update exam details and room assignments
        </p>
      </div>

      <ExamForm exam={exam} courses={courses} rooms={rooms} isEditing />
    </div>
  );
}

