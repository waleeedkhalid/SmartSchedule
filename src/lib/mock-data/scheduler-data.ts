/**
 * Mock Data for Scheduler Features
 * Replace with actual API calls when backend is ready
 */

import {
  MockStudent,
  MockEnrollment,
  MockCapacityThreshold,
  MockIrregularStudent,
  MockStudentEnrollmentSummary,
  MockCourse,
  MockSection,
  MockRoom,
  MockCourseWithSections,
  MockAcademicTerm,
  MockAcademicEvent,
  MockTimelinePhase,
  MockSchedulingRule,
  MockRulePriority,
  MockConstraint,
  MockExam,
  MockExamConflict,
  MockSchedulerDashboardStats,
  MockQuickAction,
  AcademicPhase,
} from "@/types/scheduler-mock";

// ============================================================================
// ACADEMIC TERM DATA
// ============================================================================

export const mockAcademicTerm: MockAcademicTerm = {
  code: "2025-1",
  name: "Spring 2025",
  start_date: "2025-02-01",
  end_date: "2025-06-15",
  is_active: true,
  current_phase: "SCHEDULE_GENERATION",
};

// ============================================================================
// STUDENT DATA
// ============================================================================

export const mockStudents: MockStudent[] = [
  {
    id: "std-001",
    student_number: "2021001",
    full_name: "أحمد محمد العلي",
    email: "ahmad.ali@university.edu.sa",
    level: 3,
    department: "Software Engineering",
    status: "regular",
    gpa: 3.85,
    total_credits: 90,
    enrolled_courses: 6,
    created_at: "2021-09-01T00:00:00Z",
  },
  {
    id: "std-002",
    student_number: "2021002",
    full_name: "فاطمة خالد السالم",
    email: "fatima.salem@university.edu.sa",
    level: 3,
    department: "Software Engineering",
    status: "regular",
    gpa: 3.92,
    total_credits: 92,
    enrolled_courses: 6,
    created_at: "2021-09-01T00:00:00Z",
  },
  {
    id: "std-003",
    student_number: "2020015",
    full_name: "عبدالله عمر النجار",
    email: "abdullah.najjar@university.edu.sa",
    level: 4,
    department: "Software Engineering",
    status: "irregular",
    gpa: 2.65,
    total_credits: 105,
    enrolled_courses: 4,
    created_at: "2020-09-01T00:00:00Z",
  },
  {
    id: "std-004",
    student_number: "2022045",
    full_name: "نورة سعد الحربي",
    email: "noura.harbi@university.edu.sa",
    level: 2,
    department: "Software Engineering",
    status: "regular",
    gpa: 3.78,
    total_credits: 60,
    enrolled_courses: 7,
    created_at: "2022-09-01T00:00:00Z",
  },
  {
    id: "std-005",
    student_number: "2023012",
    full_name: "محمد عبدالعزيز القحطاني",
    email: "mohammed.qahtani@university.edu.sa",
    level: 1,
    department: "Software Engineering",
    status: "regular",
    gpa: 4.0,
    total_credits: 30,
    enrolled_courses: 6,
    created_at: "2023-09-01T00:00:00Z",
  },
];

export const mockStudentSummary: MockStudentEnrollmentSummary = {
  total_students: 450,
  regular_students: 425,
  irregular_students: 25,
  fully_enrolled: 380,
  partially_enrolled: 55,
  not_enrolled: 15,
  avg_credits_per_student: 18.5,
};

export const mockIrregularStudents: MockIrregularStudent[] = [
  {
    id: "irr-001",
    student_id: "std-003",
    student_name: "عبدالله عمر النجار",
    student_number: "2020015",
    level: 4,
    reason: "Failed prerequisite courses",
    courses_needed: ["SWE316", "SWE317"],
    status: "pending",
    reported_by: "committee-001",
    reported_by_name: "د. سارة أحمد",
    created_at: "2025-01-15T10:00:00Z",
    notes: "Student needs to retake two courses before advancing",
  },
  {
    id: "irr-002",
    student_id: "std-020",
    student_name: "خالد راشد المطيري",
    student_number: "2020028",
    level: 4,
    reason: "Incomplete graduation requirements",
    courses_needed: ["SWE498", "SWE499"],
    status: "notified",
    reported_by: "committee-001",
    reported_by_name: "د. سارة أحمد",
    created_at: "2025-01-10T14:30:00Z",
    notes: "Missing capstone projects",
  },
];

// ============================================================================
// COURSE DATA
// ============================================================================

export const mockCourses: MockCourse[] = [
  {
    course_code: "SWE316",
    course_name: "Software Design and Architecture",
    credits: 3,
    level: 3,
    type: "CORE",
    department: "Software Engineering",
    description: "Introduction to software design patterns and architectural styles",
    prerequisites: ["SWE214", "SWE215"],
    is_active: true,
    is_swe_managed: true,
    max_students: 35,
  },
  {
    course_code: "SWE317",
    course_name: "Database Systems",
    credits: 3,
    level: 3,
    type: "CORE",
    department: "Software Engineering",
    description: "Design and implementation of database systems",
    prerequisites: ["SWE214"],
    is_active: true,
    is_swe_managed: true,
    max_students: 35,
  },
  {
    course_code: "SWE363",
    course_name: "Web Engineering",
    credits: 3,
    level: 3,
    type: "REQUIRED",
    department: "Software Engineering",
    description: "Modern web development technologies and frameworks",
    prerequisites: ["SWE214"],
    is_active: true,
    is_swe_managed: true,
    max_students: 35,
  },
  {
    course_code: "SWE418",
    course_name: "Mobile Application Development",
    credits: 3,
    level: 4,
    type: "ELECTIVE",
    department: "Software Engineering",
    description: "Development of native and cross-platform mobile applications",
    prerequisites: ["SWE363"],
    is_active: true,
    is_swe_managed: true,
    max_students: 30,
  },
  {
    course_code: "SWE485",
    course_name: "Machine Learning",
    credits: 3,
    level: 4,
    type: "ELECTIVE",
    department: "Software Engineering",
    description: "Introduction to machine learning algorithms and applications",
    prerequisites: ["MATH201", "SWE214"],
    is_active: true,
    is_swe_managed: true,
    max_students: 30,
  },
];

export const mockSections: MockSection[] = [
  {
    section_id: "sec-001",
    course_code: "SWE316",
    course_name: "Software Design and Architecture",
    section_number: "01",
    capacity: 35,
    enrolled_count: 32,
    instructor_id: "fac-001",
    instructor_name: "د. أحمد محمد",
    room_number: "B201",
    section_type: "LECTURE",
    status: "PUBLISHED",
    time_slots: [
      {
        id: "ts-001",
        day: "Sunday",
        start_time: "08:00",
        end_time: "09:50",
      },
      {
        id: "ts-002",
        day: "Tuesday",
        start_time: "08:00",
        end_time: "09:50",
      },
    ],
  },
  {
    section_id: "sec-002",
    course_code: "SWE316",
    course_name: "Software Design and Architecture",
    section_number: "02",
    capacity: 35,
    enrolled_count: 28,
    instructor_id: "fac-002",
    instructor_name: "د. فاطمة السالم",
    room_number: "B202",
    section_type: "LECTURE",
    status: "PUBLISHED",
    time_slots: [
      {
        id: "ts-003",
        day: "Monday",
        start_time: "10:00",
        end_time: "11:50",
      },
      {
        id: "ts-004",
        day: "Wednesday",
        start_time: "10:00",
        end_time: "11:50",
      },
    ],
  },
  {
    section_id: "sec-003",
    course_code: "SWE317",
    course_name: "Database Systems",
    section_number: "01",
    capacity: 35,
    enrolled_count: 35,
    instructor_id: "fac-003",
    instructor_name: "د. عبدالله الخالد",
    room_number: "B203",
    section_type: "LECTURE",
    status: "PUBLISHED",
    time_slots: [
      {
        id: "ts-005",
        day: "Sunday",
        start_time: "10:00",
        end_time: "11:50",
      },
      {
        id: "ts-006",
        day: "Tuesday",
        start_time: "10:00",
        end_time: "11:50",
      },
    ],
  },
];

export const mockRooms: MockRoom[] = [
  {
    room_id: "room-001",
    building: "Building B",
    room_number: "B201",
    capacity: 40,
    room_type: "CLASSROOM",
    equipment: ["Projector", "Whiteboard", "Computer"],
    is_available: true,
  },
  {
    room_id: "room-002",
    building: "Building B",
    room_number: "B202",
    capacity: 40,
    room_type: "CLASSROOM",
    equipment: ["Projector", "Whiteboard", "Computer"],
    is_available: true,
  },
  {
    room_id: "room-003",
    building: "Building B",
    room_number: "B203",
    capacity: 35,
    room_type: "CLASSROOM",
    equipment: ["Projector", "Whiteboard"],
    is_available: true,
  },
  {
    room_id: "room-004",
    building: "Building C",
    room_number: "C101",
    capacity: 50,
    room_type: "LECTURE_HALL",
    equipment: ["Projector", "Sound System", "Recording Equipment"],
    is_available: true,
  },
  {
    room_id: "room-005",
    building: "Building A",
    room_number: "A301",
    capacity: 25,
    room_type: "LAB",
    equipment: ["Computers", "Network Equipment", "Projector"],
    is_available: true,
  },
];

export const mockCapacityThresholds: MockCapacityThreshold[] = [
  {
    id: "cap-001",
    course_code: "SWE316",
    course_name: "Software Design and Architecture",
    term_code: "2025-1",
    base_capacity: 35,
    threshold_percentage: 10,
    max_capacity: 38,
    is_swe_managed: true,
    updated_by: "committee-001",
    updated_at: "2025-01-10T00:00:00Z",
  },
  {
    id: "cap-002",
    course_code: "SWE317",
    course_name: "Database Systems",
    term_code: "2025-1",
    base_capacity: 35,
    threshold_percentage: 10,
    max_capacity: 38,
    is_swe_managed: true,
    updated_by: "committee-001",
    updated_at: "2025-01-10T00:00:00Z",
  },
];

// ============================================================================
// ACADEMIC TIMELINE DATA
// ============================================================================

export const mockAcademicEvents: MockAcademicEvent[] = [
  {
    id: "evt-001",
    title: "Schedule Generation Deadline",
    description: "Final deadline for committee to finalize schedules",
    event_type: "DEADLINE",
    start_date: "2025-01-25",
    term_code: "2025-1",
    status: "UPCOMING",
    priority: "HIGH",
  },
  {
    id: "evt-002",
    title: "Faculty Assignment Period",
    description: "Teaching load committee assigns instructors to sections",
    event_type: "MILESTONE",
    start_date: "2025-01-20",
    end_date: "2025-01-27",
    term_code: "2025-1",
    status: "ACTIVE",
    priority: "HIGH",
  },
  {
    id: "evt-003",
    title: "Student Registration Opens",
    description: "Students can begin enrolling in courses",
    event_type: "REGISTRATION",
    start_date: "2025-02-01",
    term_code: "2025-1",
    status: "UPCOMING",
    priority: "HIGH",
  },
];

export const mockTimelinePhases: MockTimelinePhase[] = [
  {
    phase: "PLANNING",
    name: "Planning Phase",
    start_date: "2024-12-01",
    end_date: "2024-12-31",
    status: "COMPLETED",
    progress: 100,
    tasks: [
      {
        id: "task-001",
        title: "Define academic calendar",
        completed: true,
        required: true,
      },
      {
        id: "task-002",
        title: "Review course catalog",
        completed: true,
        required: true,
      },
    ],
  },
  {
    phase: "SCHEDULE_GENERATION",
    name: "Schedule Generation",
    start_date: "2025-01-01",
    end_date: "2025-01-25",
    status: "ACTIVE",
    progress: 65,
    tasks: [
      {
        id: "task-003",
        title: "Create course sections",
        completed: true,
        required: true,
      },
      {
        id: "task-004",
        title: "Assign time slots",
        completed: true,
        required: true,
      },
      {
        id: "task-005",
        title: "Resolve conflicts",
        completed: false,
        required: true,
      },
    ],
  },
  {
    phase: "FACULTY_ASSIGNMENT",
    name: "Faculty Assignment",
    start_date: "2025-01-20",
    end_date: "2025-01-27",
    status: "UPCOMING",
    progress: 0,
    tasks: [
      {
        id: "task-006",
        title: "Assign instructors",
        completed: false,
        required: true,
      },
    ],
  },
];

// ============================================================================
// SCHEDULING RULES DATA
// ============================================================================

export const mockSchedulingRules: MockSchedulingRule[] = [
  {
    id: "rule-001",
    rule_name: "No Back-to-Back Labs",
    rule_type: "TIME_CONSTRAINT",
    description: "Lab sections should not be scheduled back-to-back",
    priority: 8,
    is_active: true,
    parameters: {
      min_gap_minutes: 30,
      section_types: ["LAB"],
    },
    created_by: "committee-001",
    created_at: "2024-12-01T00:00:00Z",
    last_modified: "2025-01-05T00:00:00Z",
  },
  {
    id: "rule-002",
    rule_name: "Max 3 Lectures Per Day",
    rule_type: "TIME_CONSTRAINT",
    description: "Students should not have more than 3 lectures in a single day",
    priority: 7,
    is_active: true,
    parameters: {
      max_lectures: 3,
      day_type: "single",
    },
    created_by: "committee-001",
    created_at: "2024-12-01T00:00:00Z",
    last_modified: "2024-12-01T00:00:00Z",
  },
  {
    id: "rule-003",
    rule_name: "Room Capacity Check",
    rule_type: "ROOM_CONSTRAINT",
    description: "Section enrollment must not exceed room capacity",
    priority: 10,
    is_active: true,
    parameters: {
      allow_overflow: false,
    },
    created_by: "system",
    created_at: "2024-12-01T00:00:00Z",
    last_modified: "2024-12-01T00:00:00Z",
  },
];

export const mockRulePriorities: MockRulePriority[] = [
  {
    id: "pri-001",
    category: "STUDENT_PREFERENCES",
    weight: 25,
    description: "Weight given to student elective preferences",
  },
  {
    id: "pri-002",
    category: "FACULTY_AVAILABILITY",
    weight: 30,
    description: "Weight given to faculty availability constraints",
  },
  {
    id: "pri-003",
    category: "ROOM_OPTIMIZATION",
    weight: 20,
    description: "Weight given to optimal room utilization",
  },
  {
    id: "pri-004",
    category: "TIME_DISTRIBUTION",
    weight: 25,
    description: "Weight given to balanced time distribution",
  },
];

// ============================================================================
// EXAM SCHEDULING DATA
// ============================================================================

export const mockExams: MockExam[] = [
  {
    id: "exam-001",
    course_code: "SWE316",
    course_name: "Software Design and Architecture",
    exam_type: "FINAL",
    exam_date: "2025-06-10",
    start_time: "08:00",
    end_time: "10:00",
    room_id: "room-004",
    room_number: "C101",
    capacity: 50,
    students_count: 60,
    invigilator_id: "fac-001",
    invigilator_name: "د. أحمد محمد",
    status: "SCHEDULED",
  },
  {
    id: "exam-002",
    course_code: "SWE317",
    course_name: "Database Systems",
    exam_type: "FINAL",
    exam_date: "2025-06-10",
    start_time: "08:00",
    end_time: "10:00",
    room_id: "room-001",
    room_number: "B201",
    capacity: 40,
    students_count: 35,
    status: "SCHEDULED",
  },
];

export const mockExamConflicts: MockExamConflict[] = [
  {
    id: "conflict-001",
    conflict_type: "STUDENT_OVERLAP",
    severity: "HIGH",
    exam_ids: ["exam-001", "exam-002"],
    affected_count: 15,
    description: "15 students are enrolled in both courses with exams at the same time",
    resolution_status: "UNRESOLVED",
  },
];

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export const mockDashboardStats: MockSchedulerDashboardStats = {
  term_code: "2025-1",
  term_name: "Spring 2025",
  current_phase: "SCHEDULE_GENERATION",
  total_students: 450,
  enrolled_students: 435,
  irregular_students: 25,
  total_courses: 45,
  active_courses: 42,
  total_sections: 95,
  published_sections: 78,
  total_capacity: 3325,
  total_enrolled: 2890,
  utilization_percentage: 86.9,
  active_conflicts: 12,
  resolved_conflicts: 45,
  schedule_progress: 65,
  last_generated_at: "2025-01-18T14:30:00Z",
  last_modified_by: "د. سارة أحمد",
};

export const mockQuickActions: MockQuickAction[] = [
  {
    id: "action-001",
    title: "Add New Course",
    description: "Create a new course in the catalog",
    icon: "Plus",
    action_type: "DIALOG",
    target: "add-course-dialog",
    enabled: true,
  },
  {
    id: "action-002",
    title: "Create Section",
    description: "Add a new section for a course",
    icon: "Copy",
    action_type: "DIALOG",
    target: "add-section-dialog",
    enabled: true,
  },
  {
    id: "action-003",
    title: "View Conflicts",
    description: "Review and resolve scheduling conflicts",
    icon: "AlertTriangle",
    action_type: "NAVIGATE",
    target: "/committee/scheduler/conflicts",
    enabled: true,
    badge: "12",
  },
  {
    id: "action-004",
    title: "Generate Schedule",
    description: "Run the automatic schedule generator",
    icon: "Zap",
    action_type: "FUNCTION",
    target: "generate-schedule",
    enabled: true,
  },
];

