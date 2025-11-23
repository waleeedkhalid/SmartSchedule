import { SectionForm } from "@/components/section-form";
import { getMockSection, getMockCourses, getMockInstructors, getMockRooms } from "@/lib/demo-data";
import { notFound } from "next/navigation";

export default async function EditSectionPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const [section, courses, instructors, rooms] = await Promise.all([
    getMockSection(id),
    getMockCourses(),
    getMockInstructors(),
    getMockRooms(),
  ]);
  
  if (!section) {
    notFound();
  }
  
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
}

