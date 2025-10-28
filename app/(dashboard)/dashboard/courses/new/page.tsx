import { CourseForm } from "@/components/course-form";

export default function NewCoursePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Add New Course
        </h1>
        <CourseForm />
      </div>
    </div>
  );
}

