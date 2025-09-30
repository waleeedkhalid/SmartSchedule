export const mockStudentCounts = [ 
  { code: "SWE211", name: "Introduction to Software Engineering", level: 4, total_students: 75, }, { code: "SWE312", name: "Software Requirements Engineer", level: 5, total_students: 80, }, { code: "SWE314", name: "Software Security Engineer", level: 5, total_students: 80, }, { code: "SWE321", name: "Software Architecture Engineering", level: 6, total_students: 65, }, { code: "SWE333", name: "Software Quality Assurance", level: 6, total_students: 70, }, { code: "SWE381", name: "Web Application Development", level: 6, total_students: 72, }, { code: "SWE434", name: "Software Testing & Validation", level: 7, total_students: 76, }, { code: "SWE444", name: "Software Construction Laboratory", level: 7, total_students: 66, }, { code: "SWE482", name: "Human-Computer Interaction", level: 7, total_students: 75, }, { code: "SWE477", name: "SWE Code of Ethics & Professional Practice", level: 7, total_students: 65, }, { code: "SWE455", name: "Software Maintenance & Evolution", level: 8, total_students: 50, }, { code: "SWE466", name: "Software Project Management", level: 8, total_students: 30, }, ];

export const mockElectivePackages = [
  {
    id: "islamic",
    label: "Islamic Studies",
    rangeLabel: "2-4 hours",
    minHours: 2,
    maxHours: 4,
    courses: [
      { code: "ISL101", name: "Islamic Culture", credits: 2 },
      { code: "ISL102", name: "Quranic Studies", credits: 2 },
      { code: "ISL103", name: "Islamic History", credits: 2 },
    ],
  },
  {
    id: "mathStats",
    label: "Math/Statistics",
    rangeLabel: "0-6 hours",
    minHours: 0,
    maxHours: 6,
    courses: [
      { code: "MATH202", name: "Calculus II", credits: 3 },
      { code: "STAT201", name: "Probability", credits: 3 },
      { code: "MATH301", name: "Linear Algebra", credits: 3 },
    ],
  },
  {
    id: "generalScience",
    label: "General Science",
    rangeLabel: "0-3 hours",
    minHours: 0,
    maxHours: 3,
    courses: [
      { code: "PHYS102", name: "Physics II", credits: 3 },
      { code: "BIOL101", name: "Biology I", credits: 3 },
      { code: "CHEM102", name: "Chemistry II", credits: 3 },
    ],
  },
  {
    id: "departmentElectives",
    label: "Department Electives",
    rangeLabel: "0-9 hours",
    minHours: 0,
    maxHours: 9,
    courses: [
      { code: "CS201", name: "Data Structures", credits: 3 },
      { code: "CS301", name: "Algorithms", credits: 3 },
      { code: "CS401", name: "Machine Learning", credits: 3 },
    ],
  },
];

export const mockSWEIrregularStudents = [
  {
    name: "Khalid Fares",
    requiredCourses: ["SWE211", "SWE312"],
  },
  {
    name: "Ahmed Abdulrahman",
    requiredCourses: ["SWE314"],
  },
  {
    name: "Mohammed Al-Najjar",
    requiredCourses: ["SWE321", "SWE333"],
  },
  {
    name: "Abdullah Al-Farsi",
    requiredCourses: ["SWE381", "SWE434"],
  },
  {
    name: "Faisal Al-Riyami",
    requiredCourses: ["SWE444", "SWE482"],
  },  
  {
    name: "Ali Al-Saad",
    requiredCourses: ["SWE477", "SWE444"],
  },
  {
    name: "Omar Al-Qahtani",
    requiredCourses: ["SWE482", "SWE477"],
  }  
];
