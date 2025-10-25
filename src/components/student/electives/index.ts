// Export all elective selection components
export { CourseCard } from "./CourseCard";
export type { CourseCardData } from "./CourseCard";

export { SelectionPanel } from "./SelectionPanel";
export type { SelectedCourse, PackageRequirement } from "./SelectionPanel";

export { ElectiveBrowser } from "./ElectiveBrowser";
export type { ElectiveBrowserProps, ElectivePackage, ElectiveCourse } from "./ElectiveBrowser";

export { ElectiveSurvey } from "./ElectiveSurvey";
export type { ElectiveSurveyProps } from "./ElectiveSurvey";

export { DraftStatusIndicator } from "./DraftStatusIndicator";
export { SubmitConfirmationDialog } from "./SubmitConfirmationDialog";
export { useDraftAutoSave } from "./use-draft-autosave";
export type { AutoSaveStatus } from "./use-draft-autosave";
