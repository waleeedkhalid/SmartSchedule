import { SectionForm } from "@/components/section-form";
import { getSectionById } from "@/lib/db/sections";
import { getCourses } from "@/lib/db/courses";
import { getInstructors } from "@/lib/db/instructors";
import { getRooms } from "@/lib/db/rooms";
import { notFound } from "next/navigation";

export default async function EditSectionPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  try {
    const [section, courses, instructors, rooms] = await Promise.all([
      getSectionById(id),
      getCourses(),
      getInstructors(),
      getRooms(),
    ]);
    
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Section
          </h1>
          <SectionForm 
            section={section} 
            courses={courses} 
            instructors={instructors} 
            rooms={rooms} 
            isEditing 
          />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

