import { SectionForm } from "@/components/section-form";
import { getCourses } from "@/lib/db/courses";
import { getInstructors } from "@/lib/db/instructors";
import { getRooms } from "@/lib/db/rooms";

export default async function NewSectionPage() {
  const [courses, instructors, rooms] = await Promise.all([
    getCourses(),
    getInstructors(),
    getRooms(),
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

