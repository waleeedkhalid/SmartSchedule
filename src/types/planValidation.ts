import { electivePackages, PlanCourse } from "./electives";

export interface SemesterPlan {
  key: string; // e.g. L3, L4...
  label: string; // label like "Third"
  courses: PlanCourse[];
}

interface CourseWithSemester extends PlanCourse {
  semesterIndex: number;
}

type CourseMap = Map<string, CourseWithSemester>;

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function createCourseMap(plan: SemesterPlan[]): CourseMap {
  const courseMap = new Map<string, CourseWithSemester>();

  plan.forEach((semester, semesterIndex) => {
    semester.courses.forEach((course) => {
      courseMap.set(course.code, {
        ...course,
        semesterIndex,
      });
    });
  });

  return courseMap;
}

function validatePrerequisites(
  course: PlanCourse,
  courseSemesterIndex: number,
  courseMap: CourseMap,
  errors: string[]
): void {
  if (!course.prerequisites) return;

  course.prerequisites.forEach((prereqCode) => {
    const prereq = courseMap.get(prereqCode);
    if (!prereq) {
      errors.push(
        `Prerequisite course ${prereqCode} for ${course.code} not found in the plan`
      );
      return;
    }

    if (prereq.semesterIndex >= courseSemesterIndex) {
      errors.push(
        `Prerequisite ${prereqCode} for ${course.code} is not in an earlier semester ` +
          `(prereq in semester ${prereq.semesterIndex + 1}, course in ${
            courseSemesterIndex + 1
          })`
      );
    }
  });
}

function validateCorequisites(
  course: PlanCourse,
  courseSemesterIndex: number,
  courseMap: CourseMap,
  warnings: string[]
): void {
  if (!course.corequisites) return;

  course.corequisites.forEach((coreqCode) => {
    const coreq = courseMap.get(coreqCode);
    if (!coreq) {
      warnings.push(
        `Corequisite course ${coreqCode} for ${course.code} not found in the plan`
      );
      return;
    }

    if (coreq.semesterIndex > courseSemesterIndex) {
      warnings.push(
        `Corequisite ${coreqCode} for ${course.code} is in a later semester ` +
          `(coreq in semester ${coreq.semesterIndex + 1}, course in ${
            courseSemesterIndex + 1
          })`
      );
    }
  });
}

function validateElectives(
  selectedElectives: string[],
  errors: string[]
): void {
  const statuses = electivePackages.map((pkg) => {
    const selectedHours = pkg.courses
      .filter((c) => selectedElectives.includes(c.code))
      .reduce((sum, c) => sum + c.hours, 0);

    return { pkg, selectedHours };
  });

  statuses.forEach(({ pkg, selectedHours }) => {
    if (selectedHours < pkg.minHours) {
      errors.push(
        `Elective package "${pkg.label}" requires at least ${pkg.minHours} hours, ` +
          `but only ${selectedHours} hours are selected`
      );
    }

    if (selectedHours > pkg.maxHours) {
      errors.push(
        `Elective package "${pkg.label}" allows at most ${pkg.maxHours} hours, ` +
          `but ${selectedHours} hours are selected`
      );
    }
  });
}

export function validatePlan(
  plan: SemesterPlan[],
  selectedElectives: string[] = []
): ValidationResult {
  const result: ValidationResult = {
    errors: [],
    warnings: [],
  };

  const courseMap = createCourseMap(plan);

  // Validate all courses in the plan
  plan.forEach((semester, semesterIndex) => {
    semester.courses.forEach((course) => {
      validatePrerequisites(course, semesterIndex, courseMap, result.errors);
      validateCorequisites(course, semesterIndex, courseMap, result.warnings);
    });
  });

  // Validate electives if provided
  if (selectedElectives.length > 0) {
    validateElectives(selectedElectives, result.errors);
  }

  return result;
}
