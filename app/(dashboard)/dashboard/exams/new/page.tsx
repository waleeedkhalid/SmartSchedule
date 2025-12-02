import { ExamForm } from "@/components/exam-form";
import { getAllCourses, getAllRooms } from "@/lib/data/sections-helpers";
import { getServerUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewExamPage() {
  const user = await getServerUser();

  if (!user || !["scheduling", "registrar"].includes(user.role)) {
    redirect("/dashboard");
  }

  const [courses, rooms] = await Promise.all([getAllCourses(), getAllRooms()]);

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
