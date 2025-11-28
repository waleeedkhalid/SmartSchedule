import { SectionForm } from "@/components/section-form";
import { getAllCourses, getAllInstructors, getAllRooms } from "@/lib/data/sections-helpers";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Fetch section from database
  const { data: sectionData, error } = await supabase
    .from("section")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error || !sectionData) {
    notFound();
  }
  
  // Transform section data to match expected format
  // Include all required properties from Database["public"]["Tables"]["section"]["Row"]
  const section = {
    id: sectionData.id,
    course_code: sectionData.course_code,
    section_no: sectionData.section_no,
    instructor_id: sectionData.instructor_id,
    room_code: sectionData.room_code,
    capacity: sectionData.capacity,
    meeting_pattern: sectionData.meeting_pattern as {
      days: string[];
      start: string;
      duration: number;
    },
    group_level: sectionData.group_level,
    state: sectionData.state as 'draft' | 'released',
    activity: sectionData.activity || null,
    created_at: sectionData.created_at,
    created_by: sectionData.created_by,
    updated_at: sectionData.updated_at,
  };
  
  const [courses, instructors, rooms] = await Promise.all([
    getAllCourses(),
    getAllInstructors(),
    getAllRooms(),
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
}

