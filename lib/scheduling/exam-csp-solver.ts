/**
 * Exam Scheduling Constraint Satisfaction Problem (CSP) Solver
 * 
 * Implements a specialized CSP solver for scheduling final exams with:
 * - Student conflict avoidance (ABSOLUTE PRIORITY)
 * - Backtracking search with MCV and LCV heuristics
 * - Forward checking for constraint propagation
 * - Hard and Soft constraint handling
 */

// Exam Variable: A final exam session for a course
export interface ExamVariable {
  course_code: string;
  course_title?: string;
  duration_minutes: number;
  student_enrollment_count: number; // Total students enrolled across all sections
  instructor_id: string | null;
  course_level: number; // For load distribution
  has_lab_component?: boolean; // For finals follow-up constraint
}

// Exam Assignment: (Date, Time, Room) tuple
export interface ExamAssignment {
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:MM)
  room: string;
  duration_minutes: number;
}

// Student Enrollment Matrix: Maps student_id -> Set of course_codes
export type StudentEnrollmentMatrix = Map<string, Set<string>>;

// Exam Domain: all possible (Date, Time, Room) assignments
export type ExamDomain = ExamAssignment[];

// Exam CSP State
export interface ExamCSPState {
  assignments: Map<string, ExamAssignment>; // course_code -> assignment
  domains: Map<string, ExamDomain>; // course_code -> remaining domain
  unassigned: ExamVariable[];
  allVariables: ExamVariable[];
}

// Constraint check result
export interface ExamConstraintCheck {
  isValid: boolean;
  violationType?: string;
  message?: string;
  conflictingStudents?: string[]; // For student conflicts
}

// Soft constraint cost
export interface ExamSoftConstraintCost {
  studentLoadPenalty: number; // Multiple exams per day/3-day window
  courseLoadImbalance: number; // Distribution across exam window
  finalsFollowUp: number; // Theory before lab violations
  total: number;
}

// Exam CSP Solver Configuration
export interface ExamCSPSolverConfig {
  examDays: string[]; // Available exam dates (ISO format)
  examTimeSlots: string[]; // Available exam times (e.g., ['08:00', '13:00', '16:00'])
  examRooms: Array<{
    code: string;
    capacity: number;
    type: 'Lecture' | 'Lab' | 'Auditorium';
  }>;
  studentEnrollmentMatrix: StudentEnrollmentMatrix;
  maxBacktracks?: number;
  enableForwardChecking?: boolean;
  enableSoftConstraints?: boolean;
  softConstraintWeights?: {
    studentLoadPenalty: number;
    courseLoadImbalance: number;
    finalsFollowUp: number;
  };
  instructorPreferences?: Map<string, { preferredDays?: string[]; preferredTimes?: string[] }>;
}

// Default configuration
const DEFAULT_EXAM_CONFIG: Required<Omit<ExamCSPSolverConfig, 'examDays' | 'examTimeSlots' | 'examRooms' | 'studentEnrollmentMatrix'>> = {
  maxBacktracks: 50000, // Higher limit for exams (more critical)
  enableForwardChecking: true,
  enableSoftConstraints: true,
  softConstraintWeights: {
    studentLoadPenalty: 20, // High priority
    courseLoadImbalance: 10,
    finalsFollowUp: 5,
  },
  instructorPreferences: new Map(),
};

/**
 * Generate initial domain for an exam variable
 */
export function generateExamDomain(
  variable: ExamVariable,
  config: ExamCSPSolverConfig
): ExamDomain {
  const domain: ExamDomain = [];

  // Accept any room type - capacity will be checked as a hard constraint later
  // Just use all available rooms
  const suitableRooms = config.examRooms;

  for (const date of config.examDays) {
    for (const time of config.examTimeSlots) {
      // Add all available rooms
      for (const room of suitableRooms) {
        domain.push({
          date,
          time,
          room: room.code,
          duration_minutes: variable.duration_minutes,
        });
      }

      // Always add a "TBD" room option as fallback
      // This allows scheduling day/time even when no suitable room is available
      domain.push({
        date,
        time,
        room: 'TBD',
        duration_minutes: variable.duration_minutes,
      });
    }
  }

  return domain;
}

/**
 * Check if two exam time slots overlap
 */
function doExamTimesOverlap(
  date1: string,
  time1: string,
  duration1: number,
  date2: string,
  time2: string,
  duration2: number
): boolean {
  // Different dates = no overlap
  if (date1 !== date2) return false;

  // Check time overlap
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);

  const start1 = h1 * 60 + m1;
  const end1 = start1 + duration1;
  const start2 = h2 * 60 + m2;
  const end2 = start2 + duration2;

  return start1 < end2 && start2 < end1;
}

/**
 * Check hard constraints for an exam assignment
 */
export function checkExamHardConstraints(
  variable: ExamVariable,
  assignment: ExamAssignment,
  currentState: ExamCSPState,
  config: ExamCSPSolverConfig
): ExamConstraintCheck {
  // 1. Student Conflict Avoidance (ABSOLUTE PRIORITY)
  const conflictingStudents: string[] = [];

  for (const [courseCode, existingAssignment] of currentState.assignments.entries()) {
    if (courseCode === variable.course_code) continue;

    // Check if times overlap
    if (
      doExamTimesOverlap(
        existingAssignment.date,
        existingAssignment.time,
        existingAssignment.duration_minutes,
        assignment.date,
        assignment.time,
        assignment.duration_minutes
      )
    ) {
      // Find students enrolled in both courses
      for (const [studentId, enrolledCourses] of config.studentEnrollmentMatrix.entries()) {
        if (
          enrolledCourses.has(variable.course_code) &&
          enrolledCourses.has(courseCode)
        ) {
          conflictingStudents.push(studentId);
        }
      }
    }
  }

  if (conflictingStudents.length > 0) {
    return {
      isValid: false,
      violationType: 'student_conflict',
      message: `${conflictingStudents.length} students have conflicting exams`,
      conflictingStudents,
    };
  }

  // 2. Room Capacity Constraint (skip if room is TBD)
  if (assignment.room !== 'TBD') {
    const room = config.examRooms.find((r) => r.code === assignment.room);
    if (!room || room.capacity < variable.student_enrollment_count) {
      return {
        isValid: false,
        violationType: 'room_capacity',
        message: `Room ${assignment.room} capacity (${room?.capacity || 0}) is less than enrollment (${variable.student_enrollment_count})`,
      };
    }
  }

  // 3. Unique Exam Room Assignment (skip if room is TBD)
  if (assignment.room !== 'TBD') {
    for (const [, existingAssignment] of currentState.assignments.entries()) {
      // Also skip if existing assignment has TBD room
      if (existingAssignment.room === 'TBD') continue;

      if (
        existingAssignment.room === assignment.room &&
        doExamTimesOverlap(
          existingAssignment.date,
          existingAssignment.time,
          existingAssignment.duration_minutes,
          assignment.date,
          assignment.time,
          assignment.duration_minutes
        )
      ) {
        return {
          isValid: false,
          violationType: 'room_conflict',
          message: `Room ${assignment.room} already occupied at ${assignment.date} ${assignment.time}`,
        };
      }
    }
  }

  // 4. Instructor Constraint
  if (variable.instructor_id) {
    for (const [courseCode, existingAssignment] of currentState.assignments.entries()) {
      const existingVar = findExamVariableById(courseCode, currentState);
      if (
        existingVar?.instructor_id === variable.instructor_id &&
        doExamTimesOverlap(
          existingAssignment.date,
          existingAssignment.time,
          existingAssignment.duration_minutes,
          assignment.date,
          assignment.time,
          assignment.duration_minutes
        )
      ) {
        return {
          isValid: false,
          violationType: 'instructor_conflict',
          message: `Instructor already supervising exam at ${assignment.date} ${assignment.time}`,
        };
      }
    }
  }

  // 5. Level Conflict Constraint: Courses in the same level cannot conflict
  // This ensures that students taking courses at the same level don't have overlapping exams
  if (variable.course_level && variable.course_level > 0) {
    for (const [courseCode, existingAssignment] of currentState.assignments.entries()) {
      const existingVar = findExamVariableById(courseCode, currentState);
      if (
        existingVar?.course_level &&
        existingVar.course_level === variable.course_level &&
        existingVar.course_level > 0 &&
        doExamTimesOverlap(
          existingAssignment.date,
          existingAssignment.time,
          existingAssignment.duration_minutes,
          assignment.date,
          assignment.time,
          assignment.duration_minutes
        )
      ) {
        return {
          isValid: false,
          violationType: 'level_conflict',
          message: `Level ${variable.course_level} course already has exam at ${assignment.date} ${assignment.time}. Courses in the same level cannot conflict.`,
        };
      }
    }
  }

  // All constraints passed

  return { isValid: true };
}

/**
 * Find exam variable by course code
 */
function findExamVariableById(
  courseCode: string,
  state: ExamCSPState
): ExamVariable | undefined {
  return state.allVariables.find((v) => v.course_code === courseCode);
}

/**
 * Forward checking for exam CSP
 */
export function forwardCheckExam(
  assignedVariable: ExamVariable,
  assignment: ExamAssignment,
  state: ExamCSPState,
  config: ExamCSPSolverConfig
): { success: boolean; prunedDomains: Map<string, ExamDomain> } {
  if (!config.enableForwardChecking) {
    return { success: true, prunedDomains: new Map() };
  }

  const prunedDomains = new Map<string, ExamDomain>();

  for (const variable of state.unassigned) {
    if (variable.course_code === assignedVariable.course_code) continue;

    const currentDomain = state.domains.get(variable.course_code) || [];
    const prunedDomain: ExamDomain = [];

    for (const value of currentDomain) {
      // Create temporary state
      const tempState: ExamCSPState = {
        assignments: new Map(state.assignments),
        domains: new Map(state.domains),
        unassigned: [...state.unassigned],
        allVariables: state.allVariables,
      };
      tempState.assignments.set(assignedVariable.course_code, assignment);

      // Check constraints
      const check = checkExamHardConstraints(variable, value, tempState, config);
      if (check.isValid) {
        prunedDomain.push(value);
      }
    }

    prunedDomains.set(variable.course_code, prunedDomain);

    // If domain becomes empty, forward checking fails
    if (prunedDomain.length === 0) {
      return { success: false, prunedDomains };
    }
  }

  return { success: true, prunedDomains };
}

/**
 * Most Constrained Variable (MCV) heuristic for exams
 * Prioritize exams with largest enrollment (most constrained)
 */
export function selectExamMCV(state: ExamCSPState): ExamVariable | null {
  if (state.unassigned.length === 0) return null;

  let mcv: ExamVariable | null = null;
  let maxEnrollment = -1;
  let minDomainSize = Infinity;

  for (const variable of state.unassigned) {
    const domain = state.domains.get(variable.course_code) || [];

    // Prioritize by enrollment (larger = more constrained)
    // If enrollment is same, prefer smaller domain
    if (
      variable.student_enrollment_count > maxEnrollment ||
      (variable.student_enrollment_count === maxEnrollment && domain.length < minDomainSize)
    ) {
      maxEnrollment = variable.student_enrollment_count;
      minDomainSize = domain.length;
      mcv = variable;
    }
  }

  return mcv;
}

/**
 * Least Constraining Value (LCV) heuristic for exams
 * Order values by how many conflicts they create for remaining exams
 */
export function orderExamLCV(
  variable: ExamVariable,
  domain: ExamDomain,
  state: ExamCSPState,
  config: ExamCSPSolverConfig
): ExamDomain {
  if (!config.enableForwardChecking) {
    return domain;
  }

  const valueScores: Array<{ value: ExamAssignment; score: number }> = [];

  for (const value of domain) {
    let score = 0;

    // Count how many options remain for other exams after this assignment
    const tempState: ExamCSPState = {
      assignments: new Map(state.assignments),
      domains: new Map(state.domains),
      unassigned: [...state.unassigned],
      allVariables: state.allVariables,
    };
    tempState.assignments.set(variable.course_code, value);

    for (const otherVar of state.unassigned) {
      if (otherVar.course_code === variable.course_code) continue;

      const otherDomain = state.domains.get(otherVar.course_code) || [];
      for (const otherValue of otherDomain) {
        const check = checkExamHardConstraints(otherVar, otherValue, tempState, config);
        if (check.isValid) {
          score++;
        }
      }
    }

    valueScores.push({ value, score });
  }

  // Sort by score (descending) - higher score = less constraining
  valueScores.sort((a, b) => b.score - a.score);
  return valueScores.map((item) => item.value);
}

/**
 * Calculate soft constraint cost for exam schedule
 */
export function calculateExamSoftConstraintCost(
  state: ExamCSPState,
  config: ExamCSPSolverConfig
): ExamSoftConstraintCost {
  if (!config.enableSoftConstraints) {
    return {
      studentLoadPenalty: 0,
      courseLoadImbalance: 0,
      finalsFollowUp: 0,
      total: 0,
    };
  }

  const weights = config.softConstraintWeights || DEFAULT_EXAM_CONFIG.softConstraintWeights;

  // 1. Student Load Penalty (multiple exams per day/3-day window)
  const studentLoadPenalty = calculateStudentLoadPenalty(state, config, weights.studentLoadPenalty);

  // 2. Course Load Imbalance
  const courseLoadImbalance = calculateCourseLoadImbalance(state, config, weights.courseLoadImbalance);

  // 3. Finals Follow-up
  const finalsFollowUp = calculateFinalsFollowUp(state, config, weights.finalsFollowUp);

  const total = studentLoadPenalty + courseLoadImbalance + finalsFollowUp;

  return {
    studentLoadPenalty,
    courseLoadImbalance,
    finalsFollowUp,
    total,
  };
}

/**
 * Calculate student load penalty (multiple exams per day/3-day window)
 */
function calculateStudentLoadPenalty(
  state: ExamCSPState,
  config: ExamCSPSolverConfig,
  weight: number
): number {
  // Count exams per student per day and per 3-day window
  const studentDayCounts = new Map<string, Map<string, number>>(); // student_id -> date -> count
  const studentWindowCounts = new Map<string, number>(); // student_id -> count in 3-day windows

  for (const [courseCode, assignment] of state.assignments.entries()) {
    // Find students enrolled in this course
    for (const [studentId, enrolledCourses] of config.studentEnrollmentMatrix.entries()) {
      if (enrolledCourses.has(courseCode)) {
        // Count per day
        if (!studentDayCounts.has(studentId)) {
          studentDayCounts.set(studentId, new Map());
        }
        const dayCounts = studentDayCounts.get(studentId)!;
        dayCounts.set(assignment.date, (dayCounts.get(assignment.date) || 0) + 1);

        // Count in 3-day windows
        const assignmentDate = new Date(assignment.date);
        for (const [otherCourseCode, otherAssignment] of state.assignments.entries()) {
          if (courseCode === otherCourseCode) continue;
          if (!enrolledCourses.has(otherCourseCode)) continue;

          const otherDate = new Date(otherAssignment.date);
          const daysDiff = Math.abs(
            Math.floor((assignmentDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24))
          );

          if (daysDiff <= 2) {
            // Within 3-day window (0, 1, or 2 days apart)
            const earlierDate = assignment.date < otherAssignment.date ? assignment.date : otherAssignment.date;
            const key = `${studentId}-${earlierDate}`;
            studentWindowCounts.set(key, (studentWindowCounts.get(key) || 0) + 1);
          }
        }
      }
    }
  }

  let penalty = 0;

  // Penalize multiple exams per day
  for (const dayCounts of studentDayCounts.values()) {
    for (const count of dayCounts.values()) {
      if (count > 1) {
        penalty += (count - 1) * weight; // Penalty for each exam beyond first
      }
    }
  }

  // Penalize 3+ exams in 3-day window
  for (const count of studentWindowCounts.values()) {
    if (count >= 3) {
      penalty += (count - 2) * weight * 2; // Higher penalty for 3+ exams
    }
  }

  return penalty;
}

/**
 * Calculate course load imbalance (distribution across exam window)
 */
function calculateCourseLoadImbalance(
  state: ExamCSPState,
  config: ExamCSPSolverConfig,
  weight: number
): number {
  // Count exams per day
  const dayCounts = new Map<string, number>();
  for (const assignment of state.assignments.values()) {
    dayCounts.set(assignment.date, (dayCounts.get(assignment.date) || 0) + 1);
  }

  if (dayCounts.size === 0) return 0;

  // Calculate variance
  const counts = Array.from(dayCounts.values());
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance =
    counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;

  return variance * weight;
}

/**
 * Calculate finals follow-up penalty (theory before lab)
 */
function calculateFinalsFollowUp(
  state: ExamCSPState,
  config: ExamCSPSolverConfig,
  weight: number
): number {
  let violations = 0;

  // Find courses with lab components
  const labCourses = state.allVariables.filter((v) => v.has_lab_component);
  const theoryCourses = state.allVariables.filter((v) => !v.has_lab_component);

  for (const labCourse of labCourses) {
    const labAssignment = state.assignments.get(labCourse.course_code);
    if (!labAssignment) continue;

    // Find corresponding theory course (same course code prefix, different activity)
    // This is simplified - in reality, you'd need to track course relationships
    const labDate = new Date(labAssignment.date);

    // Check if any theory exam for same course is scheduled after lab
    for (const theoryCourse of theoryCourses) {
      // Simplified: assume same course code means related
      if (theoryCourse.course_code.startsWith(labCourse.course_code.split(' ')[0])) {
        const theoryAssignment = state.assignments.get(theoryCourse.course_code);
        if (theoryAssignment) {
          const theoryDate = new Date(theoryAssignment.date);
          if (theoryDate > labDate) {
            violations++;
          }
        }
      }
    }
  }

  return violations * weight;
}

/**
 * Backtracking search for exam CSP
 */
export function backtrackExamSearch(
  state: ExamCSPState,
  config: Required<Omit<ExamCSPSolverConfig, 'examDays' | 'examTimeSlots' | 'examRooms' | 'studentEnrollmentMatrix'>> & {
    examDays: string[];
    examTimeSlots: string[];
    examRooms: ExamCSPSolverConfig['examRooms'];
    studentEnrollmentMatrix: StudentEnrollmentMatrix;
  },
  onProgress?: (state: ExamCSPState, backtracks: number) => void
): { success: boolean; finalState: ExamCSPState; backtracks: number } {
  let backtracks = 0;
  const maxBacktracks = config.maxBacktracks;

  function backtrack(currentState: ExamCSPState): ExamCSPState | null {
    // Base case: all exams assigned
    if (currentState.unassigned.length === 0) {
      return currentState;
    }

    // Check backtrack limit
    if (backtracks >= maxBacktracks) {
      return null;
    }

    // Select variable using MCV heuristic
    const variable = selectExamMCV(currentState);
    if (!variable) return currentState;

    // Get domain for this variable
    let domain = currentState.domains.get(variable.course_code) || [];
    if (domain.length === 0) {
      backtracks++;
      return null; // Dead end
    }

    // Order domain using LCV heuristic
    domain = orderExamLCV(variable, domain, currentState, config);

    // Try each value in domain
    for (const value of domain) {
      // Check hard constraints
      const constraintCheck = checkExamHardConstraints(
        variable,
        value,
        currentState,
        config
      );

      if (!constraintCheck.isValid) {
        continue; // Skip invalid assignment
      }

      // Make assignment
      const newState: ExamCSPState = {
        assignments: new Map(currentState.assignments),
        domains: new Map(currentState.domains),
        unassigned: currentState.unassigned.filter(
          (v) => v.course_code !== variable.course_code
        ),
        allVariables: currentState.allVariables,
      };
      newState.assignments.set(variable.course_code, value);

      // Forward checking
      if (config.enableForwardChecking) {
        const fcResult = forwardCheckExam(variable, value, newState, config);
        if (!fcResult.success) {
          backtracks++;
          continue; // Forward checking failed
        }

        // Update domains with pruned values
        for (const [courseCode, prunedDomain] of fcResult.prunedDomains.entries()) {
          newState.domains.set(courseCode, prunedDomain);
        }
      }

      // Recursive call
      const result = backtrack(newState);
      if (result) {
        return result;
      }

      backtracks++;
    }

    return null; // No solution found
  }

  const result = backtrack(state);
  if (onProgress) {
    onProgress(state, backtracks);
  }

  return {
    success: result !== null,
    finalState: result || state,
    backtracks,
  };
}

/**
 * Main exam CSP solver function
 */
export async function solveExamCSP(
  examVariables: ExamVariable[],
  config: ExamCSPSolverConfig,
  onProgress?: (progress: {
    assigned: number;
    total: number;
    backtracks: number;
    currentVariable?: string;
  }) => void
): Promise<{
  success: boolean;
  assignments: Map<string, ExamAssignment>;
  unassigned: Array<{
    course_code: string;
    reason: string;
  }>;
  stats: {
    total_exams: number;
    assigned: number;
    unassigned: number;
    backtracks: number;
    softConstraintCost?: ExamSoftConstraintCost;
  };
}> {
  const finalConfig = {
    ...DEFAULT_EXAM_CONFIG,
    ...config,
    softConstraintWeights: {
      ...DEFAULT_EXAM_CONFIG.softConstraintWeights,
      ...config.softConstraintWeights,
    },
    instructorPreferences: config.instructorPreferences || new Map(),
  };

  // Initialize CSP state
  const state: ExamCSPState = {
    assignments: new Map(),
    domains: new Map(),
    unassigned: [...examVariables],
    allVariables: [...examVariables],
  };

  // Generate initial domains for all exams
  for (const variable of examVariables) {
    const domain = generateExamDomain(variable, config);
    state.domains.set(variable.course_code, domain);
  }

  // Run backtracking search
  type RequiredConfig = Required<Omit<ExamCSPSolverConfig, 'examDays' | 'examTimeSlots' | 'examRooms' | 'studentEnrollmentMatrix'>> & {
    examDays: string[];
    examTimeSlots: string[];
    examRooms: ExamCSPSolverConfig['examRooms'];
    studentEnrollmentMatrix: StudentEnrollmentMatrix;
  };
  const searchResult = backtrackExamSearch(
    state,
    finalConfig as RequiredConfig,
    (currentState, backtracks) => {
      if (onProgress) {
        onProgress({
          assigned: currentState.assignments.size,
          total: examVariables.length,
          backtracks,
          currentVariable: selectExamMCV(currentState)?.course_code,
        });
      }
    }
  );

  // Build result
  const unassigned: Array<{ course_code: string; reason: string }> = [];

  for (const variable of examVariables) {
    const assignment = searchResult.finalState.assignments.get(variable.course_code);
    if (!assignment) {
      const domain = searchResult.finalState.domains.get(variable.course_code) || [];
      unassigned.push({
        course_code: variable.course_code,
        reason:
          domain.length === 0
            ? 'No valid assignments available (domain exhausted)'
            : 'Could not find conflict-free assignment',
      });
    }
  }

  // Calculate soft constraint cost if enabled
  let softConstraintCost: ExamSoftConstraintCost | undefined;
  if (finalConfig.enableSoftConstraints && searchResult.success) {
    softConstraintCost = calculateExamSoftConstraintCost(
      searchResult.finalState,
      config
    );
  }

  return {
    success: searchResult.success && unassigned.length === 0,
    assignments: searchResult.finalState.assignments,
    unassigned,
    stats: {
      total_exams: examVariables.length,
      assigned: searchResult.finalState.assignments.size,
      unassigned: unassigned.length,
      backtracks: searchResult.backtracks,
      softConstraintCost,
    },
  };
}

