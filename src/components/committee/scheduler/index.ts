// Component exports for scheduler committee
export { CourseManagementClient } from "./CourseManagementClient";
export { CourseList } from "./CourseList";
export { CourseForm } from "./CourseForm";
export { SectionManager } from "./SectionManager";
export { ExternalCourseViewer } from "./ExternalCourseViewer";
export { GenerateScheduleDialog } from "./GenerateScheduleDialog";
export { GeneratedScheduleResults } from "./GeneratedScheduleResults";
export { CourseEditor } from "./CourseEditor";
export { SchedulePreviewer } from "./SchedulePreviewer";
export { SectionEnrollmentManager } from "./SectionEnrollmentManager";
export { ExamTable } from "./ExamTable";
export { ExamTableViewOnly } from "./ExamTableViewOnly";
export { VersionTimeline } from "./VersionTimeline";

// Phase 4: Schedule Generation Components
export { GenerationProgress } from "./GenerationProgress";

// Phase 5: Conflict Detection & Resolution Components
export { ConflictResolver } from "./ConflictResolver";
export { ConflictResolutionDialog } from "./ConflictResolutionDialog";

// Phase 7: Exam Scheduling Components
export { ExamCalendar } from "./ExamCalendar";
export { ExamConflictChecker } from "./ExamConflictChecker";

// Re-export sub-modules
export * as studentCounts from "./student-counts";
export * as irregularStudents from "./irregular-students";
export * as coursesEditor from "./courses-editor";
export * as rules from "./rules";
