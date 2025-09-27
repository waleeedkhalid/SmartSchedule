import type { RoleKey } from "@/types/dashboard";

export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday";

export const daysOfWeek: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

export type TimeBlock = {
  label: string;
  start: string;
  end: string;
};

export const timeBlocks: TimeBlock[] = Array.from(
  { length: 14 },
  (_, index) => {
    const startHour = 8 + index;
    const endHour = startHour + 1;
    const format = (hour: number) => `${hour.toString().padStart(2, "0")}:00`;
    return {
      label: `${format(startHour)} – ${format(endHour)}`,
      start: format(startHour),
      end: format(endHour),
    };
  }
);

type Elective = {
  id: string;
  code: string;
  title: string;
  credits: number;
  faculty: string;
  category:
    | "Innovation"
    | "Leadership"
    | "Data"
    | "Sustainability"
    | "Entrepreneurship"
    | "Design";
  seats: number;
  tags: string[];
};

export const electiveCatalog: Elective[] = [
  {
    id: "ELEC-401",
    code: "ENGR 431",
    title: "Design Thinking Studio",
    credits: 3,
    faculty: "Dr. Amal Al-Saud",
    category: "Design",
    seats: 24,
    tags: ["collaborative", "studio", "prototyping"],
  },
  {
    id: "ELEC-402",
    code: "COMP 445",
    title: "Applied Machine Intelligence",
    credits: 3,
    faculty: "Prof. Yusuf Al-Mutairi",
    category: "Data",
    seats: 32,
    tags: ["python", "capstone", "ai"],
  },
  {
    id: "ELEC-403",
    code: "MGMT 421",
    title: "Innovation Incubator",
    credits: 2,
    faculty: "Dr. Rania Al-Harbi",
    category: "Entrepreneurship",
    seats: 18,
    tags: ["startup", "pitch", "mentorship"],
  },
  {
    id: "ELEC-404",
    code: "STAT 416",
    title: "Data Visualization for Policy",
    credits: 3,
    faculty: "Dr. Omar Al-Qahtani",
    category: "Data",
    seats: 28,
    tags: ["tableau", "policy", "analytics"],
  },
  {
    id: "ELEC-405",
    code: "ENVR 409",
    title: "Sustainable Systems Lab",
    credits: 4,
    faculty: "Prof. Nora Al-Fayez",
    category: "Sustainability",
    seats: 20,
    tags: ["field", "simulation", "impact"],
  },
  {
    id: "ELEC-406",
    code: "LEAD 430",
    title: "Leadership for Change",
    credits: 3,
    faculty: "Dr. Ibrahim Al-Rajhi",
    category: "Leadership",
    seats: 30,
    tags: ["coaching", "reflection", "team"],
  },
];

export type RankedElective = Elective & { rank: number; submitted?: boolean };

export const initialElectiveRanking: RankedElective[] = electiveCatalog.map(
  (course, index) => ({
    ...course,
    rank: index + 1,
  })
);

export type ScheduleEvent = {
  id: string;
  course: string;
  title: string;
  location: string;
  instructor: string;
  day: DayOfWeek;
  start: string;
  end: string;
  type: "Lecture" | "Lab" | "Seminar" | "Tutorial" | "Studio";
  conflict?: {
    level: "warning" | "critical";
    note: string;
  };
};

export const studentSchedule: ScheduleEvent[] = [
  {
    id: "EVT-101",
    course: "COMP 445",
    title: "Applied Machine Intelligence",
    location: "Innovation Hub 204",
    instructor: "Prof. Yusuf Al-Mutairi",
    day: "Sunday",
    start: "09:00",
    end: "10:30",
    type: "Lecture",
  },
  {
    id: "EVT-102",
    course: "ENGR 431",
    title: "Design Thinking Studio",
    location: "Design Lab 3A",
    instructor: "Dr. Amal Al-Saud",
    day: "Sunday",
    start: "11:00",
    end: "13:00",
    type: "Studio",
    conflict: {
      level: "warning",
      note: "Overlaps with advising hours by 15 minutes",
    },
  },
  {
    id: "EVT-103",
    course: "STAT 416",
    title: "Data Visualization for Policy",
    location: "Analytics Center 120",
    instructor: "Dr. Omar Al-Qahtani",
    day: "Monday",
    start: "10:00",
    end: "11:30",
    type: "Lecture",
  },
  {
    id: "EVT-104",
    course: "COMP 445",
    title: "Applied Machine Intelligence Lab",
    location: "AI Lab 5",
    instructor: "Assistant Eng. Maha Al-Dossary",
    day: "Tuesday",
    start: "14:00",
    end: "16:00",
    type: "Lab",
    conflict: {
      level: "critical",
      note: "Labs share hardware with another reserved section",
    },
  },
  {
    id: "EVT-105",
    course: "LEAD 430",
    title: "Leadership for Change",
    location: "Leadership Center 404",
    instructor: "Dr. Ibrahim Al-Rajhi",
    day: "Wednesday",
    start: "08:30",
    end: "10:00",
    type: "Seminar",
  },
  {
    id: "EVT-106",
    course: "ENVR 409",
    title: "Sustainable Systems Lab",
    location: "Sustainability Studio",
    instructor: "Prof. Nora Al-Fayez",
    day: "Thursday",
    start: "12:00",
    end: "15:00",
    type: "Lab",
  },
];

export type FacultyAvailabilitySlot = {
  day: DayOfWeek;
  start: string;
  end: string;
  available: boolean;
};

export const facultyAvailabilityTemplate: FacultyAvailabilitySlot[] =
  daysOfWeek.flatMap((day) =>
    timeBlocks.map((block) => ({
      day,
      start: block.start,
      end: block.end,
      available: ["Sunday", "Monday", "Wednesday"].includes(day)
        ? block.start >= "09:00" && block.end <= "16:00"
        : block.start >= "10:00" && block.end <= "14:00",
    }))
  );

type FacultyPreference = {
  id: string;
  course: string;
  title: string;
  priority: number;
  mode: "In-person" | "Hybrid" | "Online";
  notes: string;
};

export const facultyPreferences: FacultyPreference[] = [
  {
    id: "FAC-P1",
    course: "COMP 342",
    title: "Algorithms II",
    priority: 1,
    mode: "In-person",
    notes: "Prefer morning sections to align with research blocks.",
  },
  {
    id: "FAC-P2",
    course: "COMP 445",
    title: "Applied Machine Intelligence",
    priority: 2,
    mode: "Hybrid",
    notes: "Would like to pilot flipped classroom format.",
  },
  {
    id: "FAC-P3",
    course: "COMP 230",
    title: "Discrete Structures",
    priority: 3,
    mode: "Online",
    notes: "Open to mentoring new adjunct if needed.",
  },
  {
    id: "FAC-P4",
    course: "COMP 401",
    title: "Software Architecture",
    priority: 4,
    mode: "In-person",
    notes: "Needs lab support for architecture clinic sessions.",
  },
];

type SchedulerRule = {
  id: string;
  title: string;
  category: "Hard" | "Soft" | "Advisory";
  description: string;
  priority: number;
  active: boolean;
  ownerRole: RoleKey;
};

export const schedulerRules: SchedulerRule[] = [
  {
    id: "RULE-001",
    title: "Capstone labs require 48h gap",
    category: "Hard",
    description:
      "Capstone lab sections must be scheduled with at least 48 hours between consecutive sessions to allow for equipment reset.",
    priority: 5,
    active: true,
    ownerRole: "scheduler",
  },
  {
    id: "RULE-002",
    title: "Faculty research mornings",
    category: "Soft",
    description:
      "Faculty with active research grants should keep Tuesday mornings available for lab meetings.",
    priority: 3,
    active: true,
    ownerRole: "faculty",
  },
  {
    id: "RULE-003",
    title: "Evening electives clustering",
    category: "Advisory",
    description:
      "Group interdisciplinary electives after 5 PM to support working students.",
    priority: 2,
    active: false,
    ownerRole: "scheduler",
  },
];

type ScheduleDraft = {
  id: string;
  name: string;
  owner: string;
  progress: number;
  conflicts: number;
  lastUpdated: string;
  status: "Draft" | "Review" | "Ready";
};

export const schedulerDrafts: ScheduleDraft[] = [
  {
    id: "DR-1001",
    name: "STEM Undergrad Spring",
    owner: "Layla Al-Harthi",
    progress: 82,
    conflicts: 7,
    lastUpdated: "2025-02-12T10:45:00Z",
    status: "Review",
  },
  {
    id: "DR-1002",
    name: "Foundation Year",
    owner: "Fahd Al-Amri",
    progress: 68,
    conflicts: 12,
    lastUpdated: "2025-02-11T16:20:00Z",
    status: "Draft",
  },
  {
    id: "DR-1003",
    name: "Graduate Evening Track",
    owner: "Reem Al-Mutlaq",
    progress: 91,
    conflicts: 2,
    lastUpdated: "2025-02-13T08:05:00Z",
    status: "Ready",
  },
];

type ScheduleVersion = {
  id: string;
  label: string;
  publishedBy: string;
  publishedOn: string;
  draftSource: string;
  highlights: string[];
  status: "Published" | "Archived" | "Draft";
};

export const schedulerVersions: ScheduleVersion[] = [
  {
    id: "VER-2409",
    label: "Fall 2024 v9",
    publishedBy: "Layla Al-Harthi",
    publishedOn: "2024-09-18T09:12:00Z",
    draftSource: "STEM Undergrad Spring",
    highlights: ["Resolved 12 conflicts", "Added 3 new evening electives"],
    status: "Published",
  },
  {
    id: "VER-2410",
    label: "Fall 2024 v10",
    publishedBy: "Reem Al-Mutlaq",
    publishedOn: "2024-10-01T13:30:00Z",
    draftSource: "Graduate Evening Track",
    highlights: ["Updated faculty assignments", "Balanced lab utilization"],
    status: "Archived",
  },
  {
    id: "VER-2501",
    label: "Spring 2025 preview",
    publishedBy: "Layla Al-Harthi",
    publishedOn: "2025-02-10T15:22:00Z",
    draftSource: "STEM Undergrad Spring",
    highlights: ["New policy compliance checks", "Introduced conflict heatmap"],
    status: "Draft",
  },
];

type IrregularStudent = {
  id: string;
  name: string;
  nationalId: string;
  major: string;
  standing: "Good" | "Probation" | "Excellent";
  lastCase?: string;
};

export const irregularStudents: IrregularStudent[] = [
  {
    id: "ST-8821",
    name: "Sara Al-Abdullah",
    nationalId: "1092837465",
    major: "Computer Science",
    standing: "Excellent",
    lastCase: "International exchange seat override (2024)",
  },
  {
    id: "ST-8822",
    name: "Hassan Al-Waleed",
    nationalId: "1082234567",
    major: "Electrical Engineering",
    standing: "Good",
    lastCase: "Lab capacity exception (2023)",
  },
  {
    id: "ST-8823",
    name: "Maha Al-Rashid",
    nationalId: "1073345566",
    major: "Industrial Engineering",
    standing: "Probation",
    lastCase: "GPA recovery mentoring (2024)",
  },
];

type FeedbackItem = {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High";
  assignee: string;
  source: "Student" | "Faculty" | "System";
  status: "Unassigned" | "In Review" | "Resolved";
  receivedAt: string;
};

export const committeeFeedbackQueue: FeedbackItem[] = [
  {
    id: "FDB-1201",
    title: "Lab safety orientation missing",
    severity: "High",
    assignee: "Pending",
    source: "Faculty",
    status: "Unassigned",
    receivedAt: "2025-02-12T07:45:00Z",
  },
  {
    id: "FDB-1202",
    title: "Parallel sections capacity mismatch",
    severity: "Medium",
    assignee: "Iman Al-Shehri",
    source: "System",
    status: "In Review",
    receivedAt: "2025-02-11T12:30:00Z",
  },
  {
    id: "FDB-1203",
    title: "Feedback loop for capstone scheduling",
    severity: "Low",
    assignee: "Faisal Al-Qahtani",
    source: "Student",
    status: "Resolved",
    receivedAt: "2025-02-09T17:15:00Z",
  },
];

type ConflictItem = {
  id: string;
  name: string;
  category: "Room" | "Faculty" | "Curriculum" | "Student";
  severity: "Critical" | "High" | "Medium" | "Low";
  owner: string;
  status: "Open" | "Investigating" | "Resolved";
  flaggedOn: string;
  detail: string;
};

export const committeeConflicts: ConflictItem[] = [
  {
    id: "CF-5501",
    name: "AI Lab equipment contention",
    category: "Room",
    severity: "Critical",
    owner: "Asset Management",
    status: "Investigating",
    flaggedOn: "2025-02-08T09:10:00Z",
    detail: "Concurrent bookings for AI Lab 5 exceed GPU availability.",
  },
  {
    id: "CF-5502",
    name: "Faculty overload alert",
    category: "Faculty",
    severity: "High",
    owner: "Dean's Office",
    status: "Open",
    flaggedOn: "2025-02-12T08:40:00Z",
    detail: "Dr. Amal Al-Saud assigned to four studio sessions in same week.",
  },
  {
    id: "CF-5503",
    name: "Prerequisite inconsistency",
    category: "Curriculum",
    severity: "Medium",
    owner: "Curriculum Council",
    status: "Resolved",
    flaggedOn: "2025-01-30T11:20:00Z",
    detail:
      "COMP 342 showing conflicting prerequisite structure with COMP 246.",
  },
];

export const mockRooms: string[] = [
  "Innovation Hub 204",
  "Design Lab 3A",
  "Analytics Center 120",
  "AI Lab 5",
  "Leadership Center 404",
  "Sustainability Studio",
  "Main Auditorium",
  "Learning Commons 210",
];

export type Timeslot = {
  id: string;
  day: DayOfWeek;
  start: string;
  end: string;
};

export const mockTimeslots: Timeslot[] = daysOfWeek.flatMap((day) =>
  Array.from({ length: 28 }, (_, index) => {
    const startMinutes = 8 * 60 + index * 30;
    const endMinutes = startMinutes + 30;
    const toLabel = (totalMinutes: number) => {
      const hour = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minute = (totalMinutes % 60).toString().padStart(2, "0");
      return `${hour}:${minute}`;
    };
    return {
      id: `${day}-${index}`,
      day,
      start: toLabel(startMinutes),
      end: toLabel(endMinutes),
    };
  }).filter((slot) => slot.end <= "22:00")
);
