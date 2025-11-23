import { StudentGroupForm } from "@/components/student-group-form";
import { getMockStudentGroupById } from "@/lib/demo-data";
import { notFound } from "next/navigation";

export default async function EditStudentGroupPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const group = await getMockStudentGroupById(id);
  
  if (!group) {
    notFound();
  }
  
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
}

