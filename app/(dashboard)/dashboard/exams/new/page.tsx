import { ExamForm } from "@/components/exam-form";
import { getMockCourses, getMockRooms, getMockUserRole } from "@/lib/demo-data";
import { redirect } from "next/navigation";

export default async function NewExamPage() {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
    redirect("/dashboard");
  }

  const courses = await getMockCourses();
  const rooms = await getMockRooms();

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

