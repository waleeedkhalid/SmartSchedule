/**
 * Elective Packages Mapping
 * 
 * Maps elective courses to their respective packages/groups.
 * These courses should be filtered out of the main semester view
 * and displayed in the "Elective Packages" section instead.
 * 
 * Data source: swe_plan.json
 */

export interface ElectivePackageCourse {
  code: string;
  title: string;
  credit_hours: number;
  prerequisite?: string;
}

export interface ElectivePackage {
  group_name: string;
  required_credit_hours: number;
  courses: ElectivePackageCourse[];
}

/**
 * Elective Packages Configuration
 * 
 * These courses belong to specific elective groups where students
 * must choose a certain number of credits from the available options.
 */
export const ELECTIVE_PACKAGES: ElectivePackage[] = [
  {
    group_name: "Department Electives",
    required_credit_hours: 9,
    courses: [
      { code: "SWE 481", title: "Advanced Web Applications Engineering", credit_hours: 3, prerequisite: "SWE 312, SWE 381" },
      { code: "SWE 483", title: "Mobile Application Development", credit_hours: 3, prerequisite: "CSC 113" },
      { code: "SWE 484", title: "Multimedia Computing", credit_hours: 3, prerequisite: "SWE 314" },
      { code: "SWE 485", title: "Selected Topics in Software Engineering", credit_hours: 3 },
      { code: "SWE 486", title: "Cloud Computing and Big Data", credit_hours: 3, prerequisite: "CEN 303, IS 230" },
      { code: "SWE 488", title: "Complex Systems Engineering", credit_hours: 3 },
      { code: "CEN 316", title: "Computer Architecture", credit_hours: 3, prerequisite: "CSC 220" },
      { code: "CEN 445", title: "Network Protocols & Algorithms", credit_hours: 3, prerequisite: "CEN 303" },
      { code: "CEN 318", title: "Embedded Systems Design", credit_hours: 3, prerequisite: "CEN 303" },
      { code: "CSC 215", title: "Procedural Language", credit_hours: 3, prerequisite: "CSC 111" },
      { code: "CSC 311", title: "Algorithms", credit_hours: 3, prerequisite: "CSC 212" },
      { code: "CSC 361", title: "Artificial Intelligence", credit_hours: 3, prerequisite: "CSC 212" },
      { code: "CSC 476", title: "Computer Graphics", credit_hours: 3, prerequisite: "CSC 212" },
      { code: "CSC 478", title: "Digital Image Processing", credit_hours: 3, prerequisite: "CSC 361" },
      { code: "IS 385", title: "Enterprise Resource Planning Systems", credit_hours: 3, prerequisite: "IS 230" },
      { code: "IS 485", title: "ERP Systems Lab", credit_hours: 3, prerequisite: "IS 385" }
    ]
  },
  {
    group_name: "Math and Statistics Electives",
    required_credit_hours: 6,
    courses: [
      { code: "MATH 200", title: "Differential and Integral Calculus", credit_hours: 3, prerequisite: "MATH 106" },
      { code: "MATH 254", title: "Numerical Analysis", credit_hours: 3, prerequisite: "MATH 244" },
      { code: "OPER 122", title: "Introduction to Operations Research", credit_hours: 3 }
    ]
  },
  {
    group_name: "General Science Electives",
    required_credit_hours: 3,
    courses: [
      { code: "BIOL 145", title: "Biology", credit_hours: 3 },
      { code: "BCH 101", title: "General Biochemistry", credit_hours: 4 },
      { code: "MIC 140", title: "General Microbiology", credit_hours: 3 },
      { code: "GPH 201", title: "Principles of Geophysics", credit_hours: 3 },
      { code: "PHYS 201", title: "Mathematical Physics I", credit_hours: 3 }
    ]
  },
  {
    group_name: "University Requirements Electives",
    required_credit_hours: 4,
    courses: [
      { code: "QURN 100", title: "The Holy Quran", credit_hours: 2 },
      { code: "IC 100", title: "Studies in the Prophet Biography", credit_hours: 2 },
      { code: "IC 101", title: "Principles of Islamic Culture", credit_hours: 2 },
      { code: "IC 102", title: "Family in Islam", credit_hours: 2 },
      { code: "IC 103", title: "Economic System in Islam", credit_hours: 2 },
      { code: "IC 104", title: "Islamic Political System", credit_hours: 2 },
      { code: "IC 105", title: "Human Rights", credit_hours: 2 },
      { code: "IC 106", title: "Medical Jurisprudence", credit_hours: 2 }
    ]
  }
];

/**
 * Get all course codes that belong to elective packages
 * Used to filter these courses out of the main semester view
 */
export function getElectivePackageCourseCodes(): Set<string> {
  const courseCodes = new Set<string>();
  ELECTIVE_PACKAGES.forEach((pkg) => {
    pkg.courses.forEach((course) => {
      courseCodes.add(course.code);
    });
  });
  return courseCodes;
}

/**
 * Check if a course code belongs to an elective package
 */
export function isElectivePackageCourse(courseCode: string): boolean {
  return getElectivePackageCourseCodes().has(courseCode);
}

/**
 * Get the package that contains a specific course code
 */
export function getPackageForCourse(courseCode: string): ElectivePackage | null {
  for (const pkg of ELECTIVE_PACKAGES) {
    if (pkg.courses.some((course) => course.code === courseCode)) {
      return pkg;
    }
  }
  return null;
}

/**
 * Get all packages with course completion status
 */
export function getPackagesWithCompletion(
  completedCourseCodes: Set<string>
): Array<ElectivePackage & { completedCourses: string[]; completedCredits: number }> {
  return ELECTIVE_PACKAGES.map((pkg) => {
    const completedCourses = pkg.courses
      .filter((course) => completedCourseCodes.has(course.code))
      .map((course) => course.code);
    
    const completedCredits = pkg.courses
      .filter((course) => completedCourseCodes.has(course.code))
      .reduce((sum, course) => sum + course.credit_hours, 0);

    return {
      ...pkg,
      completedCourses,
      completedCredits,
    };
  });
}

