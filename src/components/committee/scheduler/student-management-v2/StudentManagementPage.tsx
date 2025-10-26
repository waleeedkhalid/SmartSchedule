"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { StudentManagementOverview } from "./StudentManagementOverview";
import { StudentListTable } from "./StudentListTable";
import { IrregularStudentsTracker } from "./IrregularStudentsTracker";
import { StudentDetailsDialog } from "./StudentDetailsDialog";
import { RegistrarNotificationDialog } from "./RegistrarNotificationDialog";
import { IrregularStudentCourseDialog } from "./IrregularStudentCourseDialog";
import {
  mockStudentSummary,
  mockStudents,
  mockIrregularStudents,
  mockAcademicTerm,
  mockCourses,
} from "@/lib/mock-data/scheduler-data";
import { useToast } from "@/components/ui/use-toast";

/**
 * Student Management Page
 * Main component for managing students in the scheduler system
 * 
 * Features:
 * - Overview dashboard with statistics
 * - Student list with filters and search
 * - Irregular students tracking
 * 
 * TODO: Replace mock data with actual API calls when backend is ready
 */
export function StudentManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Dialog states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showRegistrarDialog, setShowRegistrarDialog] = useState(false);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingIrregularId, setEditingIrregularId] = useState<string | null>(null);

  // Get selected student data
  const selectedStudent = selectedStudentId
    ? mockStudents.find((s) => s.id === selectedStudentId) || null
    : null;

  const editingIrregular = editingIrregularId
    ? mockIrregularStudents.find((i) => i.id === editingIrregularId)
    : null;

  // Handlers
  const handleViewStudentDetails = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowStudentDetails(true);
  };

  const handleSendNotification = (studentId: string) => {
    toast({
      title: "Notification Sent",
      description: "Email notification has been sent to the student",
    });
    // TODO: Implement notification API call
  };

  const handleMarkIrregular = (studentId: string) => {
    toast({
      title: "Marked as Irregular",
      description: "Student has been marked as irregular. Please add required courses.",
    });
    // TODO: Implement mark irregular API call
  };

  const handleResolveIrregular = (irregularId: string) => {
    toast({
      title: "Case Resolved",
      description: "Irregular student case has been marked as resolved",
    });
    // TODO: Implement resolve API call
  };

  const handleEditIrregularCourses = (irregularId: string, studentId: string) => {
    setEditingIrregularId(irregularId);
    setSelectedStudentId(studentId);
    setShowCourseDialog(true);
  };

  const handleSaveCourses = (
    selectedCourses: string[],
    externalCourses: string[]
  ) => {
    const allCourses = [...selectedCourses, ...externalCourses];
    toast({
      title: "Courses Updated",
      description: `${allCourses.length} courses saved for irregular student`,
    });
    // TODO: Implement save courses API call
  };

  const handleRequestFromRegistrar = () => {
    setShowRegistrarDialog(true);
  };

  const handleSendRegistrarRequest = (message: string) => {
    toast({
      title: "Request Sent to Registrar",
      description: "The Registrar has been notified and will provide irregular student updates.",
    });
    // TODO: Implement registrar notification API call
  };

  const handleConfirmNoIrregular = () => {
    toast({
      title: "Confirmation Recorded",
      description: "Confirmed with Registrar: No irregular students this term.",
    });
    // TODO: Implement confirmation API call
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student List</TabsTrigger>
          <TabsTrigger value="irregular">
            Irregular Students
            {mockIrregularStudents.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                {mockIrregularStudents.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <StudentManagementOverview
            summary={mockStudentSummary}
            termName={mockAcademicTerm.name}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentListTable
            students={mockStudents}
            onViewDetails={handleViewStudentDetails}
            onSendNotification={handleSendNotification}
          />
        </TabsContent>

        <TabsContent value="irregular" className="space-y-4">
          <IrregularStudentsTracker
            irregularStudents={mockIrregularStudents}
            onNotifyStudent={handleSendNotification}
            onResolve={handleResolveIrregular}
            onViewDetails={handleViewStudentDetails}
            onEditCourses={handleEditIrregularCourses}
            onRequestFromRegistrar={handleRequestFromRegistrar}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StudentDetailsDialog
        student={selectedStudent}
        open={showStudentDetails}
        onOpenChange={setShowStudentDetails}
        onSendNotification={handleSendNotification}
        onMarkIrregular={handleMarkIrregular}
      />

      <RegistrarNotificationDialog
        open={showRegistrarDialog}
        onOpenChange={setShowRegistrarDialog}
        irregularStudentCount={mockIrregularStudents.length}
        onSendRequest={handleSendRegistrarRequest}
        onConfirmNoIrregular={handleConfirmNoIrregular}
      />

      {editingIrregular && selectedStudent && (
        <IrregularStudentCourseDialog
          open={showCourseDialog}
          onOpenChange={setShowCourseDialog}
          studentName={selectedStudent.full_name}
          studentNumber={selectedStudent.student_number}
          onSave={handleSaveCourses}
          sweCourses={mockCourses}
          initialSelectedCourses={editingIrregular.courses_needed}
        />
      )}
    </div>
  );
}

