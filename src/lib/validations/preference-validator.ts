/**
 * Preference Validator
 * Validates elective preference submissions for SmartSchedule
 * 
 * BUSINESS RULES:
 * - Students must submit 3-10 preferences
 * - Each preference order must be between 1-10
 * - No duplicate courses allowed
 * - No duplicate preference orders allowed
 * - Course codes must follow pattern: ABC123
 */

export interface ElectivePreference {
  student_id: string;
  course_code: string;
  preference_order: number;
  term_code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a single elective preference
 */
export function validateElectivePreference(preference: ElectivePreference): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!preference.student_id) {
    errors.push('Student ID is required');
  }
  
  if (!preference.course_code) {
    errors.push('Course code is required');
  }
  
  if (!preference.term_code) {
    errors.push('Term code is required');
  }
  
  // Preference order validation
  if (preference.preference_order < 1 || preference.preference_order > 10) {
    errors.push('Preference order must be between 1 and 10');
  }
  
  // Course code format validation (ABC123 format)
  if (preference.course_code && !/^[A-Z]{3}\d{3}$/.test(preference.course_code)) {
    errors.push('Invalid course code format (expected: ABC123)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates uniqueness of preferences (no duplicate courses or orders)
 */
export function validatePreferenceUniqueness(
  preferences: Array<{ course_code: string; preference_order: number }>
): ValidationResult {
  const errors: string[] = [];
  
  // Check for duplicate courses
  const courseCodes = preferences.map(p => p.course_code);
  const uniqueCodes = new Set(courseCodes);
  
  if (courseCodes.length !== uniqueCodes.size) {
    errors.push('Duplicate courses not allowed');
  }
  
  // Check for duplicate preference orders
  const orders = preferences.map(p => p.preference_order);
  const uniqueOrders = new Set(orders);
  
  if (orders.length !== uniqueOrders.size) {
    errors.push('Duplicate preference orders not allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates preference count limits
 */
export function validatePreferenceCount(
  count: number,
  min: number = 3,
  max: number = 10
): ValidationResult {
  const errors: string[] = [];
  
  if (count < min) {
    errors.push(`Minimum ${min} preferences required`);
  }
  
  if (count > max) {
    errors.push(`Maximum ${max} preferences allowed`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates package requirements
 * Ensures student has selected appropriate electives from each package
 */
export function validatePackageRequirements(
  preferences: Array<{ course_code: string; package_name?: string }>,
  packageRequirements: Record<string, { min: number; max?: number }>
): ValidationResult {
  const errors: string[] = [];
  
  // Group preferences by package
  const packageCounts: Record<string, number> = {};
  
  preferences.forEach(pref => {
    if (pref.package_name) {
      packageCounts[pref.package_name] = (packageCounts[pref.package_name] || 0) + 1;
    }
  });
  
  // Validate each package requirement
  Object.entries(packageRequirements).forEach(([packageName, requirement]) => {
    const count = packageCounts[packageName] || 0;
    
    if (count < requirement.min) {
      errors.push(`Minimum ${requirement.min} courses required from ${packageName} package`);
    }
    
    if (requirement.max && count > requirement.max) {
      errors.push(`Maximum ${requirement.max} courses allowed from ${packageName} package`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Comprehensive validation of all preferences for a student
 */
export function validateAllPreferences(
  preferences: ElectivePreference[],
  packageRequirements?: Record<string, { min: number; max?: number }>
): ValidationResult {
  const allErrors: string[] = [];
  
  // Validate count
  const countResult = validatePreferenceCount(preferences.length);
  allErrors.push(...countResult.errors);
  
  // Validate each preference individually
  preferences.forEach((pref, index) => {
    const result = validateElectivePreference(pref);
    result.errors.forEach(error => {
      allErrors.push(`Preference ${index + 1}: ${error}`);
    });
  });
  
  // Validate uniqueness
  const uniquenessResult = validatePreferenceUniqueness(preferences);
  allErrors.push(...uniquenessResult.errors);
  
  // Validate package requirements if provided
  if (packageRequirements) {
    const packageResult = validatePackageRequirements(preferences, packageRequirements);
    allErrors.push(...packageResult.errors);
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

