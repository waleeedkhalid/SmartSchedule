import { InstructorForm } from "@/components/instructor-form";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: instructor, error } = await supabase
    .from("instructor")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error || !instructor) {
    notFound();
  }
  
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Edit Instructor
        </h1>
        <InstructorForm instructor={instructor} isEditing />
      </div>
    </div>
  );
}

