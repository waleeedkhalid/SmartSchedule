import { CourseForm } from "@/components/course-form";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function EditCoursePage({ params }: { params: { code: string } }) {
  const { code } = await params;
  const supabase = await createClient();
  
  const { data: course, error } = await supabase
    .from("course")
    .select("*")
    .eq("code", code)
    .single();
  
  if (error || !course) {
    notFound();
  }
  
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Edit Course
        </h1>
        <CourseForm course={course} isEditing />
      </div>
    </div>
  );
}

