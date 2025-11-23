/**
 * Student Enrollment Database Access Layer
 * 
 * Purpose: Manage student registrations for elective sections
 * 
 * Key Concepts:
 * - Required courses: Auto-enrolled based on student level (no entries in this table)
 * - Elective courses: Student manually registers (tracked in student_enrollment table)
 * - Constraints: Max 20 credits total, section capacity limits, prerequisites
 * 
 * Data Flow:
 * 1. Student views available elective sections
 * 2. System validates: credit limit, capacity, prerequisites
 * 3. Enrollment created with status='registered'
 * 4. Student can drop enrollment (status updated to 'dropped')
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 */

import { db } from '@/lib/db';
import { EnrollmentStatus } from '@prisma/client';
import type { 
  StudentEnrollmentView, 
  AvailableElectiveSection,
  StudentCreditsInfo,
  SectionCapacityInfo,
  EnrollmentValidationResult
} from '@/lib/types/database';

/**
 * Get all enrollments for a student with full course/section details
 * @param studentId - UUID of the student (StudentProfile.userId)
 * @returns Array of enrollments with joined data
 */
export async function getStudentEnrollments(studentId: string): Promise<StudentEnrollmentView[]> {
  const enrollments = await db.studentEnrollment.findMany({
    where: {
      studentId,
      status: 'registered' // Only active enrollments
    },
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
          room: true
        }
      }
    },
    orderBy: {
      enrolledAt: 'desc'
    }
  });
  
  // Transform Prisma response to match our view interface
  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    student_id: enrollment.studentId,
    section_id: enrollment.sectionId,
    status: enrollment.status,
    enrolled_at: enrollment.enrolledAt.toISOString(),
    dropped_at: enrollment.droppedAt?.toISOString() || null,
    section: {
      id: enrollment.section.id,
      course_code: enrollment.section.courseCode,
      section_no: enrollment.section.sectionNo,
      instructor_id: enrollment.section.instructorId,
      room_code: enrollment.section.roomCode,
      capacity: enrollment.section.capacity,
      meeting_pattern: enrollment.section.meetingPattern as any,
      group_level: enrollment.section.groupLevel,
      state: enrollment.section.state,
    },
    course: enrollment.section.course,
    instructor: enrollment.section.instructor ? {
      id: enrollment.section.instructor.userId,
      name: enrollment.section.instructor.user.name,
      email: enrollment.section.instructor.user.email
    } : null,
  }));
}

/**
 * Get available elective sections for registration
 * 
 * IMPORTANT: Electives have no level restrictions! Students can register for any elective
 * as long as they meet prerequisites and credit requirements. The 'level' field in the
 * course table for electives is only for organizational/categorization purposes.
 * 
 * @returns Array of available elective sections with capacity info
 */
export async function getAvailableElectiveSections(): Promise<AvailableElectiveSection[]> {
  // Get all elective courses
  const electiveCourses = await db.course.findMany({
    where: {
      isElective: true
    },
    include: {
      electiveGroup: true
    }
  });
  
  const courseCodes = electiveCourses.map(c => c.code);
  
  // Get all sections for elective courses with enrollment counts
  const sections = await db.section.findMany({
    where: {
      courseCode: {
        in: courseCodes
      },
      state: 'released' // Only show released sections
    },
    include: {
      course: {
        include: {
          electiveGroup: true
        }
      },
      instructor: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      room: true,
      enrollments: {
        where: {
          status: 'registered'
        }
      }
    }
  });
  
  // Transform to AvailableElectiveSection format
  return sections.map((section) => {
    const enrolledCount = section.enrollments.length;
    const availableSeats = section.capacity - enrolledCount;
    
    return {
      section_id: section.id,
      course_code: section.courseCode,
      course_title: section.course.title,
      section_no: section.sectionNo,
      course_credits: section.course.credits,
      course_level: section.course.level,
      elective_group_id: section.course.electiveGroupId,
      elective_group_name: section.course.electiveGroup?.name || null,
      instructor_id: section.instructorId,
      instructor_name: section.instructor?.user.name || null,
      instructor_email: section.instructor?.user.email || null,
      room_code: section.roomCode,
      room_type: section.room?.type || null,
      capacity: section.capacity,
      enrolled_count: enrolledCount,
      available_seats: availableSeats,
      is_full: availableSeats <= 0,
      meeting_pattern: section.meetingPattern as any,
      group_level: section.groupLevel,
    } as AvailableElectiveSection;
  });
}

/**
 * Get available elective sections with pagination
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of sections per page (default: 20)
 * @param filters - Optional filters: { electiveGroupId?, minSeats?, onlyAvailable? }
 * @param sortBy - Field to sort by (default: 'course_code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing sections array, total count, and pagination info
 */
export async function getAvailableElectiveSectionsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    electiveGroupId?: string
    minSeats?: number
    onlyAvailable?: boolean
  },
  sortBy: 'course_code' | 'course_level' | 'available_seats' = 'course_code',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<{
  sections: AvailableElectiveSection[]
  totalCount: number
  totalPages: number
  currentPage: number
  pageSize: number
}> {
  // Get all available sections
  let sections = await getAvailableElectiveSections();
  
  // Apply filters
  if (filters?.electiveGroupId) {
    sections = sections.filter(s => s.elective_group_id === filters.electiveGroupId);
  }
  
  if (filters?.minSeats !== undefined) {
    sections = sections.filter(s => s.available_seats >= filters.minSeats!);
  }
  
  if (filters?.onlyAvailable) {
    sections = sections.filter(s => s.available_seats > 0);
  }
  
  // Apply sorting
  sections.sort((a, b) => {
    let aVal: any;
    let bVal: any;
    
    switch (sortBy) {
      case 'course_code':
        aVal = a.course_code;
        bVal = b.course_code;
        break;
      case 'course_level':
        aVal = a.course_level;
        bVal = b.course_level;
        break;
      case 'available_seats':
        aVal = a.available_seats;
        bVal = b.available_seats;
        break;
      default:
        aVal = a.course_code;
        bVal = b.course_code;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
  
  const totalCount = sections.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedSections = sections.slice(from, to);
  
  return {
    sections: paginatedSections,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

/**
 * Calculate total credits for a student (required + elective)
 * 
 * @param studentId - UUID of the student (StudentProfile.userId)
 * @returns Credit breakdown object
 */
export async function calculateStudentCredits(studentId: string): Promise<StudentCreditsInfo> {
  // Get all active enrollments with course credits
  const enrollments = await db.studentEnrollment.findMany({
    where: {
      studentId,
      status: 'registered'
    },
    include: {
      section: {
        include: {
          course: true
        }
      }
    }
  });
  
  const total = enrollments.reduce((sum, enrollment) => {
    return sum + enrollment.section.course.credits;
  }, 0);
  
  // Separate required vs elective (based on enrollmentType)
  const required = enrollments
    .filter(e => e.enrollmentType === 'required')
    .reduce((sum, e) => sum + e.section.course.credits, 0);
  
  const elective = enrollments
    .filter(e => e.enrollmentType === 'elective')
    .reduce((sum, e) => sum + e.section.course.credits, 0);
  
  return {
    total,
    required,
    elective
  };
}

/**
 * Check section capacity and availability
 * 
 * @param sectionId - UUID of the section
 * @returns Capacity information
 */
export async function checkSectionCapacity(sectionId: string): Promise<SectionCapacityInfo> {
  const section = await db.section.findUnique({
    where: { id: sectionId },
    include: {
      enrollments: {
        where: {
          status: 'registered'
        }
      }
    }
  });
  
  if (!section) {
    throw new Error('Section not found');
  }
  
  const enrolledCount = section.enrollments.length;
  const availableSeats = section.capacity - enrolledCount;
  
  return {
    section_id: section.id,
    capacity: section.capacity,
    enrolled_count: enrolledCount,
    available_seats: availableSeats,
    is_full: availableSeats <= 0
  };
}

/**
 * Enroll a student in a section (elective or required)
 * Validates all constraints before creating enrollment
 * 
 * Validation Flow:
 * 1. Check if already enrolled (prevent duplicates)
 * 2. Validate credit limit (≤20 total) - for electives only
 * 3. Check section capacity (seats available)
 * 4. Verify prerequisites (V1: always pass)
 * 5. Create enrollment record
 * 
 * @param studentId - UUID of the student (StudentProfile.userId)
 * @param sectionId - UUID of the section to enroll in
 * @param enrollmentType - Type of enrollment: 'required' or 'elective' (default: 'elective')
 * @returns Success status and enrollment ID or error message
 */
export async function enrollInSection(
  studentId: string, 
  sectionId: string,
  enrollmentType: 'required' | 'elective' = 'elective'
): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  try {
    // Step 1: Check if already enrolled
    const existing = await db.studentEnrollment.findFirst({
      where: {
        studentId,
        sectionId,
        status: 'registered'
      }
    });
    
    if (existing) {
      return { success: false, error: 'Already enrolled in this section' };
    }
    
    // Step 2-4: Validate constraints (only for electives)
    if (enrollmentType === 'elective') {
      // Check credit limit
      const credits = await calculateStudentCredits(studentId);
      const section = await db.section.findUnique({
        where: { id: sectionId },
        include: { course: true }
      });
      
      if (!section) {
        return { success: false, error: 'Section not found' };
      }
      
      if (credits.total + section.course.credits > 20) {
        return { success: false, error: 'Credit limit exceeded (max 20 credits)' };
      }
      
      // Check capacity
      const capacity = await checkSectionCapacity(sectionId);
      if (capacity.is_full) {
        return { success: false, error: 'Section is full' };
      }
    }
    
    // Step 5: All validations passed - create enrollment
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
      enrollmentId: enrollment.id 
    };
  } catch (error: any) {
    console.error('Error enrolling student:', error);
    return { success: false, error: error.message || 'Failed to create enrollment' };
  }
}

/**
 * Drop an enrollment (mark as dropped, not delete)
 * Maintains audit trail by updating status instead of deleting
 * 
 * @param enrollmentId - UUID of the enrollment record
 * @param studentId - UUID of the student (for authorization)
 * @returns Success status
 */
export async function dropEnrollment(
  enrollmentId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the enrollment belongs to the student
    const enrollment = await db.studentEnrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId,
        status: 'registered' // Only drop active enrollments
      }
    });
    
    if (!enrollment) {
      return { success: false, error: 'Enrollment not found or already dropped' };
    }
    
    // Update enrollment status to 'dropped'
    await db.studentEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'dropped',
        droppedAt: new Date()
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error dropping enrollment:', error);
    return { success: false, error: error.message || 'Failed to drop enrollment' };
  }
}

/**
 * Get enrollment statistics for a student
 * Useful for displaying overview cards
 * 
 * @param studentId - UUID of the student (StudentProfile.userId)
 * @returns Enrollment counts and credit totals
 */
export async function getEnrollmentStats(studentId: string) {
  // Get count of active enrollments
  const enrolledCount = await db.studentEnrollment.count({
    where: {
      studentId,
      status: 'registered'
    }
  });
  
  // Get credit breakdown
  const credits = await calculateStudentCredits(studentId);
  
  return {
    enrolled_sections: enrolledCount,
    ...credits,
    available_credits: 20 - credits.total, // How many more credits can be added
  };
}
