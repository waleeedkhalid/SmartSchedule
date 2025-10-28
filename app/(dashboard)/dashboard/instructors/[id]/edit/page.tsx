import { InstructorForm } from "@/components/instructor-form";
import { getInstructorById } from "@/lib/db/instructors";
import { notFound } from "next/navigation";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  try {
    const instructor = await getInstructorById(id);
    
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
  } catch (error) {
    notFound();
  }
}

