import { SectionsTable } from "@/components/sections-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionDialogProvider } from "@/components/sections-client";
import { SectionsHeader } from "@/components/sections-header";
import { getAllCourses, getAllInstructors, getAllRooms, getAllSections } from "@/lib/data/sections-helpers";
import { createClient } from "@/supabase/server";
import { ClientOnly } from "@/components/client-only";
import { ScheduleCollaborationWrapper } from "@/components/schedule-collaboration-wrapper";

export default async function SectionsPage() {
  // Fetch sections from database
  const sections = await getAllSections();

  // Get current term info
  const supabase = await createClient();
  const { data: currentTerm } = await supabase
    .from("academic_term")
    .select("name, code")
    .in("status", ["draft", "released"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const currentSemester = currentTerm ? {
    name: currentTerm.name || "Current Term",
    code: currentTerm.code || "",
  } : {
    name: "No Active Term",
    code: "",
  };

  // Fetch courses, instructors, and rooms from database
  const [coursesForDialog, instructorsForDialog, roomsForDialog] = await Promise.all([
    getAllCourses(),
    getAllInstructors(),
    getAllRooms(),
  ]);

  return (
    <SectionDialogProvider
      courses={coursesForDialog}
      instructors={instructorsForDialog}
      rooms={roomsForDialog}
    >
      <div className="max-w-7xl mx-auto w-full">
        <SectionsHeader />

        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          Current Semester: <span className="font-medium">{currentSemester.name}</span> ({currentSemester.code})
        </p>

        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <CardDescription>
              {sections.length} section{sections.length !== 1 ? 's' : ''} in {currentSemester.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientOnly
              fallback={
                <div className="h-32 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading collaboration features...</p>
                </div>
              }
            >
              <ScheduleCollaborationWrapper initialStatus={{ draft: { total: sections.length, assigned: 0, unassigned: 0 }, released: { total: 0 } }}>
                <SectionsTable sections={sections} />
              </ScheduleCollaborationWrapper>
            </ClientOnly>
          </CardContent>
        </Card>
      </div>
    </SectionDialogProvider>
  );
}

