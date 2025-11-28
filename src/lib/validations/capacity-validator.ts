/**
 * Capacity Validator
 * Validates capacity constraints for sections and rooms
 * 
 * BUSINESS RULES:
 * - Enrollment cannot exceed section capacity
 * - Section capacity cannot exceed room capacity
 * - Warn when approaching threshold (e.g., 90%)
 * - Track utilization statistics
 */

export interface CapacityInfo {
  entity_id: string;
  entity_type: 'SECTION' | 'ROOM';
  current: number;
  capacity: number;
  utilization: number; // Percentage
}

export interface SectionCapacityInfo extends CapacityInfo {
  entity_type: 'SECTION';
  section_id: string;
  course_code: string;
  section_number: number;
  room_capacity?: number;
}

export interface RoomCapacityInfo extends CapacityInfo {
  entity_type: 'ROOM';
  room_number: string;
}

export interface CapacityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  utilization: number;
}

export interface CapacityThreshold {
  warning: number;  // Percentage (e.g., 90)
  critical: number; // Percentage (e.g., 100)
}

const DEFAULT_THRESHOLD: CapacityThreshold = {
  warning: 90,
  critical: 100,
};

/**
 * Calculate utilization percentage
 */
export function calculateUtilization(current: number, capacity: number): number {
  if (capacity === 0) return 0;
  return (current / capacity) * 100;
}

/**
 * Validate enrollment capacity for a section
 */
export function validateSectionEnrollment(
  sectionInfo: SectionCapacityInfo,
  threshold: CapacityThreshold = DEFAULT_THRESHOLD
): CapacityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const { current, capacity, course_code, section_number } = sectionInfo;
  const utilization = calculateUtilization(current, capacity);
  
  // Critical: Enrollment exceeds capacity
  if (current > capacity) {
    errors.push(
      `Section ${course_code}-${section_number} is over capacity (${current}/${capacity})`
    );
  }
  
  // Warning: Approaching capacity threshold
  if (utilization >= threshold.warning && utilization < threshold.critical) {
    warnings.push(
      `Section ${course_code}-${section_number} is ${utilization.toFixed(1)}% full (${current}/${capacity})`
    );
  }
  
  // Negative enrollment check
  if (current < 0) {
    errors.push(
      `Section ${course_code}-${section_number} has negative enrollment: ${current}`
    );
  }
  
  // Zero capacity check
  if (capacity <= 0) {
    errors.push(
      `Section ${course_code}-${section_number} has invalid capacity: ${capacity}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    utilization,
  };
}

/**
 * Validate section capacity does not exceed room capacity
 */
export function validateSectionRoomCapacity(
  sectionCapacity: number,
  roomCapacity: number,
  courseCode: string,
  sectionNumber: number,
  roomNumber: string
): CapacityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Section capacity should not exceed room capacity
  if (sectionCapacity > roomCapacity) {
    errors.push(
      `Section ${courseCode}-${sectionNumber} capacity (${sectionCapacity}) exceeds room ${roomNumber} capacity (${roomCapacity})`
    );
  }
  
  // Warning: Section capacity very close to room capacity (within 5%)
  const utilizationOfRoom = (sectionCapacity / roomCapacity) * 100;
  if (utilizationOfRoom > 95 && utilizationOfRoom <= 100) {
    warnings.push(
      `Section ${courseCode}-${sectionNumber} capacity uses ${utilizationOfRoom.toFixed(1)}% of room ${roomNumber}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    utilization: utilizationOfRoom,
  };
}

/**
 * Validate room capacity
 */
export function validateRoomCapacity(
  roomInfo: RoomCapacityInfo,
  threshold: CapacityThreshold = DEFAULT_THRESHOLD
): CapacityValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const { current, capacity, room_number } = roomInfo;
  const utilization = calculateUtilization(current, capacity);
  
  // Critical: Occupancy exceeds capacity
  if (current > capacity) {
    errors.push(
      `Room ${room_number} is over capacity (${current}/${capacity})`
    );
  }
  
  // Warning: Approaching capacity threshold
  if (utilization >= threshold.warning && utilization < threshold.critical) {
    warnings.push(
      `Room ${room_number} is ${utilization.toFixed(1)}% full (${current}/${capacity})`
    );
  }
  
  // Negative occupancy check
  if (current < 0) {
    errors.push(
      `Room ${room_number} has negative occupancy: ${current}`
    );
  }
  
  // Invalid capacity check
  if (capacity <= 0) {
    errors.push(
      `Room ${room_number} has invalid capacity: ${capacity}`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    utilization,
  };
}

/**
 * Batch validate multiple sections
 */
export function validateMultipleSections(
  sections: SectionCapacityInfo[],
  threshold: CapacityThreshold = DEFAULT_THRESHOLD
): {
  valid: boolean;
  results: Array<{
    section_id: string;
    result: CapacityValidationResult;
  }>;
  summary: {
    total: number;
    valid: number;
    overCapacity: number;
    warnings: number;
    avgUtilization: number;
  };
} {
  const results = sections.map(section => ({
    section_id: section.section_id,
    result: validateSectionEnrollment(section, threshold),
  }));
  
  const overCapacity = results.filter(r => !r.result.valid).length;
  const hasWarnings = results.filter(r => r.result.warnings.length > 0).length;
  const avgUtilization = sections.length > 0
    ? sections.reduce((sum, s) => sum + calculateUtilization(s.current, s.capacity), 0) / sections.length
    : 0;
  
  return {
    valid: overCapacity === 0,
    results,
    summary: {
      total: sections.length,
      valid: results.filter(r => r.result.valid).length,
      overCapacity,
      warnings: hasWarnings,
      avgUtilization,
    },
  };
}

/**
 * Check if enrollment can be added without exceeding capacity
 */
export function canAddEnrollment(
  currentEnrollment: number,
  capacity: number,
  additionalStudents: number = 1
): {
  canAdd: boolean;
  reason?: string;
  newUtilization: number;
} {
  const newEnrollment = currentEnrollment + additionalStudents;
  const newUtilization = calculateUtilization(newEnrollment, capacity);
  
  if (newEnrollment > capacity) {
    return {
      canAdd: false,
      reason: `Adding ${additionalStudents} student(s) would exceed capacity (${newEnrollment}/${capacity})`,
      newUtilization,
    };
  }
  
  return {
    canAdd: true,
    newUtilization,
  };
}

/**
 * Get capacity statistics for a list of entities
 */
export function getCapacityStatistics(
  entities: CapacityInfo[]
): {
  total: number;
  overCapacity: number;
  atCapacity: number;
  nearCapacity: number; // Within 90-100%
  underUtilized: number; // Below 50%
  avgUtilization: number;
  minUtilization: number;
  maxUtilization: number;
} {
  if (entities.length === 0) {
    return {
      total: 0,
      overCapacity: 0,
      atCapacity: 0,
      nearCapacity: 0,
      underUtilized: 0,
      avgUtilization: 0,
      minUtilization: 0,
      maxUtilization: 0,
    };
  }
  
  const utilizations = entities.map(e => calculateUtilization(e.current, e.capacity));
  
  return {
    total: entities.length,
    overCapacity: entities.filter(e => e.current > e.capacity).length,
    atCapacity: entities.filter(e => e.current === e.capacity).length,
    nearCapacity: utilizations.filter(u => u >= 90 && u <= 100).length,
    underUtilized: utilizations.filter(u => u < 50).length,
    avgUtilization: utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length,
    minUtilization: Math.min(...utilizations),
    maxUtilization: Math.max(...utilizations),
  };
}

