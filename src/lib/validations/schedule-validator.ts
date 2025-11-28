/**
 * Schedule Validator
 * Validates complete schedule structure and constraints
 * 
 * BUSINESS RULES:
 * - Validate complete schedule structure
 * - Ensure all constraints are satisfied
 * - Validate JSONB format for schedule data
 * - Check for data integrity
 */

export interface ScheduleSection {
  section_id: string;
  course_code: string;
  course_name: string;
  course_type: 'REQUIRED' | 'ELECTIVE';
  instructor_id?: string;
  instructor_name?: string;
  room_number?: string;
  times: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
  credits: number;
}

export interface ScheduleData {
  sections: ScheduleSection[];
  total_credits: number;
  total_contact_hours: number;
  days_with_classes: string[];
}

export interface Schedule {
  id: string;
  student_id: string;
  term_code: string;
  version: number;
  data: ScheduleData;
  is_published: boolean;
  generated_at: string;
}

export interface ScheduleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary?: {
    totalSections: number;
    totalCredits: number;
    requiredCourses: number;
    electiveCourses: number;
    hasConflicts: boolean;
  };
}

/**
 * Validate schedule data structure
 */
export function validateScheduleStructure(schedule: Schedule): ScheduleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate required fields
  if (!schedule.id) errors.push('Schedule ID is required');
  if (!schedule.student_id) errors.push('Student ID is required');
  if (!schedule.term_code) errors.push('Term code is required');
  if (schedule.version === undefined) errors.push('Version is required');
  
  // Validate data object
  if (!schedule.data) {
    errors.push('Schedule data is required');
    return { valid: false, errors, warnings };
  }
  
  if (!Array.isArray(schedule.data.sections)) {
    errors.push('Sections must be an array');
  }
  
  // Validate sections
  if (schedule.data.sections.length === 0) {
    warnings.push('Schedule has no sections');
  }
  
  schedule.data.sections.forEach((section, index) => {
    if (!section.section_id) errors.push(`Section ${index}: section_id is required`);
    if (!section.course_code) errors.push(`Section ${index}: course_code is required`);
    if (!section.course_name) errors.push(`Section ${index}: course_name is required`);
    if (!section.course_type) errors.push(`Section ${index}: course_type is required`);
    if (section.credits === undefined || section.credits <= 0) {
      errors.push(`Section ${index}: invalid credits`);
    }
    
    // Validate times
    if (!Array.isArray(section.times) || section.times.length === 0) {
      errors.push(`Section ${index} (${section.course_code}): no time slots defined`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate schedule constraints
 */
export function validateScheduleConstraints(schedule: Schedule): ScheduleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!schedule.data || !schedule.data.sections) {
    return { valid: false, errors: ['Invalid schedule data'], warnings };
  }
  
  const { sections } = schedule.data;
  
  // Validate credit calculation
  const calculatedCredits = sections.reduce((sum, s) => sum + s.credits, 0);
  if (calculatedCredits !== schedule.data.total_credits) {
    errors.push(
      `Credit mismatch: calculated ${calculatedCredits}, reported ${schedule.data.total_credits}`
    );
  }
  
  // Check minimum credits (typically 12 for full-time)
  if (schedule.data.total_credits < 12) {
    warnings.push(`Low credit hours: ${schedule.data.total_credits} (minimum typically 12)`);
  }
  
  // Check maximum credits (typically 21)
  if (schedule.data.total_credits > 21) {
    warnings.push(`High credit hours: ${schedule.data.total_credits} (maximum typically 21)`);
  }
  
  // Validate days_with_classes
  if (!Array.isArray(schedule.data.days_with_classes)) {
    errors.push('days_with_classes must be an array');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate schedule doesn't have internal conflicts
 */
export function validateNoInternalConflicts(schedule: Schedule): ScheduleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!schedule.data || !schedule.data.sections) {
    return { valid: false, errors: ['Invalid schedule data'], warnings };
  }
  
  const { sections } = schedule.data;
  
  // Check for time conflicts within the schedule
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      const section1 = sections[i];
      const section2 = sections[j];
      
      // Check each time combination
      for (const time1 of section1.times) {
        for (const time2 of section2.times) {
          if (time1.day === time2.day) {
            const time1Start = timeToMinutes(time1.start_time);
            const time1End = timeToMinutes(time1.end_time);
            const time2Start = timeToMinutes(time2.start_time);
            const time2End = timeToMinutes(time2.end_time);
            
            if (time1Start < time2End && time2Start < time1End) {
              errors.push(
                `Time conflict: ${section1.course_code} and ${section2.course_code} overlap on ${time1.day}`
              );
            }
          }
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Comprehensive schedule validation
 */
export function validateCompleteSchedule(schedule: Schedule): ScheduleValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Validate structure
  const structureResult = validateScheduleStructure(schedule);
  allErrors.push(...structureResult.errors);
  allWarnings.push(...structureResult.warnings);
  
  // Only continue if structure is valid
  if (structureResult.valid) {
    // Validate constraints
    const constraintsResult = validateScheduleConstraints(schedule);
    allErrors.push(...constraintsResult.errors);
    allWarnings.push(...constraintsResult.warnings);
    
    // Validate no internal conflicts
    const conflictsResult = validateNoInternalConflicts(schedule);
    allErrors.push(...conflictsResult.errors);
    allWarnings.push(...conflictsResult.warnings);
  }
  
  // Calculate summary
  const summary = schedule.data ? {
    totalSections: schedule.data.sections.length,
    totalCredits: schedule.data.total_credits,
    requiredCourses: schedule.data.sections.filter(s => s.course_type === 'REQUIRED').length,
    electiveCourses: schedule.data.sections.filter(s => s.course_type === 'ELECTIVE').length,
    hasConflicts: allErrors.some(e => e.includes('conflict')),
  } : undefined;
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    summary,
  };
}

