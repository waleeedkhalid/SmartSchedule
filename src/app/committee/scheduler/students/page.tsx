import { Metadata } from "next";
import { StudentManagementPage } from "@/components/committee/scheduler/student-management-v2";

export const metadata: Metadata = {
  title: "Student Management | SmartSchedule",
  description: "Manage students, enrollments, and irregular cases",
};

/**
 * Student Management Route
 * Committee interface for managing students
 */
export default function SchedulerStudentsPage() {
  return <StudentManagementPage />;
}

