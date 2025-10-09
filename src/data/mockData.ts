import { CourseOffering } from "@/lib/types";

export const mockStudentCounts = [
  {
    code: "SWE211",
    name: "Introduction to Software Engineering",
    level: 4,
    total_students: 75,
  },
  {
    code: "SWE312",
    name: "Software Requirements Engineer",
    level: 5,
    total_students: 80,
  },
  {
    code: "SWE314",
    name: "Software Security Engineer",
    level: 5,
    total_students: 80,
  },
  {
    code: "SWE321",
    name: "Software Architecture Engineering",
    level: 6,
    total_students: 65,
  },
  {
    code: "SWE333",
    name: "Software Quality Assurance",
    level: 6,
    total_students: 70,
  },
  {
    code: "SWE381",
    name: "Web Application Development",
    level: 6,
    total_students: 72,
  },
  {
    code: "SWE434",
    name: "Software Testing & Validation",
    level: 7,
    total_students: 76,
  },
  {
    code: "SWE444",
    name: "Software Construction Laboratory",
    level: 7,
    total_students: 66,
  },
  {
    code: "SWE482",
    name: "Human-Computer Interaction",
    level: 7,
    total_students: 75,
  },
  {
    code: "SWE477",
    name: "SWE Code of Ethics & Professional Practice",
    level: 7,
    total_students: 65,
  },
  {
    code: "SWE455",
    name: "Software Maintenance & Evolution",
    level: 8,
    total_students: 50,
  },
  {
    code: "SWE466",
    name: "Software Project Management",
    level: 8,
    total_students: 30,
  },
];

export const mockSWEPlan = [
  {
    code: "SWE211",
    name: "Introduction to Software Engineering",
    credits: 3,
    level: 4,
    prerequisites: ["CSC111", "MATH151"],
  },
  {
    code: "CENX303",
    name: "Computer Networks and Communications",
    credits: 3,
    level: 4,
    prerequisites: ["CSC111"],
  },
  {
    code: "SWE312",
    name: "Software Requirements Engineering",
    credits: 3,
    level: 5,
    prerequisites: ["CSC113", "SWE211"],
  },
  {
    code: "SWE314",
    name: "Software Security Engineering",
    credits: 3,
    level: 5,
    prerequisites: ["CEN303"],
  },
  {
    code: "SWE321",
    name: "Software Design and Architecture",
    credits: 3,
    level: 6,
    prerequisites: ["SWE312", "SWE314"],
  },
  {
    code: "SWE333",
    name: "Software Quality Assurance",
    credits: 3,
    level: 6,
    prerequisites: ["SWE312"],
  },
  {
    code: "SWE381",
    name: "Web Application Development",
    credits: 3,
    level: 6,
    prerequisites: ["SWE211"],
  },
  {
    code: "SWE434",
    name: "Software Testing and Validation",
    credits: 3,
    level: 7,
    prerequisites: ["SWE333"],
  },
  {
    code: "SWE444",
    name: "Software Construction Lab",
    credits: 2,
    level: 7,
    prerequisites: ["SWE321", "SWE333"],
  },
  {
    code: "SWE477",
    name: "Ethics and Professional Practice in Software Engineering",
    credits: 2,
    level: 7,
    prerequisites: ["SWE321", "SWE333"],
  },
  {
    code: "SWE482",
    name: "Human-Computer Interaction",
    credits: 3,
    level: 7,
    prerequisites: ["SWE381"],
  },
  {
    code: "SWE466",
    name: "Software Project Management",
    credits: 3,
    level: 8,
    prerequisites: ["SWE333"],
  },
  {
    code: "SWE455",
    name: "Software Maintenance and Evolution",
    credits: 2,
    level: 8,
    prerequisites: ["SWE434"],
  },
];

export const mockElectivePackages = [
  /*
  IC 101
Principles of Islamic Culture	  IC 103
Economic System in Islam	  IC 105
Human Rights	  IC 106
Medical Jurisprudence	  QURN 100
Quran Kareem	  IC 109
Development Role of Women	  IC 102
Family in Islam	  IC 100
Studies in the Prophet Biography	  IC 104
Islamic Political System
  */
  {
    id: "universityRequirements",
    label: "University Requirements (4-0 hours)",
    rangeLabel: "4 hours (4-0)",
    minHours: 4,
    maxHours: 4,
    courses: [
      {
        code: "QURN100",
        name: "Quran Kareem",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC100",
        name: "Studies in the Prophet Biography",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC101",
        name: "Principles of Islamic Culture",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC102",
        name: "Family in Islam",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC103",
        name: "Economic System in Islam",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC104",
        name: "Islamic Political System",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC105",
        name: "Human Rights",
        credits: 2,
        prerequisites: [],
      },
      {
        code: "IC106",
        name: "Medical Jurisprudence",
        credits: 2,
        prerequisites: [],
      },
    ],
  },
  {
    id: "mathStats",
    label: "Math and Statistics Requirements (6-0 hours)",
    rangeLabel: "6 hours (6-0)",
    minHours: 6,
    maxHours: 6,
    courses: [
      {
        code: "MATH254",
        name: "Numerical Methods",
        credits: 3,
        prerequisites: ["MATH244"],
      },
      {
        code: "MATH203",
        name: "DIFFERENTIAL & INTEGRAL CALCULUS",
        credits: 3,
        prerequisites: ["MATH106"],
      },
      {
        code: "OPER122",
        name: "Introduction to Operations Research",
        credits: 3,
        prerequisites: [],
      },
    ],
  },
  //     Elective  3 - 3	  MBI 140
  // General Microbiology	  GPH 201
  // Principles of Geophysics	  ZOOL145
  // Biology	  PHYS201
  // Mathematical Physics (1)	  BCH 101
  // GENERAL BIOCHEMISTRY
  {
    id: "generalScience",
    label: "General Science Requirements (3-0 hours)",
    rangeLabel: "3 hours (3-0)",
    minHours: 3,
    maxHours: 3,
    courses: [
      {
        code: "MBI140",
        name: "General Microbiology",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "GPH201",
        name: "Principles of Geophysics",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "BCH101",
        name: "General Biochemistry",
        credits: 4,
        prerequisites: [],
      },
      {
        code: "PHYS201",
        name: "Mathematical Physics (1)",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "ZOOL145",
        name: "Biology",
        credits: 3,
        prerequisites: [],
      },
    ],
  },
  //     Elective  9 - 0	  SWE 484
  // Multimedia Computing	  CSC 215
  // Procedural Programming With C	  CENX445
  // NETWORK PROTOCOLS & ALGORITHMS	  SWE 486
  // Cloud Computing & Big Data	  SWE 488
  // Complex Systems Engineering	  CENX 318
  // Embedded Systems Design	  CSC 311
  // DESIGN & ANALYSIS OF ALGORITHEMS	  IS 485
  // Enterprise Resource Planning Systems Lab	  CENX316
  // Computer Architecture & Assembly Languages	  SWE 485
  // Selected Topics in Software Engineering	  CSC 478
  // Digital Image Processing and Analysis	  CSC 476
  // Computer Graphics	  IS 385
  // Enterprise Resource Planning Systems	  CSC 361
  // ARTIFICIAL INTELLIGENCE	  SWE 481
  // Advanced Web Applications Engineering	  SWE 483
  // Mobile Application Development	  SWE 483

  {
    id: "departmentElectives",
    label: "Department Electives (9-0 hours)",
    rangeLabel: "9 hours (9-0)",
    minHours: 9,
    maxHours: 9,
    courses: [
      {
        code: "SWE484",
        name: "Multimedia Computing",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "CSC215",
        name: "Procedural Programming With C",
        credits: 3,
        prerequisites: ["CSC111"],
      },
      {
        code: "CENX445",
        name: "Network Protocols & Algorithms",
        credits: 4,
        prerequisites: ["CENX303"],
      },
      {
        code: "SWE486",
        name: "Cloud Computing & Big Data",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "SWE488",
        name: "Complex Systems Engineering",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "CENX318",
        name: "Embedded Systems Design",
        credits: 3,
        prerequisites: ["CENX303"],
      },
      {
        code: "CSC311",
        name: "Design & Analysis of Algorithms",
        credits: 3,
        prerequisites: ["CSC212"],
      },
      {
        code: "IS485",
        name: "Enterprise Resource Planning Systems Lab",
        credits: 1,
        prerequisites: ["IS385"],
      },
      {
        code: "CENX316",
        name: "Computer Architecture & Assembly Languages",
        credits: 3,
        prerequisites: ["CENX303"],
      },
      {
        code: "SWE485",
        name: "Selected Topics in Software Engineering",
        credits: 3,
        prerequisites: [],
      },
      {
        code: "CSC478",
        name: "Digital Image Processing and Analysis",
        credits: 3,
        prerequisites: ["CSC361"],
      },
      {
        code: "CSC476",
        name: "Computer Graphics",
        credits: 3,
        prerequisites: ["CSC212"],
      },
      {
        code: "IS385",
        name: "Enterprise Resource Planning Systems",
        credits: 3,
        prerequisites: ["IS230"],
      },
      {
        code: "CSC361",
        name: "Artificial Intelligence",
        credits: 3,
        prerequisites: ["CSC220"],
      },
      {
        code: "SWE481",
        name: "Advanced Web Applications Engineering",
        credits: 3,
        prerequisites: ["SWE381"],
      },
      {
        code: "SWE483",
        name: "Mobile Application Development",
        credits: 3,
        prerequisites: ["SWE381"],
      },
    ],
  },
];

export const mockSWEIrregularStudents = [
  {
    id: "ir1",
    name: "Khalid Fares",
    requiredCourses: ["SWE211", "SWE312"],
  },
  {
    id: "ir2",
    name: "Ahmed Abdulrahman",
    requiredCourses: ["SWE314"],
  },
  {
    id: "ir3",
    name: "Mohammed Al-Najjar",
    requiredCourses: ["SWE321", "SWE333"],
  },
  {
    id: "ir4",
    name: "Abdullah Al-Farsi",
    requiredCourses: ["SWE381", "SWE434"],
  },
  {
    id: "ir5",
    name: "Faisal Al-Riyami",
    requiredCourses: ["SWE444", "SWE482"],
  },
  {
    id: "ir6",
    name: "Ali Al-Saad",
    requiredCourses: ["SWE477", "SWE444"],
  },
  {
    id: "ir7",
    name: "Omar Al-Qahtani",
    requiredCourses: ["SWE482", "SWE477"],
  },
];

export const mockCourseOfferings: CourseOffering[] = [
  // --- Core Computer Science Courses (Required for Specialization) ---
  {
    code: "CSC111",
    name: "Computer Programming (1)",
    credits: 4,
    department: "Computer Science",
    level: 3,
    type: "REQUIRED",
    prerequisites: [], // we consider this a freshman course with no prerequisites
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC111-01",
        courseCode: "CSC111",
        instructor: "Dr. Huda Faisal",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CSC111-02",
        courseCode: "CSC111",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "CCIS 1B120",
        times: [
          { day: "Monday", start: "12:00", end: "13:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "CSC113",
    name: "Computer Programming (2)",
    credits: 4,
    department: "Computer Science",
    level: 4,
    type: "REQUIRED",
    prerequisites: ["CSC111", "MATH151"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC113-01",
        courseCode: "CSC113",
        instructor: "Eng. Laila Nasser",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "12:50" },
        ],
      },
      {
        id: "CSC113-02",
        courseCode: "CSC113",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "CCIS 2C301",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CSC212",
    name: "Data Structures",
    credits: 3,
    department: "Computer Science",
    level: 5,
    type: "REQUIRED",
    prerequisites: ["CSC111", "CSC113"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC212-01",
        courseCode: "CSC212",
        instructor: "Prof. Sara Mohammed",
        room: "CCIS 3A101",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CSC212-02",
        courseCode: "CSC212",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "CCIS 1B120",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "CSC212-03",
        courseCode: "CSC212",
        instructor: "Dr. Majed Al-Dossari",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
    ],
  },
  {
    code: "CSC220",
    name: "Computer Organization",
    credits: 3,
    department: "Computer Science",
    level: 5,
    type: "REQUIRED",
    prerequisites: ["CSC113"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC220-01",
        courseCode: "CSC220",
        instructor: "Dr. Noura Al-Saud",
        room: "CCIS 2C301",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CSC220-02",
        courseCode: "CSC220",
        instructor: "Dr. Reem Abdullah",
        room: "CCIS 2C305",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC220-03",
        courseCode: "CSC220",
        instructor: "Prof. Omar Badr",
        room: "CCIS 3A101",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "CSC227",
    name: "Fundamentals of Databases",
    credits: 3,
    department: "Computer Science",
    level: 6,
    type: "REQUIRED",
    prerequisites: ["CSC212"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC227-01",
        courseCode: "CSC227",
        instructor: "Dr. Fahad Al-Ali",
        room: "CCIS 1B120",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "CSC227-02",
        courseCode: "CSC227",
        instructor: "Eng. Mona Salem",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CSC227-03",
        courseCode: "CSC227",
        instructor: "Dr. Huda Faisal",
        room: "CCIS 2C301",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CSC230",
    name: "Operating Systems",
    credits: 3,
    department: "Computer Science",
    level: 6,
    type: "REQUIRED",
    prerequisites: ["CSC220", "CSC212"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC230-01",
        courseCode: "CSC230",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "CCIS 2C305",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC230-02",
        courseCode: "CSC230",
        instructor: "Eng. Laila Nasser",
        room: "CCIS 3A101",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CSC230-03",
        courseCode: "CSC230",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "CCIS 1B120",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },

  // --- Math and Statistical Requirements ---
  {
    code: "MATH106",
    name: "Integral Calculus",
    credits: 3,
    department: "Mathematics",
    level: 3,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH106-01",
        courseCode: "MATH106",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "3",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "MATH106-02",
        courseCode: "MATH106",
        instructor: "Eng. Laila Nasser",
        room: "4",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "MATH106-03",
        courseCode: "MATH106",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "5",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "MATH151",
    name: "Discrete Mathematics",
    credits: 3,
    department: "Mathematics",
    level: 3,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH151-01",
        courseCode: "MATH151",
        instructor: "Prof. Sara Mohammed",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "MATH151-02",
        courseCode: "MATH151",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "Sci 05 210",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "MATH151-03",
        courseCode: "MATH151",
        instructor: "Dr. Majed Al-Dossari",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "MATH244",
    name: "Linear Algebra",
    credits: 3,
    department: "Mathematics",
    level: 4,
    type: "REQUIRED",
    prerequisites: ["MATH106"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH244-01",
        courseCode: "MATH244",
        instructor: "Dr. Noura Al-Saud",
        room: "Sci 06 115",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "MATH244-02",
        courseCode: "MATH244",
        instructor: "Dr. Reem Abdullah",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "MATH244-03",
        courseCode: "MATH244",
        instructor: "Prof. Omar Badr",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
    ],
  },
  {
    code: "MATH254",
    name: "Numerical Analysis",
    credits: 3,
    department: "Mathematics",
    level: 5,
    type: "ELECTIVE",
    prerequisites: ["MATH151"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH254-01",
        courseCode: "MATH254",
        instructor: "Dr. Fahad Al-Ali",
        room: "Sci 06 115",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "MATH254-02",
        courseCode: "MATH254",
        instructor: "Eng. Mona Salem",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "MATH254-03",
        courseCode: "MATH254",
        instructor: "Dr. Huda Faisal",
        room: "Sci 05 212",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "MATH203",
    name: "Integration and Applications",
    credits: 3,
    department: "Mathematics",
    level: 5,
    type: "ELECTIVE",
    prerequisites: ["MATH254"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH203-01",
        courseCode: "MATH203",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "MATH203-02",
        courseCode: "MATH203",
        instructor: "Eng. Laila Nasser",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "MATH203-03",
        courseCode: "MATH203",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "Sci 05 212",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "OPER122",
    name: "Introduction to Operations Research",
    credits: 2,
    department: "Operations Research",
    level: 5,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "OPER122-01",
        courseCode: "OPER122",
        instructor: "Prof. Sara Mohammed",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "OPER122-02",
        courseCode: "OPER122",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "Sci 05 210",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
    ],
  },

  // --- General Science Requirements ---
  {
    code: "PHYS103",
    name: "General Physics (1)",
    credits: 4,
    department: "Physics",
    level: 3,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "PHYS103-01",
        courseCode: "PHYS103",
        instructor: "Dr. Majed Al-Dossari",
        room: "Sci 05 212",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
      {
        id: "PHYS103-02",
        courseCode: "PHYS103",
        instructor: "Dr. Noura Al-Saud",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "PHYS104",
    name: "General Physics (2)",
    credits: 4,
    department: "Physics",
    level: 4,
    type: "REQUIRED",
    prerequisites: ["PHYS103"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "PHYS104-01",
        courseCode: "PHYS104",
        instructor: "Dr. Reem Abdullah",
        room: "Sci 05 210",
        times: [
          { day: "Monday", start: "12:00", end: "13:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
      {
        id: "PHYS104-02",
        courseCode: "PHYS104",
        instructor: "Prof. Omar Badr",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "PHYS201",
    name: "Mathematical Physics (1)",
    credits: 3,
    department: "Physics",
    level: 5,
    type: "ELECTIVE",
    prerequisites: ["PHYS103"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "PHYS201-01",
        courseCode: "PHYS201",
        instructor: "Dr. Fahad Al-Ali",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "PHYS201-02",
        courseCode: "PHYS201",
        instructor: "Eng. Mona Salem",
        room: "Sci 05 210",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "PHYS201-03",
        courseCode: "PHYS201",
        instructor: "Dr. Huda Faisal",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "BIOL145",
    name: "Biology",
    credits: 3,
    department: "Biology",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "BIOL145-01",
        courseCode: "BIOL145",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "BIOL145-02",
        courseCode: "BIOL145",
        instructor: "Eng. Laila Nasser",
        room: "Sci 05 210",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "BIOL145-03",
        courseCode: "BIOL145",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "BIOL140",
    name: "Microbiology",
    credits: 3,
    department: "Biology",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "BIOL140-01",
        courseCode: "BIOL140",
        instructor: "Prof. Sara Mohammed",
        room: "Sci 06 115",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "BIOL140-02",
        courseCode: "BIOL140",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "BIOL140-03",
        courseCode: "BIOL140",
        instructor: "Dr. Majed Al-Dossari",
        room: "Sci 05 212",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
    ],
  },
  {
    code: "CHEM101",
    name: "General Biochemistry",
    credits: 3,
    department: "Chemistry",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CHEM101-01",
        courseCode: "CHEM101",
        instructor: "Dr. Noura Al-Saud",
        room: "Sci 06 115",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CHEM101-02",
        courseCode: "CHEM101",
        instructor: "Dr. Reem Abdullah",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CHEM101-03",
        courseCode: "CHEM101",
        instructor: "Prof. Omar Badr",
        room: "Sci 05 212",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "GEOP201",
    name: "Fundamentals of Geophysics",
    credits: 3,
    department: "Geophysics",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "GEOP201-01",
        courseCode: "GEOP201",
        instructor: "Dr. Fahad Al-Ali",
        room: "Sci 06 115",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "GEOP201-02",
        courseCode: "GEOP201",
        instructor: "Eng. Mona Salem",
        room: "Sci 05 210",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "GEOP201-03",
        courseCode: "GEOP201",
        instructor: "Dr. Huda Faisal",
        room: "Sci 05 212",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },

  // --- University Requirements (ISLM/General Electives) ---
  {
    code: "ISLM107",
    name: "Professional Ethics",
    credits: 2,
    department: "Islamic Studies",
    level: 7,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM107-01",
        courseCode: "ISLM107",
        instructor: "Prof. Sara Mohammed",
        room: "Admin B 402",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "ISLM107-02",
        courseCode: "ISLM107",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "Admin B 401",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
    ],
  },
  {
    code: "ISLM100",
    name: "Holy Quran",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM100-01",
        courseCode: "ISLM100",
        instructor: "Dr. Majed Al-Dossari",
        room: "Admin B 402",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
      {
        id: "ISLM100-02",
        courseCode: "ISLM100",
        instructor: "Dr. Noura Al-Saud",
        room: "Admin B 401",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "ISLM101",
    name: "Fundamentals of Islamic Culture",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM101-01",
        courseCode: "ISLM101",
        instructor: "Dr. Reem Abdullah",
        room: "Admin B 402",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
      {
        id: "ISLM101-02",
        courseCode: "ISLM101",
        instructor: "Prof. Omar Badr",
        room: "Admin B 401",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
    ],
  },
  {
    code: "ISLM102",
    name: "The Family in Islam",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM102-01",
        courseCode: "ISLM102",
        instructor: "Dr. Fahad Al-Ali",
        room: "Admin B 402",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "ISLM102-02",
        courseCode: "ISLM102",
        instructor: "Eng. Mona Salem",
        room: "Admin B 401",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
    ],
  },
  {
    code: "ISLM103",
    name: "Islamic Economic System",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM103-01",
        courseCode: "ISLM103",
        instructor: "Dr. Huda Faisal",
        room: "Admin B 402",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
      {
        id: "ISLM103-02",
        courseCode: "ISLM103",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "Admin B 401",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "ISLM104",
    name: "Islamic Political System",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM104-01",
        courseCode: "ISLM104",
        instructor: "Eng. Laila Nasser",
        room: "Admin B 402",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
      {
        id: "ISLM104-02",
        courseCode: "ISLM104",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "Admin B 401",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
    ],
  },
  {
    code: "ISLM105",
    name: "Studies in the Prophet's Biography",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM105-01",
        courseCode: "ISLM105",
        instructor: "Prof. Sara Mohammed",
        room: "Admin B 402",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "ISLM105-02",
        courseCode: "ISLM105",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "Admin B 401",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
    ],
  },
  {
    code: "ISLM106",
    name: "The System Of Economics In Islam",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM106-01",
        courseCode: "ISLM106",
        instructor: "Dr. Majed Al-Dossari",
        room: "Admin B 402",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
      {
        id: "ISLM106-02",
        courseCode: "ISLM106",
        instructor: "Dr. Noura Al-Saud",
        room: "Admin B 401",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "ISLM109",
    name: "Human Rights",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "ELECTIVE",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "ISLM109-01",
        courseCode: "ISLM109",
        instructor: "Dr. Reem Abdullah",
        room: "Admin B 402",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
      {
        id: "ISLM109-02",
        courseCode: "ISLM109",
        instructor: "Prof. Omar Badr",
        room: "Admin B 401",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
    ],
  },
  {
    code: "IC108",
    name: "Current Issues",
    credits: 2,
    department: "Islamic Studies",
    level: 1,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "IC108-01",
        courseCode: "IC108",
        instructor: "Dr. Fahad Al-Ali",
        room: "Admin B 402",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "IC108-02",
        courseCode: "IC108",
        instructor: "Eng. Mona Salem",
        room: "Admin B 401",
        times: [{ day: "Monday", start: "15:00", end: "16:50" }],
      },
    ],
  },

  // --- Department Electives (Advanced Topics) ---
  {
    code: "CSC215",
    name: "Procedural Programming in C++",
    credits: 3,
    department: "Computer Science",
    level: 5,
    type: "ELECTIVE",
    prerequisites: ["CSC111"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC215-01",
        courseCode: "CSC215",
        instructor: "Dr. Huda Faisal",
        room: "CCIS 2C301",
        times: [{ day: "Thursday", start: "13:00", end: "14:50" }],
      },
      {
        id: "CSC215-02",
        courseCode: "CSC215",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "CCIS 2C305",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC215-03",
        courseCode: "CSC215",
        instructor: "Eng. Laila Nasser",
        room: "CCIS 3A101",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "CSC311",
    name: "Design and Analysis of Algorithms",
    credits: 3,
    department: "Computer Science",
    level: 6,
    type: "ELECTIVE",
    prerequisites: ["CSC212"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC311-01",
        courseCode: "CSC311",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "CCIS 1B120",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "CSC311-02",
        courseCode: "CSC311",
        instructor: "Prof. Sara Mohammed",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CSC311-03",
        courseCode: "CSC311",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "CCIS 2C301",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CSC316",
    name: "Computer Architecture and Assembly",
    credits: 3,
    department: "Computer Science",
    level: 6,
    type: "ELECTIVE",
    prerequisites: ["CSC220"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC316-01",
        courseCode: "CSC316",
        instructor: "Dr. Majed Al-Dossari",
        room: "CCIS 2C305",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC316-02",
        courseCode: "CSC316",
        instructor: "Dr. Noura Al-Saud",
        room: "CCIS 3A101",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CSC316-03",
        courseCode: "CSC316",
        instructor: "Dr. Reem Abdullah",
        room: "CCIS 1B120",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "CSC318",
    name: "Embedded Systems",
    credits: 4,
    department: "Computer Science",
    level: 7,
    type: "ELECTIVE",
    prerequisites: ["CSC230"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC318-01",
        courseCode: "CSC318",
        instructor: "Prof. Omar Badr",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CSC318-02",
        courseCode: "CSC318",
        instructor: "Dr. Fahad Al-Ali",
        room: "CCIS 2C301",
        times: [
          { day: "Monday", start: "12:00", end: "13:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "CSC361",
    name: "Artificial Intelligence",
    credits: 3,
    department: "Computer Science",
    level: 6,
    type: "ELECTIVE",
    prerequisites: ["CSC220"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC361-01",
        courseCode: "CSC361",
        instructor: "Eng. Mona Salem",
        room: "CCIS 2C305",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "12:50" },
        ],
      },
      {
        id: "CSC361-02",
        courseCode: "CSC361",
        instructor: "Dr. Huda Faisal",
        room: "CCIS 3A101",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC361-03",
        courseCode: "CSC361",
        instructor: "Prof. Khalid Al-Zahrani",
        room: "CCIS 1B120",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "IS385",
    name: "Enterprise Resource Planning Systems",
    credits: 3,
    department: "Computer Science",
    level: 7,
    type: "ELECTIVE",
    prerequisites: ["CSC230"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC385-01",
        courseCode: "CSC385",
        instructor: "Eng. Laila Nasser",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "CSC385-02",
        courseCode: "CSC385",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "CCIS 2C301",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CSC385-03",
        courseCode: "CSC385",
        instructor: "Prof. Sara Mohammed",
        room: "CCIS 2C305",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CSC445",
    name: "Network Protocols and Algorithms",
    credits: 3,
    department: "Computer Science",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["CSC303"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC445-01",
        courseCode: "CSC445",
        instructor: "Eng. Laila Nasser",
        room: "CCIS 2C305",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CSC445-02",
        courseCode: "CSC445",
        instructor: "Dr. Ahmed Al-Harbi",
        room: "CCIS 3A101",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC445-03",
        courseCode: "CSC445",
        instructor: "Prof. Sara Mohammed",
        room: "CCIS 1B120",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "CSC476",
    name: "Computer Graphics",
    credits: 3,
    department: "Computer Science",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["CSC212"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC476-01",
        courseCode: "CSC476",
        instructor: "Dr. Faisal Al-Otaibi",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "CSC476-02",
        courseCode: "CSC476",
        instructor: "Dr. Majed Al-Dossari",
        room: "CCIS 2C301",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CSC476-03",
        courseCode: "CSC476",
        instructor: "Dr. Noura Al-Saud",
        room: "CCIS 2C305",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CSC478",
    name: "Digital Image Processing and Analysis",
    credits: 3,
    department: "Computer Science",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["CSC361"],
    exams: {
      midterm: { date: "2026-03-10", time: "16:00", duration: 90 },
      midterm2: { date: "2026-04-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-21", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC478-01",
        courseCode: "CSC478",
        instructor: "Dr. Reem Abdullah",
        room: "CCIS 3A101",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC478-02",
        courseCode: "CSC478",
        instructor: "Prof. Omar Badr",
        room: "CCIS 1B120",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CSC478-03",
        courseCode: "CSC478",
        instructor: "Dr. Fahad Al-Ali",
        room: "CCIS 1B122",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  // --- Software Engineering Department Courses ---
  {
    code: "SWE211",
    name: "Introduction to Software Engineering",
    credits: 3,
    department: "SWE",
    level: 4,
    type: "REQUIRED",
    prerequisites: ["CSC111", "MATH151"],
    exams: {
      midterm: { date: "2026-03-12", time: "16:00", duration: 90 },
      final: { date: "2026-05-22", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE211-01",
        courseCode: "SWE211",
        instructor: "Dr. Fahad Al-Mutairi",
        room: "CCIS 2B201",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "SWE211-02",
        courseCode: "SWE211",
        instructor: "Dr. Sara Al-Ghamdi",
        room: "CCIS 2B202",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "12:50" },
          { day: "Thursday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "SWE211-03",
        courseCode: "SWE211",
        instructor: "Prof. Abdullah Al-Shehri",
        room: "CCIS 2B203",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "SWE312",
    name: "Software Requirements Engineering",
    credits: 3,
    department: "SWE",
    level: 5,
    type: "REQUIRED",
    prerequisites: ["CSC113", "SWE211"],
    exams: {
      midterm: { date: "2026-03-13", time: "16:00", duration: 90 },
      final: { date: "2026-05-23", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE312-01",
        courseCode: "SWE312",
        instructor: "Dr. Mohammed Al-Qahtani",
        room: "CCIS 2B204",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "SWE312-02",
        courseCode: "SWE312",
        instructor: "Dr. Noura Al-Dosari",
        room: "CCIS 2B205",
        times: [
          { day: "Monday", start: "09:00", end: "09:50" },
          { day: "Wednesday", start: "09:00", end: "09:50" },
          { day: "Thursday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "SWE312-03",
        courseCode: "SWE312",
        instructor: "Prof. Khalid Al-Turki",
        room: "CCIS 2B206",
        times: [
          { day: "Sunday", start: "13:00", end: "13:50" },
          { day: "Tuesday", start: "13:00", end: "13:50" },
          { day: "Wednesday", start: "13:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "SWE314",
    name: "Software Security Engineering",
    credits: 3,
    department: "SWE",
    level: 5,
    type: "REQUIRED",
    prerequisites: ["CEN303"],
    exams: {
      midterm: { date: "2026-03-14", time: "16:00", duration: 90 },
      final: { date: "2026-05-24", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE314-01",
        courseCode: "SWE314",
        instructor: "Dr. Faisal Al-Harbi",
        room: "CCIS 2B207",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "SWE314-02",
        courseCode: "SWE314",
        instructor: "Dr. Layla Al-Zahrani",
        room: "CCIS 2B208",
        times: [
          { day: "Monday", start: "10:00", end: "10:50" },
          { day: "Wednesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "SWE314-03",
        courseCode: "SWE314",
        instructor: "Prof. Omar Al-Rashid",
        room: "CCIS 2B209",
        times: [
          { day: "Sunday", start: "15:00", end: "15:50" },
          { day: "Tuesday", start: "15:00", end: "15:50" },
          { day: "Wednesday", start: "15:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "SWE321",
    name: "Software Design and Architecture",
    credits: 3,
    department: "SWE",
    level: 6,
    type: "REQUIRED",
    prerequisites: ["SWE312", "SWE314"],
    exams: {
      midterm: { date: "2026-03-15", time: "16:00", duration: 90 },
      final: { date: "2026-05-25", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE321-01",
        courseCode: "SWE321",
        instructor: "Dr. Ahmed Al-Mutlaq",
        room: "CCIS 2B210",
        times: [
          { day: "Sunday", start: "09:00", end: "09:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
          { day: "Thursday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "SWE321-02",
        courseCode: "SWE321",
        instructor: "Dr. Maha Al-Otaibi",
        room: "CCIS 2B211",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "SWE333",
    name: "Software Quality Assurance",
    credits: 3,
    department: "SWE",
    level: 6,
    type: "REQUIRED",
    prerequisites: ["SWE312"],
    exams: {
      midterm: { date: "2026-03-16", time: "16:00", duration: 90 },
      final: { date: "2026-05-26", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE333-01",
        courseCode: "SWE333",
        instructor: "Dr. Nasser Al-Juhani",
        room: "CCIS 2B212",
        times: [
          { day: "Sunday", start: "12:00", end: "12:50" },
          { day: "Tuesday", start: "12:00", end: "12:50" },
          { day: "Thursday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "SWE333-02",
        courseCode: "SWE333",
        instructor: "Dr. Reem Al-Shammari",
        room: "CCIS 2B213",
        times: [
          { day: "Monday", start: "13:00", end: "13:50" },
          { day: "Wednesday", start: "13:00", end: "13:50" },
          { day: "Thursday", start: "13:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "SWE381",
    name: "Web Application Development",
    credits: 3,
    department: "SWE",
    level: 6,
    type: "REQUIRED",
    prerequisites: ["SWE211"],
    exams: {
      midterm: { date: "2026-03-17", time: "16:00", duration: 90 },
      final: { date: "2026-05-27", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE381-01",
        courseCode: "SWE381",
        instructor: "Dr. Tariq Al-Amri",
        room: "CCIS 2B214",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "SWE381-02",
        courseCode: "SWE381",
        instructor: "Dr. Huda Al-Malki",
        room: "CCIS 2B215",
        times: [
          { day: "Monday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
          { day: "Thursday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "SWE381-03",
        courseCode: "SWE381",
        instructor: "Prof. Saad Al-Dakhil",
        room: "CCIS 2B216",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "SWE434",
    name: "Software Testing and Validation",
    credits: 3,
    department: "SWE",
    level: 7,
    type: "REQUIRED",
    prerequisites: ["SWE333"],
    exams: {
      midterm: { date: "2026-03-18", time: "16:00", duration: 90 },
      final: { date: "2026-05-28", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE434-01",
        courseCode: "SWE434",
        instructor: "Dr. Yousef Al-Rasheed",
        room: "CCIS 2B217",
        times: [
          { day: "Sunday", start: "13:00", end: "13:50" },
          { day: "Tuesday", start: "13:00", end: "13:50" },
          { day: "Thursday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "SWE434-02",
        courseCode: "SWE434",
        instructor: "Dr. Amira Al-Subaie",
        room: "CCIS 2B218",
        times: [
          { day: "Monday", start: "08:00", end: "08:50" },
          { day: "Wednesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "SWE434-03",
        courseCode: "SWE434",
        instructor: "Prof. Majed Al-Harbi",
        room: "CCIS 2B219",
        times: [
          { day: "Sunday", start: "15:00", end: "15:50" },
          { day: "Tuesday", start: "15:00", end: "15:50" },
          { day: "Wednesday", start: "15:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "SWE444",
    name: "Software Construction Lab",
    credits: 2,
    department: "SWE",
    level: 7,
    type: "REQUIRED",
    prerequisites: ["SWE321", "SWE333"],
    exams: {
      midterm: { date: "2026-03-19", time: "16:00", duration: 90 },
      final: { date: "2026-05-29", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE444-01",
        courseCode: "SWE444",
        instructor: "Dr. Waleed Al-Zahrani",
        room: "CCIS LAB-101",
        times: [
          { day: "Sunday", start: "14:00", end: "15:50" },
          { day: "Tuesday", start: "14:00", end: "15:50" },
        ],
      },
      {
        id: "SWE444-02",
        courseCode: "SWE444",
        instructor: "Dr. Fatima Al-Jasser",
        room: "CCIS LAB-102",
        times: [
          { day: "Monday", start: "10:00", end: "11:50" },
          { day: "Wednesday", start: "10:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "SWE477",
    name: "Ethics and Professional Practice in Software Engineering",
    credits: 2,
    department: "SWE",
    level: 7,
    type: "REQUIRED",
    prerequisites: ["SWE321", "SWE333"],
    exams: {
      midterm: { date: "2026-03-20", time: "16:00", duration: 90 },
      final: { date: "2026-05-30", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE477-01",
        courseCode: "SWE477",
        instructor: "Prof. Ibrahim Al-Saud",
        room: "CCIS 2B220",
        times: [
          { day: "Sunday", start: "09:00", end: "09:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "SWE477-02",
        courseCode: "SWE477",
        instructor: "Dr. Aisha Al-Mutairi",
        room: "CCIS 2B221",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "SWE482",
    name: "Software Project Management",
    credits: 3,
    department: "SWE",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["SWE321"],
    exams: {
      midterm: { date: "2026-03-21", time: "16:00", duration: 90 },
      final: { date: "2026-05-31", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE482-01",
        courseCode: "SWE482",
        instructor: "Dr. Bader Al-Otaibi",
        room: "CCIS 2B222",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "SWE455",
    name: "Introduction to Machine Learning",
    credits: 3,
    department: "SWE",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["CSC212", "MATH151"],
    exams: {
      midterm: { date: "2026-03-22", time: "16:00", duration: 90 },
      final: { date: "2026-06-01", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE455-01",
        courseCode: "SWE455",
        instructor: "Dr. Hassan Al-Ghamdi",
        room: "CCIS 2B223",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "SWE466",
    name: "Cloud Computing",
    credits: 3,
    department: "SWE",
    level: 8,
    type: "ELECTIVE",
    prerequisites: ["CSC212"],
    exams: {
      midterm: { date: "2026-03-23", time: "16:00", duration: 90 },
      final: { date: "2026-06-02", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "SWE466-01",
        courseCode: "SWE466",
        instructor: "Dr. Turki Al-Subaihi",
        room: "CCIS 2B224",
        times: [
          { day: "Monday", start: "09:00", end: "09:50" },
          { day: "Wednesday", start: "09:00", end: "09:50" },
          { day: "Thursday", start: "09:00", end: "09:50" },
        ],
      },
    ],
  },
];

// ============================================================================
// SCHEDULE GENERATION EXPORTS
// ============================================================================

// Export new schedule generation mock data
export {
  mockSWECurriculum,
  getCurriculumForLevel,
  getAllSWECourses,
  getAllExternalCourses,
  isSWECourse,
  isExternalCourse,
  getLevelsForCourse,
} from "./mockSWECurriculum";

export {
  mockSWEStudents,
  getStudentsByLevel,
  getStudentCountForLevel,
  getTotalSWEStudents,
  getElectiveDemandForLevel,
  getTopElectivesByDemand,
  getStudentCountsByLevel,
  calculateSectionsNeeded,
} from "./mockSWEStudents";

export {
  mockSWEFaculty,
  getFacultyForCourse,
  getAllSWEFaculty,
  getSWEFacultyCount,
  getFacultyByRank,
  getFacultyAvailableAt,
  getTotalTeachingCapacity,
  getFacultyStatistics,
} from "./mockSWEFaculty";
