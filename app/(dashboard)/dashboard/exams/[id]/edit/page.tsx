import { ExamForm } from "@/components/exam-form";
import { getMockExam, getMockCourses, getMockRooms, getMockUserRole } from "@/lib/demo-data";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

export default async function EditExamPage({
  params,
}: {
  params: { id: string };
}) {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole || !['scheduling', 'registrar'].includes(userRole.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [exam, courses, rooms] = await Promise.all([
    getMockExam(id),
    getMockCourses(),
    getMockRooms(),
  ]);

  if (!exam) {
    notFound();
  }

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

