/**
 * Production Readiness Validation Utilities
 * 
 * Purpose: Validate that the system has sufficient data for production deployment
 * 
 * Usage:
 * - Run before deployment to ensure database is populated
 * - Display warnings in admin dashboard
 * - Verify minimum data requirements
 */

import { createClient } from '@/supabase/server';

export interface ProductionReadinessResult {
  ready: boolean;
  warnings: string[];
  critical_missing: string[];
  data_counts: {
    courses: number;
    instructors: number;
    rooms: number;
    sections: number;
    student_groups: number;
    exams: number;
  };
  checks: {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }[];
}

/**
 * Minimum data requirements for production
 */
const MINIMUM_REQUIREMENTS = {
  courses: 10,
  instructors: 5,
  rooms: 5,
  sections: 5,
  student_groups: 1,
  exams: 0, // Exams are optional initially
};

/**
 * Check production readiness by validating database content
 * 
 * @returns Promise<ProductionReadinessResult> - Validation results with warnings and data counts
 */
export async function checkProductionReadiness(): Promise<ProductionReadinessResult> {
  const supabase = await createClient();
  
  const warnings: string[] = [];
  const critical_missing: string[] = [];
  const checks: ProductionReadinessResult['checks'] = [];
  
  // Initialize data counts
  const data_counts = {
    courses: 0,
    instructors: 0,
    rooms: 0,
    sections: 0,
    student_groups: 0,
    exams: 0,
  };

  try {
    // Check Courses
    const { count: coursesCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    data_counts.courses = coursesCount || 0;
    
    if ((coursesCount || 0) < MINIMUM_REQUIREMENTS.courses) {
      critical_missing.push('courses');
      checks.push({
        name: 'Courses',
        status: 'fail',
        message: `Only ${coursesCount} courses found. Minimum ${MINIMUM_REQUIREMENTS.courses} required.`,
      });
    } else {
      checks.push({
        name: 'Courses',
        status: 'pass',
        message: `${coursesCount} courses available`,
      });
    }

    // Check Instructors
    const { count: instructorsCount } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true });
    
    data_counts.instructors = instructorsCount || 0;
    
    if ((instructorsCount || 0) < MINIMUM_REQUIREMENTS.instructors) {
      critical_missing.push('instructors');
      checks.push({
        name: 'Instructors',
        status: 'fail',
        message: `Only ${instructorsCount} instructors found. Minimum ${MINIMUM_REQUIREMENTS.instructors} required.`,
      });
    } else {
      checks.push({
        name: 'Instructors',
        status: 'pass',
        message: `${instructorsCount} instructors available`,
      });
    }

    // Check Rooms
    const { count: roomsCount } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });
    
    data_counts.rooms = roomsCount || 0;
    
    if ((roomsCount || 0) < MINIMUM_REQUIREMENTS.rooms) {
      critical_missing.push('rooms');
      checks.push({
        name: 'Rooms',
        status: 'fail',
        message: `Only ${roomsCount} rooms found. Minimum ${MINIMUM_REQUIREMENTS.rooms} required.`,
      });
    } else {
      checks.push({
        name: 'Rooms',
        status: 'pass',
        message: `${roomsCount} rooms available`,
      });
    }

    // Check Sections
    const { count: sectionsCount } = await supabase
      .from('sections')
      .select('*', { count: 'exact', head: true });
    
    data_counts.sections = sectionsCount || 0;
    
    if ((sectionsCount || 0) < MINIMUM_REQUIREMENTS.sections) {
      warnings.push('No sections created yet. Schedule generation required.');
      checks.push({
        name: 'Sections',
        status: 'warn',
        message: `Only ${sectionsCount} sections found. Generate schedule to create sections.`,
      });
    } else {
      checks.push({
        name: 'Sections',
        status: 'pass',
        message: `${sectionsCount} sections scheduled`,
      });
    }

    // Check Student Groups
    const { count: groupsCount } = await supabase
      .from('student_groups')
      .select('*', { count: 'exact', head: true });
    
    data_counts.student_groups = groupsCount || 0;
    
    if ((groupsCount || 0) < MINIMUM_REQUIREMENTS.student_groups) {
      critical_missing.push('student_groups');
      checks.push({
        name: 'Student Groups',
        status: 'fail',
        message: `No student groups found. At least ${MINIMUM_REQUIREMENTS.student_groups} required.`,
      });
    } else {
      checks.push({
        name: 'Student Groups',
        status: 'pass',
        message: `${groupsCount} student groups configured`,
      });
    }

    // Check Exams (optional, so warning only)
    const { count: examsCount } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });
    
    data_counts.exams = examsCount || 0;
    
    if ((examsCount || 0) === 0) {
      warnings.push('No exams scheduled yet. Consider adding exam schedules.');
      checks.push({
        name: 'Exams',
        status: 'warn',
        message: 'No exams scheduled (optional)',
      });
    } else {
      checks.push({
        name: 'Exams',
        status: 'pass',
        message: `${examsCount} exams scheduled`,
      });
    }

    // Additional validation checks
    
    // Check for courses without credits
    const { count: coursesWithoutCredits } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .or('credits.is.null,weekly_hours.is.null');
    
    if ((coursesWithoutCredits || 0) > 0) {
      warnings.push(`${coursesWithoutCredits} courses missing credits or weekly hours`);
    }

    // Check for instructors without email
    const { count: instructorsWithoutEmail } = await supabase
      .from('instructors')
      .select('*', { count: 'exact', head: true })
      .is('email', null);
    
    if ((instructorsWithoutEmail || 0) > 0) {
      warnings.push(`${instructorsWithoutEmail} instructors missing email addresses`);
    }

    // Check for rooms without capacity
    const { count: roomsWithoutCapacity } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .is('capacity', null);
    
    if ((roomsWithoutCapacity || 0) > 0) {
      warnings.push(`${roomsWithoutCapacity} rooms missing capacity information`);
    }

  } catch (error) {
    console.error('Error checking production readiness:', error);
    critical_missing.push('database_connection');
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Failed to connect to database',
    });
  }

  // Determine overall readiness
  const ready = critical_missing.length === 0;

  return {
    ready,
    warnings,
    critical_missing,
    data_counts,
    checks,
  };
}

/**
 * Get a simple readiness status for quick checks
 * 
 * @returns Promise<boolean> - True if system is production-ready
 */
export async function isProductionReady(): Promise<boolean> {
  const result = await checkProductionReadiness();
  return result.ready;
}

/**
 * Get a human-readable summary of production readiness
 * 
 * @returns Promise<string> - Summary message
 */
export async function getReadinessSummary(): Promise<string> {
  const result = await checkProductionReadiness();
  
  if (result.ready) {
    return 'System is production-ready ✓';
  }
  
  if (result.critical_missing.length > 0) {
    return `Missing critical data: ${result.critical_missing.join(', ')}`;
  }
  
  return 'System requires attention before production deployment';
}

