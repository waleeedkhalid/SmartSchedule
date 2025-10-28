import { StudentGroupForm } from "@/components/student-group-form";
import { getStudentGroupById } from "@/lib/db/student-groups";
import { notFound } from "next/navigation";

export default async function EditStudentGroupPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  try {
    const group = await getStudentGroupById(id);
    
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Student Group
          </h1>
          <StudentGroupForm group={group} isEditing />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

