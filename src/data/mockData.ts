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

export const mockCourseOfferings = [
  {
    code: "MATH203",
    name: "Linear Algebra",
    credits: 3,
    department: "Mathematics",
    level: 2,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-12", time: "16:00", duration: 90 },
      midterm2: { date: "2025-04-18", time: "16:00", duration: 90 },
      final: { date: "2025-05-25", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH203-01",
        courseCode: "MATH203",
        instructor: "Prof. Omar Badr",
        room: "12 05",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "MATH203-02",
        courseCode: "MATH203",
        instructor: "Dr. Huda Faisal",
        room: "12 06",
        times: [
          { day: "Monday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
          { day: "Thursday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "MATH203-03",
        courseCode: "MATH203",
        instructor: "Dr. Fahad Al-Ali",
        room: "12 07",
        times: [
          { day: "Sunday", start: "15:00", end: "15:50" },
          { day: "Tuesday", start: "15:00", end: "15:50" },
          { day: "Wednesday", start: "15:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "MATH244",
    name: "Differential Equations",
    credits: 3,
    department: "Mathematics",
    level: 3,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-10", time: "10:00", duration: 90 },
      midterm2: { date: "2025-04-14", time: "10:00", duration: 90 },
      final: { date: "2025-05-22", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH244-01",
        courseCode: "MATH244",
        instructor: "Dr. Khalid Omar",
        room: "31 11",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "MATH244-02",
        courseCode: "MATH244",
        instructor: "Dr. Lina Hussein",
        room: "31 12",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "MATH244-03",
        courseCode: "MATH244",
        instructor: "Dr. Tariq Al-Mutairi",
        room: "31 13",
        times: [
          { day: "Thursday", start: "08:00", end: "08:50" },
          { day: "Monday", start: "09:00", end: "09:50" },
        ],
      },
    ],
  },
  {
    code: "MATH311",
    name: "Numerical Analysis",
    credits: 3,
    department: "Mathematics",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-19", time: "13:00", duration: 90 },
      midterm2: { date: "2025-04-23", time: "13:00", duration: 90 },
      final: { date: "2025-06-01", time: "11:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH311-01",
        courseCode: "MATH311",
        instructor: "Prof. Nadia Ghanem",
        room: "11 01",
        times: [
          { day: "Monday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "MATH311-02",
        courseCode: "MATH311",
        instructor: "Dr. Ali Zaki",
        room: "11 02",
        times: [
          { day: "Sunday", start: "13:00", end: "13:50" },
          { day: "Tuesday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "MATH311-03",
        courseCode: "MATH311",
        instructor: "Eng. Sarah Ahmed",
        room: "11 03",
        times: [
          { day: "Tuesday", start: "16:00", end: "16:50" },
          { day: "Thursday", start: "16:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "PHY104",
    name: "General Physics (2)",
    credits: 4,
    department: "Physics",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-17", time: "11:00", duration: 90 },
      midterm2: { date: "2025-04-21", time: "11:00", duration: 90 },
      final: { date: "2025-05-29", time: "14:00", duration: 120 },
    },
    sections: [
      {
        id: "PHY104-01",
        courseCode: "PHY104",
        instructor: "Dr. Lamia Tariq",
        room: "21 01",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "PHY104-02",
        courseCode: "PHY104",
        instructor: "Dr. Nael Majid",
        room: "21 02",
        times: [
          { day: "Monday", start: "13:00", end: "14:50" },
          { day: "Wednesday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "PHY104-03",
        courseCode: "PHY104",
        instructor: "Prof. Rima Saud",
        room: "21 03",
        times: [
          { day: "Tuesday", start: "15:00", end: "16:50" },
          { day: "Thursday", start: "15:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "PHY201",
    name: "Electricity and Magnetism",
    credits: 3,
    department: "Physics",
    level: 2,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-24", time: "15:00", duration: 90 },
      midterm2: { date: "2025-04-28", time: "15:00", duration: 90 },
      final: { date: "2025-05-26", time: "10:00", duration: 120 },
    },
    sections: [
      {
        id: "PHY201-01",
        courseCode: "PHY201",
        instructor: "Dr. Sami Jamil",
        room: "22 10",
        times: [
          { day: "Monday", start: "09:00", end: "09:50" },
          { day: "Wednesday", start: "09:00", end: "09:50" },
          { day: "Sunday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "PHY201-02",
        courseCode: "PHY201",
        instructor: "Dr. Haifa Saad",
        room: "22 11",
        times: [
          { day: "Tuesday", start: "12:00", end: "12:50" },
          { day: "Thursday", start: "12:00", end: "12:50" },
          { day: "Monday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "PHY201-03",
        courseCode: "PHY201",
        instructor: "Prof. Ziad Youssef",
        room: "22 12",
        times: [
          { day: "Sunday", start: "16:00", end: "16:50" },
          { day: "Tuesday", start: "16:00", end: "16:50" },
          { day: "Wednesday", start: "16:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "PHY305",
    name: "Optics",
    credits: 3,
    department: "Physics",
    level: 3,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-28", time: "09:00", duration: 90 },
      midterm2: { date: "2025-05-02", time: "09:00", duration: 90 },
      final: { date: "2025-06-03", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "PHY305-01",
        courseCode: "PHY305",
        instructor: "Dr. Mariam Essam",
        room: "23 05",
        times: [
          { day: "Monday", start: "10:00", end: "11:50" },
          { day: "Wednesday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "PHY305-02",
        courseCode: "PHY305",
        instructor: "Dr. Hamad Zaki",
        room: "23 06",
        times: [
          { day: "Tuesday", start: "08:00", end: "09:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "PHY305-03",
        courseCode: "PHY305",
        instructor: "Prof. Sara Al-Wardi",
        room: "23 07",
        times: [
          { day: "Sunday", start: "14:00", end: "15:50" },
          { day: "Monday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "OPER321",
    name: "Deterministic Models",
    credits: 3,
    department: "Operations Research",
    level: 3,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-14", time: "12:00", duration: 90 },
      midterm2: { date: "2025-04-18", time: "12:00", duration: 90 },
      final: { date: "2025-05-28", time: "16:00", duration: 120 },
    },
    sections: [
      {
        id: "OPER321-01",
        courseCode: "OPER321",
        instructor: "Dr. Fadi Salim",
        room: "22 05",
        times: [
          { day: "Sunday", start: "09:00", end: "09:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
          { day: "Thursday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "OPER321-02",
        courseCode: "OPER321",
        instructor: "Dr. Mona Rashed",
        room: "22 06",
        times: [
          { day: "Monday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
          { day: "Sunday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "OPER321-03",
        courseCode: "OPER321",
        instructor: "Prof. Adel Fouad",
        room: "22 07",
        times: [
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
          { day: "Monday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "OPER330",
    name: "Probabilistic Models",
    credits: 3,
    department: "Operations Research",
    level: 3,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-21", time: "14:00", duration: 90 },
      midterm2: { date: "2025-04-25", time: "14:00", duration: 90 },
      final: { date: "2025-06-02", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "OPER330-01",
        courseCode: "OPER330",
        instructor: "Dr. Hanan Al-Turki",
        room: "23 15",
        times: [
          { day: "Sunday", start: "11:00", end: "12:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "OPER330-02",
        courseCode: "OPER330",
        instructor: "Dr. Sami Jaber",
        room: "23 16",
        times: [
          { day: "Monday", start: "15:00", end: "16:50" },
          { day: "Wednesday", start: "15:00", end: "15:50" },
        ],
      },
      {
        id: "OPER330-03",
        courseCode: "OPER330",
        instructor: "Prof. Fatima Hamad",
        room: "23 17",
        times: [
          { day: "Tuesday", start: "13:00", end: "14:50" },
          { day: "Thursday", start: "13:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "OPER451",
    name: "Optimization Algorithms",
    credits: 3,
    department: "Operations Research",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-26", time: "10:00", duration: 90 },
      midterm2: { date: "2025-04-30", time: "10:00", duration: 90 },
      final: { date: "2025-05-30", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "OPER451-01",
        courseCode: "OPER451",
        instructor: "Dr. Majed Said",
        room: "24 01",
        times: [
          { day: "Monday", start: "08:00", end: "08:50" },
          { day: "Wednesday", start: "08:00", end: "08:50" },
          { day: "Friday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "OPER451-02",
        courseCode: "OPER451",
        instructor: "Dr. Laila Fouad",
        room: "24 02",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Thursday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "OPER451-03",
        courseCode: "OPER451",
        instructor: "Prof. Yaser Ibrahim",
        room: "24 03",
        times: [
          { day: "Monday", start: "17:00", end: "17:50" },
          { day: "Wednesday", start: "17:00", end: "17:50" },
          { day: "Tuesday", start: "17:00", end: "17:50" },
        ],
      },
    ],
  },
  {
    code: "CSC113",
    name: "Computer Programming (2)",
    credits: 4,
    department: "Computer Science",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-25", time: "17:00", duration: 90 },
      final: { date: "2025-05-27", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC113-01",
        courseCode: "CSC113",
        instructor: "Dr. Jamal Nasser",
        room: "41 10",
        times: [
          { day: "Sunday", start: "10:00", end: "11:50" },
          { day: "Tuesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "CSC113-02",
        courseCode: "CSC113",
        instructor: "Dr. Laila Fouad",
        room: "41 11",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CSC113-03",
        courseCode: "CSC113",
        instructor: "Mr. Talal Ghanem",
        room: "41 12",
        times: [
          { day: "Tuesday", start: "12:00", end: "13:50" },
          { day: "Thursday", start: "12:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "CSC212",
    name: "Data Structures",
    credits: 4,
    department: "Computer Science",
    level: 2,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-31", time: "10:00", duration: 90 },
      final: { date: "2025-06-04", time: "10:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC212-01",
        courseCode: "CSC212",
        instructor: "Dr. Sarah Al-Dossary",
        room: "42 01",
        times: [
          { day: "Monday", start: "14:00", end: "15:50" },
          { day: "Wednesday", start: "14:00", end: "15:50" },
        ],
      },
      {
        id: "CSC212-02",
        courseCode: "CSC212",
        instructor: "Prof. Sami Ahmed",
        room: "42 02",
        times: [
          { day: "Tuesday", start: "08:00", end: "09:50" },
          { day: "Thursday", start: "08:00", end: "09:50" },
        ],
      },
      {
        id: "CSC212-03",
        courseCode: "CSC212",
        instructor: "Eng. Noor Al-Saud",
        room: "42 03",
        times: [
          { day: "Sunday", start: "16:00", end: "17:50" },
          { day: "Wednesday", start: "16:00", end: "17:50" },
        ],
      },
    ],
  },
  {
    code: "CSC329",
    name: "Computer Networks",
    credits: 3,
    department: "Computer Science",
    level: 3,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-03", time: "14:00", duration: 90 },
      final: { date: "2025-06-08", time: "14:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC329-01",
        courseCode: "CSC329",
        instructor: "Dr. Adel Hassan",
        room: "43 15",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "12:50" },
        ],
      },
      {
        id: "CSC329-02",
        courseCode: "CSC329",
        instructor: "Dr. Amira Ali",
        room: "43 16",
        times: [
          { day: "Monday", start: "10:00", end: "10:50" },
          { day: "Wednesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "CSC329-03",
        courseCode: "CSC329",
        instructor: "Prof. Nabil Saud",
        room: "43 17",
        times: [
          { day: "Tuesday", start: "15:00", end: "15:50" },
          { day: "Thursday", start: "15:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "CEN201",
    name: "Digital Logic Design",
    credits: 3,
    department: "Computer Engineering",
    level: 2,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-07", time: "11:00", duration: 90 },
      final: { date: "2025-06-05", time: "11:00", duration: 120 },
    },
    sections: [
      {
        id: "CEN201-01",
        courseCode: "CEN201",
        instructor: "Dr. Majed Saud",
        room: "51 01",
        times: [
          { day: "Monday", start: "08:00", end: "09:50" },
          { day: "Wednesday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CEN201-02",
        courseCode: "CEN201",
        instructor: "Dr. Reem Badr",
        room: "51 02",
        times: [
          { day: "Sunday", start: "13:00", end: "14:50" },
          { day: "Tuesday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "CEN201-03",
        courseCode: "CEN201",
        instructor: "Prof. Talal Zaki",
        room: "51 03",
        times: [
          { day: "Tuesday", start: "16:00", end: "17:50" },
          { day: "Thursday", start: "16:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "CEN303",
    name: "Microprocessors",
    credits: 3,
    department: "Computer Engineering",
    level: 3,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-10", time: "15:00", duration: 90 },
      final: { date: "2025-06-09", time: "15:00", duration: 120 },
    },
    sections: [
      {
        id: "CEN303-01",
        courseCode: "CEN303",
        instructor: "Dr. Faisal Omar",
        room: "52 10",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "CEN303-02",
        courseCode: "CEN303",
        instructor: "Dr. Hajar Al-Jaber",
        room: "52 11",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
      {
        id: "CEN303-03",
        courseCode: "CEN303",
        instructor: "Prof. Tareq Said",
        room: "52 12",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Tuesday", start: "14:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "CEN415",
    name: "Computer Architecture",
    credits: 3,
    department: "Computer Engineering",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-04-14", time: "09:00", duration: 90 },
      final: { date: "2025-06-12", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "CEN415-01",
        courseCode: "CEN415",
        instructor: "Dr. Amal Hassan",
        room: "53 05",
        times: [
          { day: "Monday", start: "11:00", end: "12:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CEN415-02",
        courseCode: "CEN415",
        instructor: "Dr. Nasser Hamad",
        room: "53 06",
        times: [
          { day: "Sunday", start: "08:00", end: "09:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "CEN415-03",
        courseCode: "CEN415",
        instructor: "Prof. Zainab Ali",
        room: "53 07",
        times: [
          { day: "Tuesday", start: "14:00", end: "15:50" },
          { day: "Thursday", start: "14:00", end: "14:50" },
        ],
      },
    ],
  },
  {
    code: "IS241",
    name: "Database Management Systems",
    credits: 3,
    department: "Information Systems",
    level: 2,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-16", time: "13:00", duration: 90 },
      final: { date: "2025-05-24", time: "10:00", duration: 120 },
    },
    sections: [
      {
        id: "IS241-01",
        courseCode: "IS241",
        instructor: "Dr. Abdullah Saad",
        room: "61 10",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "IS241-02",
        courseCode: "IS241",
        instructor: "Dr. Mariam Yaser",
        room: "61 11",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
      {
        id: "IS241-03",
        courseCode: "IS241",
        instructor: "Prof. Waleed Talal",
        room: "61 12",
        times: [
          { day: "Tuesday", start: "14:00", end: "14:50" },
          { day: "Thursday", start: "14:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "IS331",
    name: "System Analysis and Design",
    credits: 3,
    department: "Information Systems",
    level: 3,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-23", time: "16:00", duration: 90 },
      final: { date: "2025-05-28", time: "12:00", duration: 120 },
    },
    sections: [
      {
        id: "IS331-01",
        courseCode: "IS331",
        instructor: "Dr. Haifa Saad",
        room: "62 05",
        times: [
          { day: "Monday", start: "09:00", end: "09:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "IS331-02",
        courseCode: "IS331",
        instructor: "Dr. Ziad Youssef",
        room: "62 06",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "12:50" },
        ],
      },
      {
        id: "IS331-03",
        courseCode: "IS331",
        instructor: "Prof. Reem Khalid",
        room: "62 07",
        times: [
          { day: "Tuesday", start: "15:00", end: "15:50" },
          { day: "Thursday", start: "15:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "IS442",
    name: "ERP Systems",
    credits: 3,
    department: "Information Systems",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-03-30", time: "11:00", duration: 90 },
      final: { date: "2025-06-03", time: "10:00", duration: 120 },
    },
    sections: [
      {
        id: "IS442-01",
        courseCode: "IS442",
        instructor: "Dr. Amal Nasser",
        room: "63 01",
        times: [
          { day: "Sunday", start: "08:00", end: "09:50" },
          { day: "Wednesday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "IS442-02",
        courseCode: "IS442",
        instructor: "Dr. Majed Ali",
        room: "63 02",
        times: [
          { day: "Monday", start: "14:00", end: "15:50" },
          { day: "Thursday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "IS442-03",
        courseCode: "IS442",
        instructor: "Prof. Nora Talal",
        room: "63 03",
        times: [
          { day: "Tuesday", start: "10:00", end: "11:50" },
          { day: "Sunday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "IC101",
    name: "Introduction to Islamic Culture",
    credits: 2,
    department: "Islamic Culture",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-15", time: "17:00", duration: 60 },
      final: { date: "2025-06-06", time: "13:00", duration: 90 },
    },
    sections: [
      {
        id: "IC101-01",
        courseCode: "IC101",
        instructor: "Dr. Saad Al-Saud",
        room: "71 20",
        times: [
          { day: "Monday", start: "16:00", end: "16:50" },
          { day: "Wednesday", start: "16:00", end: "16:50" },
        ],
      },
      {
        id: "IC101-02",
        courseCode: "IC101",
        instructor: "Dr. Huda Nasser",
        room: "71 21",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "IC101-03",
        courseCode: "IC101",
        instructor: "Prof. Ahmed Ali",
        room: "71 22",
        times: [
          { day: "Tuesday", start: "12:00", end: "12:50" },
          { day: "Thursday", start: "12:00", end: "12:50" },
        ],
      },
    ],
  },
  {
    code: "IC102",
    name: "Islamic View of Man and Universe",
    credits: 2,
    department: "Islamic Culture",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-17", time: "10:00", duration: 60 },
      final: { date: "2025-06-10", time: "10:00", duration: 90 },
    },
    sections: [
      {
        id: "IC102-01",
        courseCode: "IC102",
        instructor: "Dr. Mariam Essam",
        room: "72 10",
        times: [
          { day: "Sunday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "IC102-02",
        courseCode: "IC102",
        instructor: "Dr. Hamad Zaki",
        room: "72 11",
        times: [
          { day: "Monday", start: "09:00", end: "09:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "IC102-03",
        courseCode: "IC102",
        instructor: "Prof. Sara Al-Wardi",
        room: "72 12",
        times: [
          { day: "Thursday", start: "11:00", end: "11:50" },
          { day: "Wednesday", start: "11:00", end: "11:50" },
        ],
      },
    ],
  },
  {
    code: "IC103",
    name: "Economic System in Islam",
    credits: 2,
    department: "Islamic Culture",
    level: 1,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-04-19", time: "12:00", duration: 60 },
      final: { date: "2025-06-14", time: "12:00", duration: 90 },
    },
    sections: [
      {
        id: "IC103-01",
        courseCode: "IC103",
        instructor: "Dr. Majed Ali",
        room: "73 01",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "IC103-02",
        courseCode: "IC103",
        instructor: "Dr. Nora Talal",
        room: "73 02",
        times: [
          { day: "Monday", start: "15:00", end: "15:50" },
          { day: "Tuesday", start: "15:00", end: "15:50" },
        ],
      },
      {
        id: "IC103-03",
        courseCode: "IC103",
        instructor: "Prof. Adel Fouad",
        room: "73 03",
        times: [
          { day: "Wednesday", start: "09:00", end: "09:50" },
          { day: "Friday", start: "09:00", end: "09:50" },
        ],
      },
    ],
  },
  {
    code: "MATH151",
    name: "Discrete Mathematics",
    credits: 3,
    department: "Mathematics",
    level: 2,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-10", time: "10:00", duration: 90 },
      midterm2: { date: "2025-04-14", time: "10:00", duration: 90 },
      final: { date: "2025-05-22", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH151-01",
        courseCode: "MATH151",
        instructor: "Dr. Khalid Omar",
        room: "31 11",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "MATH151-02",
        courseCode: "MATH151",
        instructor: "Dr. Lina Hussein",
        room: "31 12",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "12:50" },
        ],
      },
      {
        id: "MATH151-03",
        courseCode: "MATH151",
        instructor: "Dr. Tariq Al-Mutairi",
        room: "31 13",
        times: [
          { day: "Sunday", start: "08:00", end: "08:50" },
          { day: "Tuesday", start: "08:00", end: "08:50" },
        ],
      },
    ],
  },
  {
    code: "MATH106",
    name: "Integral Calculus",
    credits: 3,
    department: "Mathematics",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-15", time: "14:00", duration: 90 },
      midterm2: { date: "2025-04-20", time: "14:00", duration: 90 },
      final: { date: "2025-05-27", time: "10:00", duration: 120 },
    },
    sections: [
      {
        id: "MATH106-01",
        courseCode: "MATH106",
        instructor: "Dr. Jamal Nasser",
        room: "10 01",
        times: [
          { day: "Monday", start: "08:00", end: "08:50" },
          { day: "Wednesday", start: "08:00", end: "08:50" },
        ],
      },
      {
        id: "MATH106-02",
        courseCode: "MATH106",
        instructor: "Dr. Laila Fouad",
        room: "10 02",
        times: [
          { day: "Sunday", start: "11:00", end: "11:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "MATH106-03",
        courseCode: "MATH106",
        instructor: "Prof. Ali Zaki",
        room: "10 03",
        times: [
          { day: "Tuesday", start: "16:00", end: "16:50" },
          { day: "Thursday", start: "16:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "CISC111",
    name: "Computer Programming (1)",
    credits: 4,
    department: "Computer Science",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-18", time: "16:00", duration: 90 },
      final: { date: "2025-05-31", time: "13:00", duration: 120 },
    },
    sections: [
      {
        id: "CISC111-01",
        courseCode: "CISC111",
        instructor: "Dr. Mariam Yaser",
        room: "40 10",
        times: [
          { day: "Sunday", start: "10:00", end: "11:50" },
          { day: "Tuesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "CISC111-02",
        courseCode: "CISC111",
        instructor: "Dr. Waleed Talal",
        room: "40 11",
        times: [
          { day: "Monday", start: "09:00", end: "10:50" },
          { day: "Wednesday", start: "09:00", end: "10:50" },
        ],
      },
      {
        id: "CISC111-03",
        courseCode: "CISC111",
        instructor: "Mr. Talal Ghanem",
        room: "40 12",
        times: [
          { day: "Tuesday", start: "12:00", end: "13:50" },
          { day: "Thursday", start: "12:00", end: "13:50" },
        ],
      },
    ],
  },
  {
    code: "CSC380",
    name: "Artificial Intelligence",
    credits: 3,
    department: "Computer Science",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-04-05", time: "11:00", duration: 90 },
      final: { date: "2025-06-07", time: "11:00", duration: 120 },
    },
    sections: [
      {
        id: "CSC380-01",
        courseCode: "CSC380",
        instructor: "Dr. Majed Ali",
        room: "44 01",
        times: [
          { day: "Sunday", start: "15:00", end: "16:50" },
          { day: "Tuesday", start: "15:00", end: "15:50" },
        ],
      },
      {
        id: "CSC380-02",
        courseCode: "CSC380",
        instructor: "Dr. Nora Talal",
        room: "44 02",
        times: [
          { day: "Monday", start: "10:00", end: "11:50" },
          { day: "Wednesday", start: "10:00", end: "10:50" },
        ],
      },
      {
        id: "CSC380-03",
        courseCode: "CSC380",
        instructor: "Prof. Ahmad Zaki",
        room: "44 03",
        times: [
          { day: "Tuesday", start: "08:00", end: "09:50" },
          { day: "Thursday", start: "08:00", end: "08:50" },
        ],
      },
    ],
  },
  {
    code: "CEN340",
    name: "Embedded Systems",
    credits: 4,
    department: "Computer Engineering",
    level: 3,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-29", time: "13:00", duration: 90 },
      final: { date: "2025-06-01", time: "15:00", duration: 120 },
    },
    sections: [
      {
        id: "CEN340-01",
        courseCode: "CEN340",
        instructor: "Dr. Faisal Omar",
        room: "54 10",
        times: [
          { day: "Monday", start: "10:00", end: "11:50" },
          { day: "Wednesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "CEN340-02",
        courseCode: "CEN340",
        instructor: "Dr. Hajar Al-Jaber",
        room: "54 11",
        times: [
          { day: "Sunday", start: "14:00", end: "15:50" },
          { day: "Tuesday", start: "14:00", end: "15:50" },
        ],
      },
      {
        id: "CEN340-03",
        courseCode: "CEN340",
        instructor: "Prof. Tareq Said",
        room: "54 12",
        times: [
          { day: "Tuesday", start: "09:00", end: "10:50" },
          { day: "Thursday", start: "09:00", end: "10:50" },
        ],
      },
    ],
  },
  {
    code: "CEN421",
    name: "VLSI Design",
    credits: 3,
    department: "Computer Engineering",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-04-12", time: "17:00", duration: 90 },
      final: { date: "2025-06-09", time: "17:00", duration: 120 },
    },
    sections: [
      {
        id: "CEN421-01",
        courseCode: "CEN421",
        instructor: "Dr. Amal Hassan",
        room: "55 05",
        times: [
          { day: "Monday", start: "13:00", end: "14:50" },
          { day: "Wednesday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "CEN421-02",
        courseCode: "CEN421",
        instructor: "Dr. Nasser Hamad",
        room: "55 06",
        times: [
          { day: "Sunday", start: "11:00", end: "12:50" },
          { day: "Tuesday", start: "11:00", end: "11:50" },
        ],
      },
      {
        id: "CEN421-03",
        courseCode: "CEN421",
        instructor: "Prof. Zainab Ali",
        room: "55 07",
        times: [
          { day: "Tuesday", start: "16:00", end: "17:50" },
          { day: "Thursday", start: "16:00", end: "16:50" },
        ],
      },
    ],
  },
  {
    code: "IS430",
    name: "Knowledge Management",
    credits: 3,
    department: "Information Systems",
    level: 4,
    type: "ELECTIVE",
    exams: {
      midterm: { date: "2025-04-01", time: "09:00", duration: 90 },
      final: { date: "2025-06-05", time: "09:00", duration: 120 },
    },
    sections: [
      {
        id: "IS430-01",
        courseCode: "IS430",
        instructor: "Dr. Abdullah Saad",
        room: "64 01",
        times: [
          { day: "Monday", start: "08:00", end: "08:50" },
          { day: "Wednesday", start: "08:00", end: "09:50" },
        ],
      },
      {
        id: "IS430-02",
        courseCode: "IS430",
        instructor: "Dr. Mariam Yaser",
        room: "64 02",
        times: [
          { day: "Sunday", start: "13:00", end: "13:50" },
          { day: "Tuesday", start: "13:00", end: "14:50" },
        ],
      },
      {
        id: "IS430-03",
        courseCode: "IS430",
        instructor: "Prof. Waleed Talal",
        room: "64 03",
        times: [
          { day: "Tuesday", start: "16:00", end: "16:50" },
          { day: "Thursday", start: "16:00", end: "17:50" },
        ],
      },
    ],
  },
  {
    code: "IS461",
    name: "Information Security",
    credits: 3,
    department: "Information Systems",
    level: 4,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-04-09", time: "14:00", duration: 90 },
      final: { date: "2025-06-11", time: "14:00", duration: 120 },
    },
    sections: [
      {
        id: "IS461-01",
        courseCode: "IS461",
        instructor: "Dr. Haifa Saad",
        room: "65 10",
        times: [
          { day: "Sunday", start: "10:00", end: "10:50" },
          { day: "Tuesday", start: "10:00", end: "11:50" },
        ],
      },
      {
        id: "IS461-02",
        courseCode: "IS461",
        instructor: "Dr. Ziad Youssef",
        room: "65 11",
        times: [
          { day: "Monday", start: "12:00", end: "12:50" },
          { day: "Wednesday", start: "12:00", end: "13:50" },
        ],
      },
      {
        id: "IS461-03",
        courseCode: "IS461",
        instructor: "Prof. Reem Khalid",
        room: "65 12",
        times: [
          { day: "Tuesday", start: "08:00", end: "08:50" },
          { day: "Thursday", start: "08:00", end: "09:50" },
        ],
      },
    ],
  },
  {
    code: "PHY103",
    name: "General Physics (1)",
    credits: 4,
    department: "Physics",
    level: 1,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-22", time: "18:00", duration: 90 },
      midterm2: { date: "2025-04-26", time: "18:00", duration: 90 },
      final: { date: "2025-05-29", time: "14:00", duration: 120 },
    },
    sections: [
      {
        id: "PHY103-01",
        courseCode: "PHY103",
        instructor: "Dr. Lamia Tariq",
        room: "20 01",
        times: [
          { day: "Sunday", start: "09:00", end: "10:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "PHY103-02",
        courseCode: "PHY103",
        instructor: "Dr. Nael Majid",
        room: "20 02",
        times: [
          { day: "Monday", start: "13:00", end: "14:50" },
          { day: "Wednesday", start: "13:00", end: "13:50" },
        ],
      },
      {
        id: "PHY103-03",
        courseCode: "PHY103",
        instructor: "Prof. Rima Saud",
        room: "20 03",
        times: [
          { day: "Tuesday", start: "15:00", end: "16:50" },
          { day: "Thursday", start: "15:00", end: "15:50" },
        ],
      },
    ],
  },
  {
    code: "OPER122",
    name: "Introduction to Operations Research",
    credits: 3,
    department: "Operations Research",
    level: 2,
    type: "REQUIRED",
    exams: {
      midterm: { date: "2025-03-18", time: "09:00", duration: 90 },
      midterm2: { date: "2025-04-22", time: "09:00", duration: 90 },
      final: { date: "2025-05-26", time: "11:00", duration: 120 },
    },
    sections: [
      {
        id: "OPER122-01",
        courseCode: "OPER122",
        instructor: "Prof. Fadi Salim",
        room: "22 05",
        times: [
          { day: "Sunday", start: "09:00", end: "09:50" },
          { day: "Tuesday", start: "09:00", end: "09:50" },
          { day: "Thursday", start: "09:00", end: "09:50" },
        ],
      },
      {
        id: "OPER122-02",
        courseCode: "OPER122",
        instructor: "Dr. Mona Rashed",
        room: "22 06",
        times: [
          { day: "Monday", start: "14:00", end: "14:50" },
          { day: "Wednesday", start: "14:00", end: "14:50" },
          { day: "Sunday", start: "14:00", end: "14:50" },
        ],
      },
      {
        id: "OPER122-03",
        courseCode: "OPER122",
        instructor: "Prof. Adel Fouad",
        room: "22 07",
        times: [
          { day: "Tuesday", start: "10:00", end: "10:50" },
          { day: "Thursday", start: "10:00", end: "10:50" },
          { day: "Monday", start: "10:00", end: "10:50" },
        ],
      },
    ],
  },
];
