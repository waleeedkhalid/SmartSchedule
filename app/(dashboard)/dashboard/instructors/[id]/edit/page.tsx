import { InstructorForm } from "@/components/instructor-form";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: facultyProfile, error } = await supabase
    .from("faculty_profile")
    .select("*")
    .eq("user_id", id)
    .single();
  
  if (error || !facultyProfile) {
    notFound();
  }
  
  // Map faculty_profile to Instructor type for backward compatibility
  const instructor = {
    ...facultyProfile,
    id: facultyProfile.user_id, // Map user_id to id
  };
  
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

