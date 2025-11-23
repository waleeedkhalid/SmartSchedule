// Database queries for instructors
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { createClient } from '@/supabase/server';
import { Instructor, InstructorInput, InstructorLoad } from '@/lib/types/database';

/**
 * Get all instructors (DEPRECATED - use getInstructorsPaginated instead)
 * @deprecated Use getInstructorsPaginated for better performance
 */
export async function getInstructors() {
  const instructors = await db.instructor.findMany({
    orderBy: { name: 'asc' }
  });
  
  return instructors as Instructor[];
}

/**
 * Get paginated instructors with optional search and sorting
 * Implements server-side pagination for optimal performance
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of instructors per page (default: 20)
 * @param searchTerm - Optional search term for filtering by name or email
 * @param sortBy - Field to sort by (default: 'name')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing instructors array, total count, and total pages
 */
export async function getInstructorsPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  sortBy: 'name' | 'email' | 'max_load_per_week' = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const skip = (page - 1) * pageSize;
  
  // Build where clause
  const where = searchTerm && searchTerm.trim() ? {
    OR: [
      { name: { contains: searchTerm.trim(), mode: 'insensitive' as const } },
      { email: { contains: searchTerm.trim(), mode: 'insensitive' as const } }
    ]
  } : {};
  
  // Build orderBy clause
  const orderBy = { [sortBy]: sortOrder };
  
  // Execute queries in parallel
  const [instructors, totalCount] = await Promise.all([
    db.instructor.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        preferred_times: true,
        unavailable_times: true,
        max_load_per_week: true,
        created_at: true,
        updated_at: true
      },
      orderBy,
      skip,
      take: pageSize
    }),
    db.instructor.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    instructors: instructors as Instructor[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

export async function getInstructorById(id: string) {
  const instructor = await db.instructor.findUnique({
    where: { id }
  });
  
  if (!instructor) {
    throw new Error(`Instructor with id ${id} not found`);
  }
  
  return instructor as Instructor;
}

export async function createInstructor(instructor: InstructorInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const created = await db.instructor.create({
    data: {
      ...instructor,
      created_by: user?.id || null
    }
  });
  
  return created as Instructor;
}

export async function updateInstructor(id: string, updates: Partial<InstructorInput>) {
  const updated = await db.instructor.update({
    where: { id },
    data: updates
  });
  
  return updated as Instructor;
}

export async function deleteInstructor(id: string) {
  await db.instructor.delete({
    where: { id }
  });
}

export async function getInstructorLoad(instructorId: string) {
  // Convert RPC to Prisma: Calculate instructor load from sections
  const sections = await db.section.findMany({
    where: { instructor_id: instructorId },
    include: {
      course: {
        select: {
          credits: true,
          weekly_hours: true
        }
      }
    }
  });
  
  const totalSections = sections.length;
  const totalWeeklyHours = sections.reduce((sum, section) => {
    const hours = section.course?.weekly_hours || 0;
    return sum + hours;
  }, 0);
  
  const instructor = await db.instructor.findUnique({
    where: { id: instructorId },
    select: {
      max_load_per_week: true
    }
  });
  
  const maxLoad = instructor?.max_load_per_week || 12;
  const withinLimit = totalWeeklyHours <= maxLoad;
  
  return {
    instructor_id: instructorId,
    total_sections: totalSections,
    total_weekly_hours: totalWeeklyHours,
    max_load_per_week: maxLoad,
    within_load_limit: withinLimit,
    load_percentage: maxLoad > 0 ? (totalWeeklyHours / maxLoad) * 100 : 0
  } as InstructorLoad;
}

/**
 * Get instructor complete schedule with all details (OPTIMIZED)
 * 
 * This function uses the advanced database function that consolidates
 * multiple queries into one optimized query.
 * 
 * PERFORMANCE:
 * - Before: 5-8 separate queries (sections, courses, enrollments, exams)
 * - After: 1 optimized database function with JOINs and aggregations
 * - Improvement: 90% faster (500ms → 50ms)
 * 
 * Returns complete instructor schedule including:
 * - Section details (course, room, capacity)
 * - Enrollment counts per section
 * - Exam information
 * 
 * @param instructorId - UUID of the instructor
 * @returns Array of sections with complete details
 */
export async function getInstructorScheduleWithDetails(instructorId: string) {
  // Convert RPC to Prisma: Get instructor schedule with all details
  // Note: Exams are course-level (linked to course_code, not section_id)
  const sections = await db.section.findMany({
    where: { instructor_id: instructorId },
    include: {
      course: {
        include: {
          exam: {
            select: {
              date: true,
              start_time: true,
              duration_minutes: true
            }
          }
        }
      },
      room: {
        select: {
          code: true
        }
      },
      student_enrollment: {
        where: {
          status: 'registered'
        },
        select: {
          id: true
        }
      }
    }
  });
  
  return sections.map(section => ({
    section_id: section.id,
    course_code: section.course_code,
    course_title: section.course?.title || '',
    course_credits: section.course?.credits || 0,
    section_no: section.section_no,
    room_code: section.room?.code || null,
    capacity: section.capacity,
    enrolled_count: section.student_enrollment?.length || 0,
    meeting_pattern: section.meeting_pattern,
    state: section.state as 'draft' | 'released',
    exam_date: section.course?.exam?.[0]?.date?.toString() || null,
    exam_start_time: section.course?.exam?.[0]?.start_time?.toString() || null,
    exam_duration_minutes: section.course?.exam?.[0]?.duration_minutes || null
  }));
}

/**
 * Get instructor workload summary (uses optimized view)
 * 
 * Uses pre-computed view for instant results.
 * Perfect for faculty dashboard overview.
 * 
 * @param instructorId - UUID of the instructor
 * @returns Workload summary with sections and load calculations
 */
export async function getInstructorWorkloadSummary(instructorId: string) {
  // Convert view query to Prisma: Calculate workload summary
  const instructor = await db.instructor.findUnique({
    where: { id: instructorId },
    select: {
      id: true,
      name: true,
      email: true,
      max_load_per_week: true
    }
  });
  
  if (!instructor) {
    throw new Error(`Instructor with id ${instructorId} not found`);
  }
  
  const sections = await db.section.findMany({
    where: { instructor_id: instructorId },
    include: {
      course: {
        select: {
          code: true,
          weekly_hours: true
        }
      }
    }
  });
  
  const totalSections = sections.length;
  const totalWeeklyHours = sections.reduce((sum, section) => {
    return sum + (section.course?.weekly_hours || 0);
  }, 0);
  
  const withinLoadLimit = totalWeeklyHours <= (instructor.max_load_per_week || 12);
  
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    max_load_per_week: instructor.max_load_per_week || 12,
    total_sections: totalSections,
    total_weekly_hours: totalWeeklyHours,
    within_load_limit: withinLoadLimit,
    sections: sections.map(section => ({
      course_code: section.course_code,
      section_no: section.section_no,
      weekly_hours: section.course?.weekly_hours || 0
    }))
  };
}

