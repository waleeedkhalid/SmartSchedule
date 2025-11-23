/**
 * Database queries for student enrollments
 * 
 * MIGRATED: Now uses Prisma ORM with StudentEnrollment model
 * 
 * Note: The Prisma schema uses a single StudentEnrollment table that tracks
 * enrollments at the section level, not separate course_enrollment and section_assignment tables.
 */

import { db } from '@/lib/db';
import { calculateStudentCredits } from './student-enrollments';

export interface EnrollmentValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
  current_credits?: number;
  max_credits?: number;
  section_capacity?: number;
  section_enrollment?: number;
}

/**
 * Validate if a student can enroll in a section
 * @param studentId - Student ID (StudentProfile.userId)
 * @param sectionId - Section ID
 * @returns Validation result
 */
export async function validateEnrollment(
  studentId: string,
  sectionId: string
): Promise<EnrollmentValidation> {
  try {
    // 1. Check if section exists
    const section = await db.section.findUnique({
      where: { id: sectionId },
      include: {
        course: true,
        enrollments: {
          where: {
            status: 'registered'
          }
        }
      }
    });
    
    if (!section) {
      return {
        valid: false,
        error: 'Section not found'
      };
    }
    
    // 2. Check capacity
    const enrolledCount = section.enrollments.length;
    if (enrolledCount >= section.capacity) {
      return {
        valid: false,
        error: 'Section is full',
        section_capacity: section.capacity,
        section_enrollment: enrolledCount
      };
    }
    
    // 3. Check if already enrolled
    const existingEnrollment = await db.studentEnrollment.findFirst({
      where: {
        studentId,
        sectionId,
        status: 'registered'
      }
    });
    
    if (existingEnrollment) {
      return {
        valid: false,
        error: 'Already enrolled in this section'
      };
    }
    
    // 4. Check credit limit (for electives)
    const credits = await calculateStudentCredits(studentId);
    if (credits.total + section.course.credits > 20) {
      return {
        valid: false,
        error: 'Credit limit exceeded (max 20 credits)',
        current_credits: credits.total,
        max_credits: 20
      };
    }
    
    return {
      valid: true,
      current_credits: credits.total,
      max_credits: 20
    };
  } catch (error) {
    console.error('Error validating enrollment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Validation failed';
    return {
      valid: false,
      error: errorMessage
    };
  }
}

/**
 * Assign a student to a section (enroll)
 * This creates a StudentEnrollment record
 * @param studentId - Student ID (StudentProfile.userId)
 * @param sectionId - Section ID
 * @param enrollmentType - Type of enrollment ('required' | 'elective' | 'retake')
 * @returns Enrollment result
 */
export async function assignStudentToSection(
  studentId: string,
  sectionId: string,
  enrollmentType: 'required' | 'elective' | 'retake' = 'elective'
): Promise<{ success: boolean; enrollment_id?: string; error?: string }> {
  try {
    // Validate first
    const validation = await validateEnrollment(studentId, sectionId);
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Validation failed'
      };
    }
    
    // Create enrollment
    const enrollment = await db.studentEnrollment.create({
      data: {
        studentId,
        sectionId,
        status: 'registered',
        enrollmentType
      }
    });
    
    return {
      success: true,
      enrollment_id: enrollment.id
    };
  } catch (error) {
    console.error('Error assigning student to section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create enrollment';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Drop a section (unenroll a student)
 * Updates the enrollment status to 'dropped'
 * @param studentId - Student ID (StudentProfile.userId)
 * @param sectionId - Section ID
 * @returns Success status
 */
export async function dropSection(
  studentId: string,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the enrollment
    const enrollment = await db.studentEnrollment.findFirst({
      where: {
        studentId,
        sectionId,
        status: 'registered'
      }
    });
    
    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }
    
    // Update status to dropped
    await db.studentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'dropped',
        droppedAt: new Date()
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error dropping section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to drop enrollment';
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get student's total credits for a semester
 * @param studentId - Student ID (StudentProfile.userId)
 * @param semesterId - Semester code (optional, e.g., "471", "472")
 * @returns Total credits for the specified semester, or all semesters if not provided
 */
export async function getStudentTotalCredits(
  studentId: string,
  semesterId?: string
): Promise<number> {
  // Build where clause for enrollments
  const whereClause: {
    studentId: string;
    status: 'registered';
    section?: {
      courseOffering: {
        semesterCode: string;
      };
    };
  } = {
    studentId,
    status: 'registered'
  };
  
  // If semester is specified, filter by section's course offering
  // Distinguish between undefined/null (optional) and empty string (invalid)
  if (semesterId !== undefined && semesterId !== null && semesterId !== '') {
    whereClause.section = {
      courseOffering: {
        semesterCode: semesterId
      }
    };
  }
  
  // Get enrollments with course credits
  const enrollments = await db.studentEnrollment.findMany({
    where: whereClause,
    include: {
      section: {
        include: {
          course: true
        }
      }
    }
  });
  
  // Calculate total credits
  const total = enrollments.reduce((sum: number, enrollment: { section: { course: { credits: number } } }) => {
    return sum + enrollment.section.course.credits;
  }, 0);
  
  return total;
}

/**
 * Get a student's enrollments with section details for a semester
 * @param studentId - Student ID (StudentProfile.userId)
 * @param semesterId - Semester ID (optional, defaults to current semester)
 * @returns Array of enrollments with sections
 */
export async function getStudentEnrollmentsWithSections(
  studentId: string,
  semesterId?: string
) {
  // Build where clause
  const whereClause: {
    studentId: string;
    status: 'registered';
    section?: {
      courseOffering: {
        semesterCode: string;
      };
    };
  } = {
    studentId,
    status: 'registered'
  };
  
  // If semester is specified, filter by course offering
  // Distinguish between undefined/null (optional) and empty string (invalid)
  if (semesterId !== undefined && semesterId !== null && semesterId !== '') {
    whereClause.section = {
      courseOffering: {
        semesterCode: semesterId
      }
    };
  }
  
  const enrollments = await db.studentEnrollment.findMany({
    where: whereClause,
    include: {
      section: {
        include: {
          course: true,
          instructor: {
            select: {
              userId: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          room: true,
          courseOffering: {
            include: {
              semester: true
            }
          }
        }
      }
    },
    orderBy: {
      enrolledAt: 'desc'
    }
  });
  
  // Transform to match expected format
  return enrollments.map((enrollment: {
    id: string;
    studentId: string;
    sectionId: string;
    status: string;
    enrollmentType: string;
    enrolledAt: Date;
    droppedAt: Date | null;
    section: {
      id: string;
      sectionNo: string;
      meetingPattern: unknown;
      roomCode: string | null;
      course: {
        code: string;
        title: string;
        credits: number;
        level: number;
      };
      instructor: {
        userId: string;
        user: {
          name: string;
          email: string;
        };
      } | null;
    };
  }) => ({
    id: enrollment.id,
    student_id: enrollment.studentId,
    section_id: enrollment.sectionId,
    status: enrollment.status,
    enrollment_type: enrollment.enrollmentType,
    enrolled_at: enrollment.enrolledAt.toISOString(),
    dropped_at: enrollment.droppedAt?.toISOString() || null,
    course: {
      code: enrollment.section.course.code,
      title: enrollment.section.course.title,
      credits: enrollment.section.course.credits,
      level: enrollment.section.course.level
    },
    section: {
      id: enrollment.section.id,
      section_no: enrollment.section.sectionNo,
      meeting_pattern: enrollment.section.meetingPattern,
      room_code: enrollment.section.roomCode,
      instructor: enrollment.section.instructor ? {
        id: enrollment.section.instructor.userId,
        name: enrollment.section.instructor.user.name,
        email: enrollment.section.instructor.user.email
      } : null
    }
  }));
}

/**
 * Get enrollment count for a course in a semester
 * @param courseCode - Course code
 * @param semesterId - Semester ID (optional, defaults to current semester)
 * @returns Enrollment count
 */
export async function getCourseEnrollmentCount(
  courseCode: string,
  semesterId?: string
): Promise<number> {
  const whereClause: {
    section: {
      courseCode: string;
      courseOffering?: {
        semesterCode: string;
      };
    };
    status: 'registered';
  } = {
    section: {
      courseCode
    },
    status: 'registered'
  };
  
  // If semester is specified, filter by course offering
  if (semesterId) {
    whereClause.section.courseOffering = {
      semesterCode: semesterId
    };
  }
  
  const count = await db.studentEnrollment.count({
    where: whereClause
  });
  
  return count;
}
