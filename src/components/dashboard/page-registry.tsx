import type { ComponentType } from "react";

import {
  CommitteeConflictReview,
  CommitteeFeedback,
  FacultyAvailability,
  FacultyCoursePreferences,
  RegistrarIrregularEntry,
  SchedulerDrafts,
  SchedulerRules,
  SchedulerVersions,
  StudentElectivePreferences,
  StudentMySchedule,
} from "./pages";
import type { RoleKey } from "@/types/dashboard";

export type RolePageComponent = ComponentType<unknown>;

export const rolePageRegistry: Record<RoleKey, Record<string, RolePageComponent>> = {
  student: {
    "elective-preferences": StudentElectivePreferences,
    "my-schedule": StudentMySchedule,
  },
  faculty: {
    availability: FacultyAvailability,
    "course-preferences": FacultyCoursePreferences,
  },
  scheduler: {
    rules: SchedulerRules,
    drafts: SchedulerDrafts,
    versions: SchedulerVersions,
  },
  registrar: {
    "irregular-entry": RegistrarIrregularEntry,
  },
  committee: {
    feedback: CommitteeFeedback,
    "conflict-review": CommitteeConflictReview,
  },
};
