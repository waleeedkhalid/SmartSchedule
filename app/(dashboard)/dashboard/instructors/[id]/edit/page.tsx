import { InstructorForm } from "@/components/instructor-form";
import { getMockInstructor } from "@/lib/demo-data";
import { notFound } from "next/navigation";

export default async function EditInstructorPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const instructor = await getMockInstructor(id);
  
  if (!instructor) {
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

