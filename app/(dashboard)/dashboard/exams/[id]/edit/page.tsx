import { ExamForm } from "@/components/exam-form";
import { getExamById } from "@/lib/db/exams";
import { getCourses } from "@/lib/db/courses";
import { getRooms } from "@/lib/db/rooms";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditExamPage({
  params,
}: {
  params: { id: string };
}) {
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

  try {
    const exam = await getExamById(params.id);
    const courses = await getCourses();
    const rooms = await getRooms();

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
  } catch (error) {
    notFound();
  }
}

