"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseCatalogGrid } from "./CourseCatalogGrid";
import { SectionManagementTable } from "./SectionManagementTable";
import {
  mockCourses,
  mockSections,
} from "@/lib/mock-data/scheduler-data";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * Course and Section Management Page
 * Main component for managing courses and their sections
 * 
 * Features:
 * - Course catalog with filters
 * - Section management for each course
 * - Quick actions for CRUD operations
 * 
 * TODO: Replace mock data with actual API calls when backend is ready
 */
export function CourseAndSectionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourseCode, setSelectedCourseCode] = useState<string | null>(
    null
  );

  // Filter sections by selected course
  const selectedCourseSections = selectedCourseCode
    ? mockSections.filter((s) => s.course_code === selectedCourseCode)
    : [];

  const selectedCourse = mockCourses.find(
    (c) => c.course_code === selectedCourseCode
  );

  // Course Handlers
  const handleAddCourse = () => {
    toast({
      title: "Add Course",
      description: "Opening course creation form...",
    });
    // TODO: Open dialog with course form
  };

  const handleEditCourse = (courseCode: string) => {
    toast({
      title: "Edit Course",
      description: `Editing course: ${courseCode}`,
    });
    // TODO: Open dialog with course edit form
  };

  const handleDuplicateCourse = (courseCode: string) => {
    toast({
      title: "Duplicate Course",
      description: `Creating duplicate of: ${courseCode}`,
    });
    // TODO: Implement duplicate logic
  };

  const handleDeleteCourse = (courseCode: string) => {
    toast({
      title: "Delete Course",
      description: `Course ${courseCode} will be deleted`,
      variant: "destructive",
    });
    // TODO: Implement delete with confirmation
  };

  const handleManageSections = (courseCode: string) => {
    setSelectedCourseCode(courseCode);
    setActiveTab("sections");
  };

  // Section Handlers
  const handleAddSection = () => {
    toast({
      title: "Add Section",
      description: "Opening section creation form...",
    });
    // TODO: Open dialog with section form
  };

  const handleEditSection = (sectionId: string) => {
    toast({
      title: "Edit Section",
      description: `Editing section: ${sectionId}`,
    });
    // TODO: Open dialog with section edit form
  };

  const handleDuplicateSection = (sectionId: string) => {
    toast({
      title: "Duplicate Section",
      description: `Creating duplicate of section`,
    });
    // TODO: Implement duplicate logic
  };

  const handleDeleteSection = (sectionId: string) => {
    toast({
      title: "Delete Section",
      description: `Section will be deleted`,
      variant: "destructive",
    });
    // TODO: Implement delete with confirmation
  };

  const handleBackToCourses = () => {
    setSelectedCourseCode(null);
    setActiveTab("courses");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Back to Dashboard Button */}
      <Link href="/committee/scheduler/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">Course Catalog</TabsTrigger>
          <TabsTrigger value="sections" disabled={!selectedCourseCode}>
            Section Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <CourseCatalogGrid
            courses={mockCourses}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDuplicateCourse={handleDuplicateCourse}
            onDeleteCourse={handleDeleteCourse}
            onManageSections={handleManageSections}
          />
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          {selectedCourse && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToCourses}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Courses
              </Button>
              <SectionManagementTable
                sections={selectedCourseSections}
                courseCode={selectedCourse.course_code}
                courseName={selectedCourse.course_name}
                onAddSection={handleAddSection}
                onEditSection={handleEditSection}
                onDuplicateSection={handleDuplicateSection}
                onDeleteSection={handleDeleteSection}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

