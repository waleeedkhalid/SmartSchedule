import {
  CalendarCheck,
  ClipboardList,
  FolderGit2,
  Layers,
  ListChecks,
  NotebookPen,
  PanelLeft,
  ScrollText,
  ShieldAlert,
  Users,
} from "lucide-react";

import type {
  RoleDefinition,
  RoleKey,
  RolePageDefinition,
} from "@/types/dashboard";

export const defaultRole: RoleKey = "student";

export const roleDefinitions: RoleDefinition[] = [
  {
    key: "student",
    label: "Student",
    description: "Track electives and personal timetable.",
    defaultPage: "elective-preferences",
    pages: [
      {
        slug: "elective-preferences",
        title: "Elective Preferences",
        description: "Rank electives and submit scheduling priorities.",
        icon: ListChecks,
        testId: "nav-student-elective",
      },
      {
        slug: "my-schedule",
        title: "My Schedule",
        description: "Weekly timetable with conflicts and export tools.",
        icon: CalendarCheck,
        testId: "nav-student-schedule",
      },
    ],
  },
  {
    key: "faculty",
    label: "Faculty",
    description: "Capture availability and preferences for teaching.",
    defaultPage: "availability",
    pages: [
      {
        slug: "availability",
        title: "Availability",
        description: "Select weekly availability windows for assignments.",
        icon: PanelLeft,
        testId: "nav-faculty-availability",
      },
      {
        slug: "course-preferences",
        title: "Course Preferences",
        description: "Prioritize preferred courses and add teaching notes.",
        icon: NotebookPen,
        testId: "nav-faculty-preferences",
      },
    ],
  },
  {
    key: "scheduler",
    label: "Scheduler",
    description: "Manage rules, drafts, and schedule versions.",
    defaultPage: "rules",
    pages: [
      {
        slug: "rules",
        title: "Rules",
        description: "Define scheduling rules, conditions, and priorities.",
        icon: ClipboardList,
        testId: "nav-scheduler-rules",
      },
      {
        slug: "drafts",
        title: "Drafts",
        description: "Track draft schedules and compare iterations.",
        icon: FolderGit2,
        testId: "nav-scheduler-drafts",
      },
      {
        slug: "versions",
        title: "Versions",
        description: "Review historical versions and publish updates.",
        icon: Layers,
        testId: "nav-scheduler-versions",
      },
    ],
  },
  {
    key: "registrar",
    label: "Registrar",
    description: "Manage irregular student entries and overrides.",
    defaultPage: "irregular-entry",
    pages: [
      {
        slug: "irregular-entry",
        title: "Irregular Student Entry",
        description: "Capture exceptions and override placements.",
        icon: ScrollText,
        testId: "nav-registrar-irregular",
      },
    ],
  },
  {
    key: "committee",
    label: "Teaching Load Committee",
    description: "Monitor feedback and resolve conflicts.",
    defaultPage: "feedback",
    pages: [
      {
        slug: "feedback",
        title: "Feedback",
        description: "Review queue of feedback with severity and owners.",
        icon: Users,
        testId: "nav-committee-feedback",
      },
      {
        slug: "conflict-review",
        title: "Conflict Review",
        description: "Resolve escalated conflicts across schedules.",
        icon: ShieldAlert,
        testId: "nav-committee-conflicts",
      },
    ],
  },
];

export const roleMap: Record<RoleKey, RoleDefinition> = roleDefinitions.reduce(
  (acc, role) => {
    acc[role.key] = role;
    return acc;
  },
  {} as Record<RoleKey, RoleDefinition>
);

export const pageMap: Record<
  RoleKey,
  Record<string, RolePageDefinition>
> = roleDefinitions.reduce((roleAcc, role) => {
  roleAcc[role.key] = role.pages.reduce((pageAcc, page) => {
    pageAcc[page.slug] = page;
    return pageAcc;
  }, {} as Record<string, RolePageDefinition>);
  return roleAcc;
}, {} as Record<RoleKey, Record<string, RolePageDefinition>>);

export function getDefaultPath(role: RoleKey): string {
  const config = roleMap[role];
  return `/${role}/${
    config?.defaultPage ?? roleDefinitions[0]?.defaultPage ?? ""
  }`;
}

export function getPath(role: RoleKey, slug: string): string {
  return `/${role}/${slug}`;
}

export function constructBreadcrumbSegments(role: RoleKey, page?: string) {
  const roleConfig = roleMap[role];
  const pageConfig = page ? pageMap[role]?.[page] : undefined;
  return [
    {
      href: getDefaultPath(role),
      label: roleConfig?.label ?? "Dashboard",
    },
    pageConfig && {
      href: getPath(role, pageConfig.slug),
      label: pageConfig.title,
    },
  ].filter(Boolean) as { href: string; label: string }[];
}

export const allPages = roleDefinitions.flatMap((role) =>
  role.pages.map((page) => ({
    role: role.key,
    page: page.slug,
    title: page.title,
  }))
);

export const smartScheduleTitle = "SmartSchedule";

export const heroSummary =
  "Scheduling operations cockpit for King Saud University.";
