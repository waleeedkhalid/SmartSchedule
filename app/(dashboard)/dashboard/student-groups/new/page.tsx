import { StudentGroupForm } from "@/components/student-group-form";

export default function NewStudentGroupPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Add New Student Group
        </h1>
        <StudentGroupForm />
      </div>
    </div>
  );
}

