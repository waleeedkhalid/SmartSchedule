// Navigation configurations for each persona
// Defines routes and navigation items for Committee, Student, Faculty, and Registrar

import {
  Calendar,
  FileText,
  CheckSquare,
  Clock,
  GitBranch,
  Star,
  GraduationCap,
  MessageSquare,
  BarChart3,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { NavItem } from "./PersonaNavigation";

// ============================================================================
// SCHEDULING COMMITTEE NAVIGATION
// ============================================================================

export const committeeNavItems: NavItem[] = [
  {
    label: "Students Counts",
    href: "/demo/committee/scheduler",
    icon: Calendar,
    description: "View and manage student counts for each course",
  },
  {
    label: "Exams",
    href: "/demo/committee/scheduler/exams",
    icon: FileText,
    description: "Schedule midterm and final exams",
  },
  {
    label: "Rules & Conflicts",
    href: "/demo/committee/scheduler/rules",
    icon: CheckSquare,
    description: "Configure scheduling rules and view conflicts",
  },
  {
    label: "Courses Editor",
    href: "/demo/committee/scheduler/courses",
    icon: Clock,
    description: "Manage SWE and external department course offerings",
  },
  {
    label: "Versions",
    href: "/demo/committee/scheduler/versions",
    icon: GitBranch,
    description: "View schedule version history and changes",
  },
];

// ============================================================================
// TEACHING LOAD COMMITTEE NAVIGATION
// ============================================================================

export const teachingLoadNavItems: NavItem[] = [
  {
    label: "Load Overview",
    href: "/demo/committee/teaching-load",
    icon: BarChart3,
    description: "Review instructor teaching loads",
  },
  {
    label: "Conflicts",
    href: "/demo/committee/teaching-load/conflicts",
    icon: CheckSquare,
    description: "View instructor time conflicts and overloads",
  },
  {
    label: "Suggestions",
    href: "/demo/committee/teaching-load/suggestions",
    icon: MessageSquare,
    description: "Review and approve load adjustment suggestions",
  },
];

// ============================================================================
// REGISTRAR NAVIGATION
// ============================================================================

export const registrarNavItems: NavItem[] = [
  {
    label: "Irregular Students",
    href: "/demo/committee/registrar",
    icon: UserCog,
    description: "Manage irregular student course requirements",
  },
];

// ============================================================================
// STUDENT NAVIGATION
// ============================================================================

export const studentNavItems: NavItem[] = [
  {
    label: "My Schedule",
    href: "/demo/student",
    icon: Calendar,
    description: "View your course schedule and exams",
  },
  {
    label: "Elective Preferences",
    href: "/demo/student/preferences",
    icon: Star,
    description: "Rank your elective course preferences",
  },
  {
    label: "Feedback",
    href: "/demo/student/feedback",
    icon: MessageSquare,
    description: "Provide feedback on the schedule",
  },
];

// ============================================================================
// FACULTY NAVIGATION
// ============================================================================

export const facultyNavItems: NavItem[] = [
  {
    label: "My Assignments",
    href: "/demo/faculty",
    icon: GraduationCap,
    description: "View your teaching assignments",
  },
  {
    label: "Availability",
    href: "/demo/faculty/availability",
    icon: Clock,
    description: "Set your weekly availability preferences",
  },
  {
    label: "Comments",
    href: "/demo/faculty/comments",
    icon: MessageSquare,
    description: "Provide feedback to the scheduling committee",
  },
];

// ============================================================================
// COMBINED COMMITTEE NAVIGATION (All Committee Roles)
// ============================================================================

export const allCommitteeNavItems: NavItem[] = [
  ...committeeNavItems,
  {
    label: "Teaching Load",
    href: "/demo/committee/teaching-load",
    icon: BarChart3,
    description: "Review instructor loads",
  },
  {
    label: "Registrar",
    href: "/demo/committee/registrar",
    icon: ClipboardList,
    description: "Manage irregular students",
  },
];
