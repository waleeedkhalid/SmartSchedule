import { SectionForm } from "@/components/section-form";
import { getAllCourses, getAllInstructors, getAllRooms } from "@/lib/data/sections-helpers";

export default async function NewSectionPage() {
  const [courses, instructors, rooms] = await Promise.all([
    getAllCourses(),
    getAllInstructors(),
    getAllRooms(),
  ]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Add New Section
        </h1>
        <SectionForm courses={courses} instructors={instructors} rooms={rooms} />
      </div>
    </div>
  );
}

