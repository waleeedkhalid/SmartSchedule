/**
 * Schedule Generator for SmartSchedule
 * Generates schedules for students based on level and available sections
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Student {
  id: string;
  level: number;
}

export interface Section {
  id: string;
  course_code: string;
  instructor_id: string | null;
  room_number: string | null;
  capacity: number;
  enrolled_count: number;
  times: Array<{
    day: string;
    start: string;
    end: string;
  }>;
}

export interface GeneratedSchedule {
  student_id: string;
  sections: Section[];
  statistics: {
    total_credits: number;
    total_courses: number;
    conflicts: number;
  };
  warnings: string[];
}

export interface OptimizationResult {
  schedules: GeneratedSchedule[];
  iterations: number;
  finalBalance: number;
}

export interface BalanceResult {
  balanced: boolean;
  maxEnrollment: number;
  minEnrollment: number;
  variance: number;
}

// ============================================================================
// Core Schedule Generation
// ============================================================================

/**
 * Generate schedule for a student based on level
 */
export function generateScheduleForStudent(
  student: Student,
  availableSections: Section[]
): GeneratedSchedule {
  const warnings: string[] = [];
  const assignedSections: Section[] = [];
  
  // Get required courses for student level
  const requiredCourses = getRequiredCoursesForLevel(student.level);
  
  // Try to assign each required course
  requiredCourses.forEach(courseCode => {
    const courseSections = availableSections.filter(s => s.course_code === courseCode);
    
    if (courseSections.length === 0) {
      warnings.push(`No sections available for required course: ${courseCode}`);
      return;
    }
    
    // Find section with available capacity
    const availableSection = courseSections.find(
      s => s.enrolled_count < s.capacity
    );
    
    if (!availableSection) {
      warnings.push(`All sections full for course: ${courseCode}`);
      return;
    }
    
    // Check for time conflicts
    const hasConflict = assignedSections.some(assigned =>
      sectionsConflict(assigned, availableSection)
    );
    
    if (!hasConflict) {
      assignedSections.push(availableSection);
    } else {
      warnings.push(`Time conflict prevents assignment of ${courseCode}`);
    }
  });
  
  // Calculate statistics
  const totalCredits = assignedSections.length * 3; // Assuming 3 credits per course
  const conflicts = warnings.filter(w => w.includes('conflict')).length;
  
  return {
    student_id: student.id,
    sections: assignedSections,
    statistics: {
      total_credits: totalCredits,
      total_courses: assignedSections.length,
      conflicts,
    },
    warnings,
  };
}

/**
 * Generate schedules for multiple students
 */
export function generateSchedulesForStudents(
  students: Student[],
  availableSections: Section[]
): GeneratedSchedule[] {
  return students.map(student => generateScheduleForStudent(student, availableSections));
}

/**
 * Generate optimized schedules with load balancing
 */
export function generateOptimizedSchedules(
  students: Student[],
  availableSections: Section[],
  maxIterations: number = 10
): OptimizationResult {
  let bestSchedules = generateSchedulesForStudents(students, availableSections);
  let bestBalance = balanceSectionEnrollment(bestSchedules);
  let iterations = 1;
  
  // Try to improve balance through iterations
  for (let i = 1; i < maxIterations; i++) {
    // Simple optimization: shuffle student order
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const newSchedules = generateSchedulesForStudents(shuffledStudents, availableSections);
    const newBalance = balanceSectionEnrollment(newSchedules);
    
    if (newBalance.variance < bestBalance.variance) {
      bestSchedules = newSchedules;
      bestBalance = newBalance;
      iterations = i + 1;
    }
    
    // Stop if well balanced
    if (bestBalance.balanced) {
      break;
    }
  }
  
  return {
    schedules: bestSchedules,
    iterations,
    finalBalance: bestBalance.variance,
  };
}

// ============================================================================
// Enrollment Balancing
// ============================================================================

/**
 * Balance section enrollment across multiple sections
 */
export function balanceSectionEnrollment(
  schedules: GeneratedSchedule[]
): BalanceResult {
  const enrollmentCounts = new Map<string, number>();
  
  // Count enrollments per section
  schedules.forEach(schedule => {
    schedule.sections.forEach(section => {
      const current = enrollmentCounts.get(section.id) || 0;
      enrollmentCounts.set(section.id, current + 1);
    });
  });
  
  const counts = Array.from(enrollmentCounts.values());
  
  if (counts.length === 0) {
    return { balanced: true, maxEnrollment: 0, minEnrollment: 0, variance: 0 };
  }
  
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  
  // Consider balanced if variance is low
  const balanced = variance < 5;
  
  return {
    balanced,
    maxEnrollment: max,
    minEnrollment: min,
    variance: Math.sqrt(variance),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get required courses for a level
 */
function getRequiredCoursesForLevel(level: number): string[] {
  const coursesByLevel: Record<number, string[]> = {
    1: ['SWE101', 'SWE102'],
    2: ['SWE201'],
    3: ['SWE301'],
    4: [],
    5: [],
  };
  
  return coursesByLevel[level] || [];
}

/**
 * Check if two sections have time conflicts
 */
function sectionsConflict(section1: Section, section2: Section): boolean {
  for (const time1 of section1.times) {
    for (const time2 of section2.times) {
      if (time1.day === time2.day) {
        if (timeOverlaps(time1.start, time1.end, time2.start, time2.end)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Check if two time ranges overlap
 */
function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && start2 < end1;
}
