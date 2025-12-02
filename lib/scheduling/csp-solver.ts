/**
 * Constraint Satisfaction Problem (CSP) Solver for Schedule Generation
 *
 * Implements a backtracking search algorithm with:
 * - Most Constrained Variable (MCV) heuristic
 * - Least Constraining Value (LCV) heuristic
 * - Forward Checking for constraint propagation
 * - Hard and Soft constraint handling
 * - Instructor auto-assignment with load balancing
 */

import type { SchedulingInput, SectionAssignment, TimeSlot } from "./algorithm";

// Instructor types for auto-assignment
export interface InstructorForAssignment {
  id: string;
  name: string;
  email: string | null;
  max_load_per_week: number | null;
  unavailable_times: Array<{
    day: string;
    slots: Array<{ start: string; end: string; type: string }>;
  }> | null;
  current_load: number; // Current number of assigned sections/hours
}

// Result of instructor assignment
export interface InstructorAssignmentResult {
  section_id: string;
  instructor_id: string | null;
  instructor_name: string | null;
  success: boolean;
  reason?: string;
}

// CSP Variable: A section that needs to be scheduled
export interface CSPVariable {
  section_id: string;
  course_code: string;
  section_no: string;
  instructor_id: string | null;
  capacity: number;
  group_level: number;
  activity: "lecture" | "tutorial" | "lab";
  weekly_hours: number;
  room_code: string | null; // Pre-assigned room if any
}

// CSP Assignment: (Day, Time, Room) tuple
export interface CSPAssignment {
  day: string;
  time: string;
  room: string;
  duration: number;
}

// External Schedule Entry (pre-scheduled courses from other departments)
export interface ExternalScheduleEntry {
  course_id: string;
  day: string;
  time: string;
  room: string;
  capacity: number;
}

// Domain for a variable: all possible (Day, Time, Room) assignments
export type Domain = CSPAssignment[];

// CSP State: current assignments and remaining domains
export interface CSPState {
  assignments: Map<string, CSPAssignment>; // variable_id -> assignment
  domains: Map<string, Domain>; // variable_id -> remaining domain
  unassigned: CSPVariable[];
  allVariables: CSPVariable[]; // All variables for lookup
}

// Constraint violation result
export interface ConstraintCheck {
  isValid: boolean;
  violationType?: string;
  message?: string;
}

// Soft constraint cost
export interface SoftConstraintCost {
  studentGaps: number;
  loadImbalance: number;
  roomProximity: number;
  instructorPreference: number;
  total: number;
}

// CSP Solver Configuration
export interface CSPSolverConfig {
  maxBacktracks?: number;
  enableForwardChecking?: boolean;
  enableSoftConstraints?: boolean;
  softConstraintWeights?: {
    studentGaps: number;
    loadImbalance: number;
    roomProximity: number;
    instructorPreference: number;
  };
  externalSchedules?: ExternalScheduleEntry[];
  instructorPreferences?: Map<
    string,
    { preferredDays?: string[]; preferredTimes?: string[] }
  >;
}

// Default configuration
const DEFAULT_CONFIG: Required<CSPSolverConfig> = {
  maxBacktracks: 10000,
  enableForwardChecking: true,
  enableSoftConstraints: true,
  softConstraintWeights: {
    studentGaps: 10,
    loadImbalance: 8,
    roomProximity: 5,
    instructorPreference: 3,
  },
  externalSchedules: [],
  instructorPreferences: new Map(),
};

/**
 * Generate initial domain for a variable
 */
export function generateDomain(
  variable: CSPVariable,
  rooms: SchedulingInput["rooms"],
  timeSlots: TimeSlot[],
  config: CSPSolverConfig
): Domain {
  const domain: Domain = [];
  const suitableRooms = rooms.filter((room) => {
    // Room type matching
    if (variable.activity === "lab" && room.type !== "Lab") return false;
    if (variable.activity !== "lab" && room.type !== "Lecture") return false;
    // Capacity constraint
    if (room.capacity < variable.capacity) return false;
    return true;
  });

  // If variable has pre-assigned room, filter to that room only
  const availableRooms = variable.room_code
    ? suitableRooms.filter((r) => r.code === variable.room_code)
    : suitableRooms;

  for (const timeSlot of timeSlots) {
    // Handle time slots that may have multiple days (e.g., Sunday, Tuesday)
    // For CSP, we create separate assignments for each day in the pattern
    for (const day of timeSlot.days) {
      for (const room of availableRooms) {
        // Check external schedule conflicts
        const conflictsWithExternal = config.externalSchedules?.some(
          (ext) =>
            ext.day === day &&
            ext.time === timeSlot.start_time &&
            ext.room === room.code
        );

        if (!conflictsWithExternal) {
          domain.push({
            day,
            time: timeSlot.start_time,
            room: room.code,
            duration: timeSlot.duration,
          });
        }
      }
    }
  }

  return domain;
}

/**
 * Check hard constraints for an assignment
 */
export function checkHardConstraints(
  variable: CSPVariable,
  assignment: CSPAssignment,
  currentState: CSPState,
  config: CSPSolverConfig
): ConstraintCheck {
  // 1. External Schedule Conflict (HARD)
  const externalConflict = config.externalSchedules?.some(
    (ext) =>
      ext.day === assignment.day &&
      ext.time === assignment.time &&
      ext.room === assignment.room
  );
  if (externalConflict) {
    return {
      isValid: false,
      violationType: "external_schedule",
      message: `Conflicts with external schedule: ${assignment.day} ${assignment.time} ${assignment.room}`,
    };
  }

  // 2. Room Conflict (HARD)
  for (const [, existingAssignment] of currentState.assignments.entries()) {
    if (
      existingAssignment.room === assignment.room &&
      existingAssignment.day === assignment.day &&
      doTimeSlotsOverlap(
        existingAssignment.time,
        existingAssignment.duration,
        assignment.time,
        assignment.duration
      )
    ) {
      return {
        isValid: false,
        violationType: "room_conflict",
        message: `Room ${assignment.room} already occupied at ${assignment.day} ${assignment.time}`,
      };
    }
  }

  // 3. Instructor Conflict (HARD)
  if (variable.instructor_id) {
    for (const [
      varId,
      existingAssignment,
    ] of currentState.assignments.entries()) {
      const existingVar = findVariableById(varId, currentState);
      if (
        existingVar?.instructor_id === variable.instructor_id &&
        existingAssignment.day === assignment.day &&
        doTimeSlotsOverlap(
          existingAssignment.time,
          existingAssignment.duration,
          assignment.time,
          assignment.duration
        )
      ) {
        return {
          isValid: false,
          violationType: "instructor_conflict",
          message: `Instructor already teaching at ${assignment.day} ${assignment.time}`,
        };
      }
    }
  }

  // 4. Student Level Conflict (HARD)
  for (const [
    varId,
    existingAssignment,
  ] of currentState.assignments.entries()) {
    const existingVar = findVariableById(varId, currentState);
    if (
      existingVar?.group_level === variable.group_level &&
      existingAssignment.day === assignment.day &&
      doTimeSlotsOverlap(
        existingAssignment.time,
        existingAssignment.duration,
        assignment.time,
        assignment.duration
      )
    ) {
      return {
        isValid: false,
        violationType: "student_level_conflict",
        message: `Level ${variable.group_level} students already have class at ${assignment.day} ${assignment.time}`,
      };
    }
  }

  // 5. Room Type and Capacity already checked in domain generation

  return { isValid: true };
}

/**
 * Check if two time slots overlap
 */
function doTimeSlotsOverlap(
  time1: string,
  duration1: number,
  time2: string,
  duration2: number
): boolean {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);

  const start1 = h1 * 60 + m1;
  const end1 = start1 + duration1;
  const start2 = h2 * 60 + m2;
  const end2 = start2 + duration2;

  return start1 < end2 && start2 < end1;
}

/**
 * Find variable by ID in state
 */
function findVariableById(
  varId: string,
  state: CSPState
): CSPVariable | undefined {
  return state.allVariables.find((v) => v.section_id === varId);
}

/**
 * Forward Checking: Prune domains of unassigned variables after assignment
 */
export function forwardCheck(
  assignedVariable: CSPVariable,
  assignment: CSPAssignment,
  state: CSPState,
  config: CSPSolverConfig
): { success: boolean; prunedDomains: Map<string, Domain> } {
  if (!config.enableForwardChecking) {
    return { success: true, prunedDomains: new Map() };
  }

  const prunedDomains = new Map<string, Domain>();

  for (const variable of state.unassigned) {
    if (variable.section_id === assignedVariable.section_id) continue;

    const currentDomain = state.domains.get(variable.section_id) || [];
    const prunedDomain: Domain = [];

    for (const value of currentDomain) {
      // Create a temporary state with this assignment
      const tempState: CSPState = {
        assignments: new Map(state.assignments),
        domains: new Map(state.domains),
        unassigned: [...state.unassigned],
        allVariables: state.allVariables,
      };
      tempState.assignments.set(assignedVariable.section_id, assignment);

      // Check if this value would violate constraints
      const check = checkHardConstraints(variable, value, tempState, config);
      if (check.isValid) {
        prunedDomain.push(value);
      }
    }

    prunedDomains.set(variable.section_id, prunedDomain);

    // If domain becomes empty, forward checking fails
    if (prunedDomain.length === 0) {
      return { success: false, prunedDomains };
    }
  }

  return { success: true, prunedDomains };
}

/**
 * Most Constrained Variable (MCV) heuristic
 * Select variable with smallest remaining domain
 */
export function selectMCV(state: CSPState): CSPVariable | null {
  if (state.unassigned.length === 0) return null;

  let mcv: CSPVariable | null = null;
  let minDomainSize = Infinity;

  for (const variable of state.unassigned) {
    const domain = state.domains.get(variable.section_id) || [];
    if (domain.length < minDomainSize) {
      minDomainSize = domain.length;
      mcv = variable;
    }
  }

  return mcv;
}

/**
 * Least Constraining Value (LCV) heuristic
 * Order values by how many options they leave for remaining variables
 */
export function orderLCV(
  variable: CSPVariable,
  domain: Domain,
  state: CSPState,
  config: CSPSolverConfig
): Domain {
  if (!config.enableForwardChecking) {
    return domain; // No ordering benefit without forward checking
  }

  const valueScores: Array<{ value: CSPAssignment; score: number }> = [];

  for (const value of domain) {
    let score = 0;

    // Count how many options remain for other variables after this assignment
    const tempState: CSPState = {
      assignments: new Map(state.assignments),
      domains: new Map(state.domains),
      unassigned: [...state.unassigned],
      allVariables: state.allVariables,
    };
    tempState.assignments.set(variable.section_id, value);

    for (const otherVar of state.unassigned) {
      if (otherVar.section_id === variable.section_id) continue;

      const otherDomain = state.domains.get(otherVar.section_id) || [];
      for (const otherValue of otherDomain) {
        const check = checkHardConstraints(
          otherVar,
          otherValue,
          tempState,
          config
        );
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
 * Calculate soft constraint cost for current state
 */
export function calculateSoftConstraintCost(
  state: CSPState,
  config: CSPSolverConfig
): SoftConstraintCost {
  if (!config.enableSoftConstraints) {
    return {
      studentGaps: 0,
      loadImbalance: 0,
      roomProximity: 0,
      instructorPreference: 0,
      total: 0,
    };
  }

  const weights =
    config.softConstraintWeights || DEFAULT_CONFIG.softConstraintWeights;

  // 1. Student Gap Minimization
  const studentGaps = calculateStudentGaps(state, weights.studentGaps);

  // 2. Level-Based Daily Load Balancing
  const loadImbalance = calculateLoadImbalance(state, weights.loadImbalance);

  // 3. Room Proximity (simplified - count rooms used per day)
  const roomProximity = calculateRoomProximity(state, weights.roomProximity);

  // 4. Instructor Preference Matching
  const instructorPreference = calculateInstructorPreference(
    state,
    config,
    weights.instructorPreference
  );

  const total =
    studentGaps + loadImbalance + roomProximity + instructorPreference;

  return {
    studentGaps,
    loadImbalance,
    roomProximity,
    instructorPreference,
    total,
  };
}

/**
 * Calculate student gap penalty
 */
function calculateStudentGaps(state: CSPState, weight: number): number {
  // Group assignments by level and day
  const levelDayAssignments = new Map<string, CSPAssignment[]>();

  for (const [varId, assignment] of state.assignments.entries()) {
    const variable = findVariableById(varId, state);
    if (!variable) continue;

    const key = `${variable.group_level}-${assignment.day}`;
    if (!levelDayAssignments.has(key)) {
      levelDayAssignments.set(key, []);
    }
    levelDayAssignments.get(key)!.push(assignment);
  }

  let totalGaps = 0;

  for (const assignments of levelDayAssignments.values()) {
    // Sort by time
    assignments.sort((a, b) => {
      const [h1, m1] = a.time.split(":").map(Number);
      const [h2, m2] = b.time.split(":").map(Number);
      return h1 * 60 + m1 - (h2 * 60 + m2);
    });

    // Count gaps (one-slot gaps between classes)
    for (let i = 0; i < assignments.length - 1; i++) {
      const [h1, m1] = assignments[i].time.split(":").map(Number);
      const [h2, m2] = assignments[i + 1].time.split(":").map(Number);
      const end1 = h1 * 60 + m1 + assignments[i].duration;
      const start2 = h2 * 60 + m2;
      const gap = start2 - end1;

      // Penalize one-slot gaps (60 minutes)
      if (gap > 0 && gap <= 60) {
        totalGaps++;
      }
    }
  }

  return totalGaps * weight;
}

/**
 * Calculate load imbalance penalty
 */
function calculateLoadImbalance(state: CSPState, weight: number): number {
  // Count assignments per level per day
  const levelDayCounts = new Map<string, number>();

  for (const [varId, assignment] of state.assignments.entries()) {
    const variable = findVariableById(varId, state);
    if (!variable) continue;

    const key = `${variable.group_level}-${assignment.day}`;
    levelDayCounts.set(key, (levelDayCounts.get(key) || 0) + 1);
  }

  // Calculate variance for each level across days
  let totalVariance = 0;

  const levelCounts = new Map<number, number[]>();
  for (const [key, count] of levelDayCounts.entries()) {
    const [level] = key.split("-").map(Number);
    if (!levelCounts.has(level)) {
      levelCounts.set(level, []);
    }
    levelCounts.get(level)!.push(count);
  }

  for (const counts of levelCounts.values()) {
    if (counts.length === 0) continue;
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance =
      counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    totalVariance += variance;
  }

  return totalVariance * weight;
}

/**
 * Calculate room proximity penalty (simplified)
 */
function calculateRoomProximity(state: CSPState, weight: number): number {
  // Simplified: count unique rooms per day (fewer rooms = better proximity)
  // In a real implementation, would use actual room locations/distances
  const dayRooms = new Map<string, Set<string>>();

  for (const assignment of state.assignments.values()) {
    if (!dayRooms.has(assignment.day)) {
      dayRooms.set(assignment.day, new Set());
    }
    dayRooms.get(assignment.day)!.add(assignment.room);
  }

  let totalRooms = 0;
  for (const rooms of dayRooms.values()) {
    totalRooms += rooms.size;
  }

  // Penalize using many different rooms
  return totalRooms * weight;
}

/**
 * Calculate instructor preference penalty
 */
function calculateInstructorPreference(
  state: CSPState,
  config: CSPSolverConfig,
  weight: number
): number {
  if (!config.instructorPreferences) return 0;

  let violations = 0;

  for (const [varId, assignment] of state.assignments.entries()) {
    const variable = findVariableById(varId, state);
    if (!variable || !variable.instructor_id) continue;

    const preferences = config.instructorPreferences.get(
      variable.instructor_id
    );
    if (!preferences) continue;

    // Check day preference
    if (
      preferences.preferredDays &&
      !preferences.preferredDays.includes(assignment.day)
    ) {
      violations++;
    }

    // Check time preference (simplified - check if time is in preferred range)
    if (preferences.preferredTimes) {
      const [h] = assignment.time.split(":").map(Number);
      const preferredHours = preferences.preferredTimes.map((t) => {
        const [th] = t.split(":").map(Number);
        return th;
      });
      if (!preferredHours.includes(h)) {
        violations++;
      }
    }
  }

  return violations * weight;
}

/**
 * Backtracking search with MCV and LCV heuristics
 */
export function backtrackSearch(
  state: CSPState,
  config: Required<CSPSolverConfig>,
  timeSlots: TimeSlot[],
  rooms: SchedulingInput["rooms"],
  onProgress?: (state: CSPState, backtracks: number) => void
): { success: boolean; finalState: CSPState; backtracks: number } {
  let backtracks = 0;
  const maxBacktracks = config.maxBacktracks;

  function backtrack(currentState: CSPState): CSPState | null {
    // Base case: all variables assigned
    if (currentState.unassigned.length === 0) {
      return currentState;
    }

    // Check backtrack limit
    if (backtracks >= maxBacktracks) {
      return null;
    }

    // Select variable using MCV heuristic
    const variable = selectMCV(currentState);
    if (!variable) return currentState;

    // Get domain for this variable
    let domain = currentState.domains.get(variable.section_id) || [];
    if (domain.length === 0) {
      backtracks++;
      return null; // Dead end
    }

    // Order domain using LCV heuristic
    domain = orderLCV(variable, domain, currentState, config);

    // Try each value in domain
    for (const value of domain) {
      // Check hard constraints
      const constraintCheck = checkHardConstraints(
        variable,
        value,
        currentState,
        config
      );

      if (!constraintCheck.isValid) {
        continue; // Skip invalid assignment
      }

      // Make assignment
      const newState: CSPState = {
        assignments: new Map(currentState.assignments),
        domains: new Map(currentState.domains),
        unassigned: currentState.unassigned.filter(
          (v) => v.section_id !== variable.section_id
        ),
        allVariables: currentState.allVariables,
      };
      newState.assignments.set(variable.section_id, value);

      // Forward checking
      if (config.enableForwardChecking) {
        const fcResult = forwardCheck(variable, value, newState, config);
        if (!fcResult.success) {
          backtracks++;
          continue; // Forward checking failed
        }

        // Update domains with pruned values
        for (const [varId, prunedDomain] of fcResult.prunedDomains.entries()) {
          newState.domains.set(varId, prunedDomain);
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
 * Main CSP solver function
 */
export async function solveCSP(
  input: SchedulingInput,
  config: CSPSolverConfig = {},
  onProgress?: (progress: {
    assigned: number;
    total: number;
    backtracks: number;
    currentVariable?: string;
  }) => void
): Promise<{
  success: boolean;
  assignments: SectionAssignment[];
  unassigned: Array<{
    section_id: string;
    course_code: string;
    section_no: string;
    reason: string;
  }>;
  stats: {
    total_sections: number;
    assigned: number;
    unassigned: number;
    conflicts_resolved: number;
    backtracks: number;
    softConstraintCost?: SoftConstraintCost;
  };
}> {
  const finalConfig: Required<CSPSolverConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    softConstraintWeights: {
      ...DEFAULT_CONFIG.softConstraintWeights,
      ...config.softConstraintWeights,
    },
    externalSchedules: config.externalSchedules || [],
    instructorPreferences: config.instructorPreferences || new Map(),
  };

  // Convert input sections to CSP variables
  const variables: CSPVariable[] = input.sections.map((s) => ({
    section_id: s.id,
    course_code: s.course_code,
    section_no: s.section_no,
    instructor_id: s.instructor_id,
    capacity: s.capacity,
    group_level: s.group_level,
    activity: s.activity,
    weekly_hours: s.weekly_hours,
    room_code: s.room_code,
  }));

  // Generate time slots
  const { generateTimeSlots, generateLabTimeSlots } = await import(
    "./algorithm"
  );
  const lectureSlots = generateTimeSlots(input.timeGridConfig);
  const labSlots = generateLabTimeSlots(input.timeGridConfig);

  // Initialize CSP state
  const state: CSPState = {
    assignments: new Map(),
    domains: new Map(),
    unassigned: [...variables],
    allVariables: [...variables],
  };

  // Generate initial domains for all variables
  for (const variable of variables) {
    const timeSlots = variable.activity === "lab" ? labSlots : lectureSlots;
    const domain = generateDomain(
      variable,
      input.rooms,
      timeSlots,
      finalConfig
    );
    state.domains.set(variable.section_id, domain);
  }

  // Run backtracking search
  const searchResult = backtrackSearch(
    state,
    finalConfig,
    lectureSlots,
    input.rooms,
    (currentState, backtracks) => {
      if (onProgress) {
        onProgress({
          assigned: currentState.assignments.size,
          total: variables.length,
          backtracks,
          currentVariable: selectMCV(currentState)?.section_id,
        });
      }
    }
  );

  // Convert CSP assignments to SectionAssignment format
  const assignments: SectionAssignment[] = [];
  const unassigned: Array<{
    section_id: string;
    course_code: string;
    section_no: string;
    reason: string;
  }> = [];

  for (const variable of variables) {
    const assignment = searchResult.finalState.assignments.get(
      variable.section_id
    );
    if (assignment) {
      // Find the original time slot pattern that matches this assignment
      // This ensures we preserve the multi-day pattern if it exists
      const variableTimeSlots =
        variable.activity === "lab" ? labSlots : lectureSlots;
      const originalTimeSlot = variableTimeSlots.find(
        (ts) =>
          ts.days.includes(assignment.day) &&
          ts.start_time === assignment.time &&
          ts.duration === assignment.duration
      );

      assignments.push({
        section_id: variable.section_id,
        course_code: variable.course_code,
        section_no: variable.section_no,
        room_code: assignment.room,
        time_slot: {
          days: originalTimeSlot?.days || [assignment.day],
          start_time: assignment.time,
          duration: assignment.duration,
        },
        instructor_id: variable.instructor_id,
        group_level: variable.group_level,
        activity: variable.activity,
      });
    } else {
      const domain =
        searchResult.finalState.domains.get(variable.section_id) || [];
      unassigned.push({
        section_id: variable.section_id,
        course_code: variable.course_code,
        section_no: variable.section_no,
        reason:
          domain.length === 0
            ? "No valid assignments available (domain exhausted)"
            : "Could not find conflict-free assignment",
      });
    }
  }

  // Calculate soft constraint cost if enabled
  let softConstraintCost: SoftConstraintCost | undefined;
  if (finalConfig.enableSoftConstraints && searchResult.success) {
    softConstraintCost = calculateSoftConstraintCost(
      searchResult.finalState,
      finalConfig
    );
  }

  return {
    success: searchResult.success && unassigned.length === 0,
    assignments,
    unassigned,
    stats: {
      total_sections: variables.length,
      assigned: assignments.length,
      unassigned: unassigned.length,
      conflicts_resolved: assignments.length,
      backtracks: searchResult.backtracks,
      softConstraintCost,
    },
  };
}

/**
 * Check if an instructor is available at a specific time slot
 * @param instructor The instructor to check
 * @param day The day of the week (e.g., "Sunday", "Monday")
 * @param startTime The start time (e.g., "08:00")
 * @param duration Duration in minutes
 * @returns true if available, false if unavailable
 */
export function isInstructorAvailable(
  instructor: InstructorForAssignment,
  day: string,
  startTime: string,
  duration: number
): boolean {
  if (
    !instructor.unavailable_times ||
    instructor.unavailable_times.length === 0
  ) {
    return true; // No unavailability defined, assume available
  }

  const dayAvailability = instructor.unavailable_times.find(
    (ua) => ua.day.toLowerCase() === day.toLowerCase()
  );

  if (
    !dayAvailability ||
    !dayAvailability.slots ||
    dayAvailability.slots.length === 0
  ) {
    return true; // No unavailability for this day
  }

  // Parse the section time
  const [startHour, startMin] = startTime.split(":").map(Number);
  const sectionStart = startHour * 60 + startMin;
  const sectionEnd = sectionStart + duration;

  // Check each unavailable slot
  for (const slot of dayAvailability.slots) {
    if (slot.type !== "unavailable") continue;

    const [unavailStartHour, unavailStartMin] = slot.start
      .split(":")
      .map(Number);
    const [unavailEndHour, unavailEndMin] = slot.end.split(":").map(Number);
    const unavailStart = unavailStartHour * 60 + unavailStartMin;
    const unavailEnd = unavailEndHour * 60 + unavailEndMin;

    // Check for overlap
    if (sectionStart < unavailEnd && sectionEnd > unavailStart) {
      return false; // Time slot overlaps with unavailable period
    }
  }

  return true;
}

/**
 * Check if an instructor has a conflict with already assigned sections
 * @param instructorId The instructor ID to check
 * @param day The day of the assignment
 * @param startTime The start time
 * @param duration Duration in minutes
 * @param existingAssignments Already made section assignments
 * @returns true if there's a conflict, false otherwise
 */
export function hasInstructorConflict(
  instructorId: string,
  day: string,
  startTime: string,
  duration: number,
  existingAssignments: Array<{
    instructor_id: string | null;
    time_slot: { days: string[]; start_time: string; duration: number };
  }>
): boolean {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const sectionStart = startHour * 60 + startMin;
  const sectionEnd = sectionStart + duration;

  for (const assignment of existingAssignments) {
    if (assignment.instructor_id !== instructorId) continue;

    // Check if the assignment is on the same day
    if (!assignment.time_slot.days.includes(day)) continue;

    const [assignStartHour, assignStartMin] = assignment.time_slot.start_time
      .split(":")
      .map(Number);
    const assignStart = assignStartHour * 60 + assignStartMin;
    const assignEnd = assignStart + assignment.time_slot.duration;

    // Check for overlap
    if (sectionStart < assignEnd && sectionEnd > assignStart) {
      return true; // Conflict found
    }
  }

  return false;
}

/**
 * Assign an available instructor to a section based on load balancing
 * Selects from instructors with lowest current load who are available at the section's time
 *
 * TODO: Add course preferences matching when faculty course preferences feature is implemented
 * This would allow matching instructors to courses based on their expertise/preferences
 *
 * @param section The section needing an instructor
 * @param instructors All available instructors with their current load
 * @param existingAssignments Already made section assignments (for conflict checking)
 * @returns The assigned instructor ID and name, or null if no suitable instructor found
 */
export function assignAvailableInstructor(
  section: {
    id: string;
    course_code: string;
    time_slot: { days: string[]; start_time: string; duration: number };
    weekly_hours?: number;
  },
  instructors: InstructorForAssignment[],
  existingAssignments: Array<{
    instructor_id: string | null;
    time_slot: { days: string[]; start_time: string; duration: number };
  }>
): InstructorAssignmentResult {
  // Filter instructors who are available for all days in the time slot
  const availableInstructors = instructors.filter((instructor) => {
    // Check max load constraint
    const maxLoad = instructor.max_load_per_week || 20; // Default to 20 hours
    const sectionHours = section.weekly_hours || 3; // Default 3 hours
    if (instructor.current_load + sectionHours > maxLoad) {
      return false; // Would exceed max load
    }

    // Check availability for each day in the section's time slot
    for (const day of section.time_slot.days) {
      if (
        !isInstructorAvailable(
          instructor,
          day,
          section.time_slot.start_time,
          section.time_slot.duration
        )
      ) {
        return false; // Not available on this day
      }

      // Check for conflicts with existing assignments
      if (
        hasInstructorConflict(
          instructor.id,
          day,
          section.time_slot.start_time,
          section.time_slot.duration,
          existingAssignments
        )
      ) {
        return false; // Has conflict with existing assignment
      }
    }

    return true;
  });

  if (availableInstructors.length === 0) {
    return {
      section_id: section.id,
      instructor_id: null,
      instructor_name: null,
      success: false,
      reason:
        "No available instructors found (all are unavailable, overloaded, or have conflicts)",
    };
  }

  // Sort by current load (ascending) to achieve better distribution
  availableInstructors.sort((a, b) => a.current_load - b.current_load);

  // Select the instructor with the lowest load
  const selectedInstructor = availableInstructors[0];

  return {
    section_id: section.id,
    instructor_id: selectedInstructor.id,
    instructor_name: selectedInstructor.name,
    success: true,
  };
}

/**
 * Assign instructors to multiple sections with load balancing
 * Re-evaluates all sections and assigns instructors based on availability and load
 *
 * @param sections Array of sections to assign instructors to
 * @param instructors Array of all instructors with their data
 * @param existingScheduleAssignments Existing schedule assignments for conflict checking
 * @returns Array of assignment results
 */
export function assignInstructorsToSections(
  sections: Array<{
    id: string;
    course_code: string;
    time_slot: { days: string[]; start_time: string; duration: number };
    weekly_hours?: number;
  }>,
  instructors: InstructorForAssignment[],
  existingScheduleAssignments: Array<{
    instructor_id: string | null;
    time_slot: { days: string[]; start_time: string; duration: number };
  }> = []
): InstructorAssignmentResult[] {
  const results: InstructorAssignmentResult[] = [];

  // Track assignments made in this batch for conflict checking
  const batchAssignments: Array<{
    instructor_id: string | null;
    time_slot: { days: string[]; start_time: string; duration: number };
  }> = [...existingScheduleAssignments];

  // Create a mutable copy of instructors to track load changes
  const instructorLoadMap = new Map<string, number>();
  for (const instructor of instructors) {
    instructorLoadMap.set(instructor.id, instructor.current_load);
  }

  // Sort sections by constraints (more constrained first - e.g., labs, specific time requirements)
  // This helps ensure harder-to-schedule sections get instructors first
  const sortedSections = [...sections].sort((a, b) => {
    // Labs are typically more constrained
    const aIsLab = a.course_code.toLowerCase().includes("lab");
    const bIsLab = b.course_code.toLowerCase().includes("lab");
    if (aIsLab && !bIsLab) return -1;
    if (!aIsLab && bIsLab) return 1;

    // More days = more constrained
    return b.time_slot.days.length - a.time_slot.days.length;
  });

  for (const section of sortedSections) {
    // Update instructors with current load from our tracking map
    const updatedInstructors = instructors.map((inst) => ({
      ...inst,
      current_load: instructorLoadMap.get(inst.id) || inst.current_load,
    }));

    const result = assignAvailableInstructor(
      section,
      updatedInstructors,
      batchAssignments
    );

    results.push(result);

    if (result.success && result.instructor_id) {
      // Update load tracking
      const currentLoad = instructorLoadMap.get(result.instructor_id) || 0;
      const sectionHours = section.weekly_hours || 3;
      instructorLoadMap.set(result.instructor_id, currentLoad + sectionHours);

      // Add to batch assignments for conflict checking
      batchAssignments.push({
        instructor_id: result.instructor_id,
        time_slot: section.time_slot,
      });
    }
  }

  return results;
}
