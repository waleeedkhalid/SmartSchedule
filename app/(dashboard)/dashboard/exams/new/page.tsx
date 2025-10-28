import { ExamForm } from "@/components/exam-form";
import { getCourses } from "@/lib/db/courses";
import { getRooms } from "@/lib/db/rooms";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function NewExamPage() {
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

  const courses = await getCourses();
  const rooms = await getRooms();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
        <p className="text-muted-foreground mt-2">
          Schedule a new exam and assign rooms
        </p>
      </div>

      <ExamForm courses={courses} rooms={rooms} />
    </div>
  );
}

