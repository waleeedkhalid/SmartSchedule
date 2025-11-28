/**
 * Irregular Student Validator
 * Validates irregular student requirements and constraints
 * 
 * BUSINESS RULES:
 * - Irregular students must complete courses from previous levels
 * - Must check prerequisites
 * - Must enforce credit hour limits
 * - Must ensure teaching load changes don't affect irregular students
 */

export interface IrregularStudentInfo {
  student_id: string;
  current_level: number;
  missing_courses: string[]; // From previous levels
  current_credit_hours: number;
  max_credit_hours: number;
}

export interface CoursePrerequisite {
  course_code: string;
  prerequisites: string[];
}

export interface IrregularStudentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingPrerequisites: string[];
}

/**
 * Validate required courses from previous levels
 */
export function validateMissingCourses(
  studentInfo: IrregularStudentInfo,
  scheduledCourses: string[]
): IrregularStudentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if all missing courses are scheduled
  const unscheduledCourses = studentInfo.missing_courses.filter(
    course => !scheduledCourses.includes(course)
  );
  
  if (unscheduledCourses.length > 0) {
    errors.push(
      `Missing required courses from previous levels: ${unscheduledCourses.join(', ')}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingPrerequisites: unscheduledCourses,
  };
}

/**
 * Validate prerequisites for courses
 */
export function validatePrerequisites(
  plannedCourses: string[],
  completedCourses: string[],
  prerequisites: CoursePrerequisite[]
): IrregularStudentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingPrerequisites: string[] = [];
  
  plannedCourses.forEach(courseCode => {
    const coursePrereq = prerequisites.find(p => p.course_code === courseCode);
    
    if (coursePrereq) {
      const missing = coursePrereq.prerequisites.filter(
        prereq => !completedCourses.includes(prereq)
      );
      
      if (missing.length > 0) {
        errors.push(
          `Course ${courseCode} requires prerequisite(s): ${missing.join(', ')}`
        );
        missingPrerequisites.push(...missing);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingPrerequisites: [...new Set(missingPrerequisites)],
  };
}

/**
 * Validate credit hour limits
 */
export function validateCreditHourLimit(
  studentInfo: IrregularStudentInfo,
  additionalCredits: number = 0
): IrregularStudentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const totalCredits = studentInfo.current_credit_hours + additionalCredits;
  
  if (totalCredits > studentInfo.max_credit_hours) {
    errors.push(
      `Credit hour limit exceeded: ${totalCredits}/${studentInfo.max_credit_hours}`
    );
  }
  
  // Warning if approaching limit (within 3 credits)
  if (totalCredits > studentInfo.max_credit_hours - 3 && totalCredits <= studentInfo.max_credit_hours) {
    warnings.push(
      `Approaching credit hour limit: ${totalCredits}/${studentInfo.max_credit_hours}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingPrerequisites: [],
  };
}

/**
 * Comprehensive validation for irregular students
 */
export function validateIrregularStudent(
  studentInfo: IrregularStudentInfo,
  scheduledCourses: string[],
  completedCourses: string[],
  prerequisites: CoursePrerequisite[],
  additionalCredits: number = 0
): IrregularStudentValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allMissingPrereqs: string[] = [];
  
  // Validate missing courses
  const missingResult = validateMissingCourses(studentInfo, scheduledCourses);
  allErrors.push(...missingResult.errors);
  allWarnings.push(...missingResult.warnings);
  allMissingPrereqs.push(...missingResult.missingPrerequisites);
  
  // Validate prerequisites
  const prereqResult = validatePrerequisites(scheduledCourses, completedCourses, prerequisites);
  allErrors.push(...prereqResult.errors);
  allWarnings.push(...prereqResult.warnings);
  allMissingPrereqs.push(...prereqResult.missingPrerequisites);
  
  // Validate credit hour limit
  const creditResult = validateCreditHourLimit(studentInfo, additionalCredits);
  allErrors.push(...creditResult.errors);
  allWarnings.push(...creditResult.warnings);
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingPrerequisites: [...new Set(allMissingPrereqs)],
  };
}

