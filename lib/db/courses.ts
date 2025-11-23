/**
 * Database queries for courses
 * 
 * [INTEGRATION] Migrated to Prisma ORM
 * - Uses Prisma schema field names (title, weeklyHours, isElective)
 * - Transforms Prisma camelCase to snake_case for component compatibility
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 */
import { db } from '@/lib/db';
import { createClient } from '@/supabase/server';
import { Course, CourseInput } from '@/lib/types/database';

/**
 * [INTEGRATION] Transform Prisma Course (camelCase) to component format (snake_case)
 * Helper function to ensure consistent data transformation
 */
function transformPrismaCourse(course: {
  code: string;
  title: string;
  level: number;
  credits: number;
  weeklyHours: number;
  isElective: boolean;
  electiveGroupId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
}): Course {
  return {
    code: course.code,
    title: course.title,
    level: course.level,
    credits: course.credits,
    weekly_hours: course.weeklyHours,
    is_elective: course.isElective,
    elective_group_id: course.electiveGroupId || null,
    created_at: course.createdAt.toISOString(),
    updated_at: course.updatedAt.toISOString(),
    created_by: course.createdBy || null,
  };
}

export async function getCourses() {
  const courses = await db.course.findMany({
    orderBy: { code: 'asc' }
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

export async function getCourseByCode(code: string) {
  const course = await db.course.findUnique({
    where: { code }
  });
  
  if (!course) {
    throw new Error(`Course with code ${code} not found`);
  }
  
  // [INTEGRATION] Transform Prisma result to snake_case format
  return transformPrismaCourse(course);
}

export async function getCoursesByLevel(level: number) {
  const courses = await db.course.findMany({
    where: { level },
    orderBy: { code: 'asc' }
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

export async function getElectiveCourses() {
  const courses = await db.course.findMany({
    where: { isElective: true },
    orderBy: { code: 'asc' }
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

/**
 * Course input that accepts both snake_case (from forms) and camelCase (from CourseInput type)
 */
type FlexibleCourseInput = {
  code: string;
  title: string;
  level: number;
  credits: number;
  weekly_hours?: number;
  is_elective?: boolean;
  elective_group_id?: string | null;
  weeklyHours?: number;
  isElective?: boolean;
  electiveGroupId?: string | null;
};

export async function createCourse(course: FlexibleCourseInput | CourseInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // [INTEGRATION] Accept both snake_case (from forms) and camelCase (from CourseInput)
  // Transform snake_case to camelCase for Prisma
  // Use type assertion to access both formats
  const courseData = course as FlexibleCourseInput;
  const weeklyHours = courseData.weeklyHours ?? courseData.weekly_hours;
  const isElective = courseData.isElective ?? courseData.is_elective;
  const electiveGroupId = courseData.electiveGroupId ?? courseData.elective_group_id;
  
  // Validate required fields
  if (weeklyHours === undefined) {
    throw new Error('weeklyHours or weekly_hours is required');
  }
  if (isElective === undefined) {
    throw new Error('isElective or is_elective is required');
  }
  
  const created = await db.course.create({
    data: {
      code: course.code,
      title: course.title,
      level: course.level,
      credits: course.credits,
      weeklyHours: weeklyHours,
      isElective: isElective,
      electiveGroupId: electiveGroupId || null,
      createdBy: user?.id || null
    }
  });
  
  // [INTEGRATION] Transform Prisma result to snake_case format
  return transformPrismaCourse(created);
}

/**
 * Course update input that accepts both snake_case (from forms) and camelCase (from CourseInput type)
 */
type FlexibleCourseUpdate = {
  title?: string;
  level?: number;
  credits?: number;
  weekly_hours?: number;
  is_elective?: boolean;
  elective_group_id?: string | null;
  weeklyHours?: number;
  isElective?: boolean;
  electiveGroupId?: string | null;
};

export async function updateCourse(code: string, updates: FlexibleCourseUpdate | Partial<CourseInput>) {
  // [INTEGRATION] Accept both snake_case (from forms) and camelCase (from CourseInput)
  // Map to Prisma schema field names (camelCase)
  // Use type assertion to access both formats
  const updateData = updates as FlexibleCourseUpdate;
  const prismaUpdates: {
    title?: string;
    level?: number;
    credits?: number;
    weeklyHours?: number;
    isElective?: boolean;
    electiveGroupId?: string | null;
  } = {};
  
  if (updateData.title !== undefined) prismaUpdates.title = updateData.title;
  if (updateData.level !== undefined) prismaUpdates.level = updateData.level;
  if (updateData.credits !== undefined) prismaUpdates.credits = updateData.credits;
  
  // Handle both snake_case and camelCase for weeklyHours
  if (updateData.weeklyHours !== undefined) {
    prismaUpdates.weeklyHours = updateData.weeklyHours;
  } else if (updateData.weekly_hours !== undefined) {
    prismaUpdates.weeklyHours = updateData.weekly_hours;
  }
  
  // Handle both snake_case and camelCase for isElective
  if (updateData.isElective !== undefined) {
    prismaUpdates.isElective = updateData.isElective;
  } else if (updateData.is_elective !== undefined) {
    prismaUpdates.isElective = updateData.is_elective;
  }
  
  // Handle both snake_case and camelCase for electiveGroupId
  if (updateData.electiveGroupId !== undefined) {
    prismaUpdates.electiveGroupId = updateData.electiveGroupId;
  } else if (updateData.elective_group_id !== undefined) {
    prismaUpdates.electiveGroupId = updateData.elective_group_id;
  }
  
  const updated = await db.course.update({
    where: { code },
    data: prismaUpdates
  });
  
  // [INTEGRATION] Transform Prisma result to snake_case format
  return transformPrismaCourse(updated);
}

export async function deleteCourse(code: string) {
  await db.course.delete({
    where: { code }
  });
}

/**
 * Get SWE department courses for scheduling (levels 4-8 only)
 * These are the courses managed by the scheduling algorithm
 * 
 * @returns Array of SWE courses in levels 4-8
 */
export async function getSWECoursesForScheduling() {
  const courses = await db.course.findMany({
    where: {
      level: {
        gte: 4,
        lte: 8
      },
      code: {
        startsWith: 'SWE'
      }
    },
    orderBy: [
      { level: 'asc' },
      { code: 'asc' }
    ]
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

/**
 * Get external department courses (non-SWE)
 * These are reference/mock courses, not scheduled by the system
 * 
 * @returns Array of external department courses
 */
export async function getExternalCourses() {
  const courses = await db.course.findMany({
    where: {
      NOT: {
        code: {
          startsWith: 'SWE'
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { code: 'asc' }
    ]
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

/**
 * Check if a course is schedulable by the system (SWE course in levels 4-8)
 * 
 * @param courseCode - Course code to check
 * @param level - Course level
 * @returns True if course should be scheduled by algorithm
 */
// Note: isSWESchedulableCourse has been moved to lib/utils/course-utils.ts
// to allow safe imports in Client Components

/**
 * Get all courses with their elective group information
 * @returns Array of courses with elective group details
 */
export async function getCoursesWithElectiveGroups() {
  const courses = await db.course.findMany({
    include: {
      elective_group: {
        select: {
          id: true,
          name: true,
          required_credit_hours: true
        }
      }
    },
    orderBy: [
      { level: 'asc' },
      { code: 'asc' }
    ]
  });
  
  return courses;
}

/**
 * Get elective courses by group ID
 * @param groupId - The elective group ID
 * @returns Array of courses in the elective group
 */
export async function getCoursesByElectiveGroup(groupId: string) {
  const courses = await db.course.findMany({
    where: { elective_group_id: groupId },
    orderBy: { code: 'asc' }
  });
  
  return courses;
}

/**
 * Get required (non-elective) courses by level
 * @param level - The level (1-8)
 * @returns Array of required courses for that level
 */
export async function getRequiredCoursesByLevel(level: number) {
  const courses = await db.course.findMany({
    where: {
      level,
      isElective: false
    },
    orderBy: { code: 'asc' }
  });
  
  // [INTEGRATION] Transform Prisma results to snake_case format
  return courses.map(transformPrismaCourse);
}

/**
 * Get paginated courses with optional search and sorting
 * Implements server-side pagination for optimal performance
 * 
 * [INTEGRATION] Updated to use Prisma schema fields:
 * - Changed 'name' → 'title' to match Prisma schema
 * - Added 'weekly_hours' to sortBy options
 * - Transform Prisma camelCase fields to snake_case for component compatibility
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of courses per page (default: 20)
 * @param searchTerm - Optional search term for filtering by code or title
 * @param sortBy - Field to sort by (default: 'code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing courses array, total count, and total pages
 */
export async function getCoursesPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const skip = (page - 1) * pageSize;
  
  // Build where clause - use 'title' (Prisma field name)
  const where = searchTerm && searchTerm.trim() ? {
    OR: [
      { code: { contains: searchTerm.trim(), mode: 'insensitive' as const } },
      { title: { contains: searchTerm.trim(), mode: 'insensitive' as const } }
    ]
  } : {};
  
  // Map sortBy field names: component uses snake_case, Prisma uses camelCase
  const prismaSortField = sortBy === 'weekly_hours' ? 'weeklyHours' : sortBy;
  
  // Build orderBy clause
  const orderBy = { [prismaSortField]: sortOrder };
  
  // Execute queries in parallel
  const [courses, totalCount] = await Promise.all([
    db.course.findMany({
      where,
      orderBy,
      skip,
      take: pageSize
    }),
    db.course.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // [INTEGRATION] Transform Prisma camelCase fields to snake_case for component compatibility
  const transformedCourses = courses.map(transformPrismaCourse);
  
  return {
    courses: transformedCourses,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

