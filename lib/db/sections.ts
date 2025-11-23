/**
 * Database queries for sections
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 * 
 * REFACTORED: Added semester context (REQUIRED for all queries)
 * - Sections link to semesters via courseOffering (courseOfferingId -> CourseOffering -> semesterCode)
 * - Added section_type support ('lecture' | 'lab' | 'tutorial')
 */
import { db } from '@/lib/db';
import type { Section, SectionState } from '@prisma/client';
import { getCurrentSemester } from './semesters';
import { createClient } from '@/supabase/server';

// Type for section input (matches Prisma create input)
export type SectionInput = {
  courseCode: string;
  sectionNo: string;
  instructorId?: string | null;
  roomCode?: string | null;
  capacity: number;
  meetingPattern: any; // JSON
  groupLevel: number;
  state?: SectionState;
  isScheduledByAlgorithm?: boolean;
  courseOfferingId?: string | null;
  sectionType?: string; // Not in Prisma schema, but used in old code
  academic_semester_id?: string; // Legacy field - will be converted to courseOfferingId
};

// Type for section conflicts (from RPC function)
export interface SectionConflicts {
  section_id: string;
  conflict_type: string;
  conflicting_section_id?: string;
  conflicting_exam_id?: string;
  details: any;
}

/**
 * Get all sections for a semester (DEPRECATED - use getSectionsPaginated instead)
 * @deprecated Use getSectionsPaginated for better performance
 * @param semesterId - Semester code (defaults to current semester)
 */
export async function getSections(semesterCode?: string): Promise<Section[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Get sections via courseOffering relationship
  const sections = await db.section.findMany({
    where: {
      courseOffering: {
        semesterCode: semester
      }
    },
    orderBy: { courseCode: 'asc' }
  });
  
  return sections;
}

/**
 * Get paginated sections with optional filtering and sorting
 * Implements server-side pagination for optimal performance
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of sections per page (default: 20)
 * @param filters - Optional filters: { semesterId?, level?, state?, courseCode?, instructorId?, sectionType? }
 * @param sortBy - Field to sort by (default: 'course_code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing sections array, total count, and total pages
 */
export async function getSectionsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    semesterId?: string
    level?: number
    state?: 'draft' | 'released'
    courseCode?: string
    instructorId?: string
    sectionType?: 'lecture' | 'lab' | 'tutorial'
  },
  sortBy: 'course_code' | 'section_no' | 'group_level' | 'state' = 'course_code',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  // Get semester code (required)
  const semester = filters?.semesterId || (await getCurrentSemester())?.code;
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Build where clause
  const where: any = {
    courseOffering: {
      semesterCode: semester
    }
  };
  
  // Apply filters
  if (filters?.level) {
    where.groupLevel = filters.level;
  }
  if (filters?.state) {
    where.state = filters.state;
  }
  if (filters?.courseCode) {
    where.courseCode = filters.courseCode;
  }
  if (filters?.instructorId) {
    where.instructorId = filters.instructorId;
  }
  // Note: sectionType is not in Prisma schema, would need to be added or handled differently
  
  // Build orderBy
  const orderBy: any = {};
  if (sortBy === 'course_code') {
    orderBy.courseCode = sortOrder;
  } else if (sortBy === 'section_no') {
    orderBy.sectionNo = sortOrder;
  } else if (sortBy === 'group_level') {
    orderBy.groupLevel = sortOrder;
  } else if (sortBy === 'state') {
    orderBy.state = sortOrder;
  }
  
  // Get total count and data
  const [sections, totalCount] = await Promise.all([
    db.section.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.section.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    sections,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

export async function getSectionById(id: string): Promise<Section | null> {
  return await db.section.findUnique({
    where: { id }
  });
}

export async function getSectionsByCourse(courseCode: string, semesterCode?: string): Promise<Section[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  return await db.section.findMany({
    where: {
      courseCode,
      courseOffering: {
        semesterCode: semester
      }
    },
    orderBy: { sectionNo: 'asc' }
  });
}

export async function getSectionsByInstructor(instructorId: string, semesterCode?: string): Promise<Section[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  return await db.section.findMany({
    where: {
      instructorId,
      courseOffering: {
        semesterCode: semester
      }
    },
    orderBy: { courseCode: 'asc' }
  });
}

export async function getSectionsByLevel(level: number, semesterCode?: string): Promise<Section[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  return await db.section.findMany({
    where: {
      groupLevel: level,
      courseOffering: {
        semesterCode: semester
      }
    },
    orderBy: { courseCode: 'asc' }
  });
}

export async function createSection(section: SectionInput): Promise<Section> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Handle legacy academic_semester_id by finding/creating courseOffering
  let courseOfferingId = section.courseOfferingId;
  
  if (!courseOfferingId && section.academic_semester_id) {
    // Legacy: convert academic_semester_id to courseOfferingId
    // Find or create courseOffering for this course + semester
    const semesterCode = section.academic_semester_id; // Assuming it's the semester code
    const offering = await db.courseOffering.findUnique({
      where: {
        courseCode_semesterCode: {
          courseCode: section.courseCode,
          semesterCode: semesterCode
        }
      }
    });
    
    if (offering) {
      courseOfferingId = offering.id;
    } else {
      // Create courseOffering if it doesn't exist
      const newOffering = await db.courseOffering.create({
        data: {
          courseCode: section.courseCode,
          semesterCode: semesterCode,
          isActive: true
        }
      });
      courseOfferingId = newOffering.id;
    }
  } else if (!courseOfferingId) {
    // Try to use current semester
    const currentSemester = await getCurrentSemester();
    if (currentSemester) {
      const offering = await db.courseOffering.findUnique({
        where: {
          courseCode_semesterCode: {
            courseCode: section.courseCode,
            semesterCode: currentSemester.code
          }
        }
      });
      
      if (offering) {
        courseOfferingId = offering.id;
      }
    }
    
    if (!courseOfferingId) {
      throw new Error('courseOfferingId is required. No current semester or course offering found.');
    }
  }
  
  return await db.section.create({
    data: {
      courseCode: section.courseCode,
      sectionNo: section.sectionNo,
      instructorId: section.instructorId ?? null,
      roomCode: section.roomCode ?? null,
      capacity: section.capacity,
      meetingPattern: section.meetingPattern,
      groupLevel: section.groupLevel,
      state: section.state ?? 'draft',
      isScheduledByAlgorithm: section.isScheduledByAlgorithm ?? false,
      courseOfferingId: courseOfferingId,
      createdBy: user?.id ?? null
    }
  });
}

export async function updateSection(id: string, updates: Partial<SectionInput>): Promise<Section> {
  // Convert updates to Prisma format
  const prismaUpdates: any = {};
  
  if (updates.courseCode !== undefined) prismaUpdates.courseCode = updates.courseCode;
  if (updates.sectionNo !== undefined) prismaUpdates.sectionNo = updates.sectionNo;
  if (updates.instructorId !== undefined) prismaUpdates.instructorId = updates.instructorId ?? null;
  if (updates.roomCode !== undefined) prismaUpdates.roomCode = updates.roomCode ?? null;
  if (updates.capacity !== undefined) prismaUpdates.capacity = updates.capacity;
  if (updates.meetingPattern !== undefined) prismaUpdates.meetingPattern = updates.meetingPattern;
  if (updates.groupLevel !== undefined) prismaUpdates.groupLevel = updates.groupLevel;
  if (updates.state !== undefined) prismaUpdates.state = updates.state;
  if (updates.isScheduledByAlgorithm !== undefined) prismaUpdates.isScheduledByAlgorithm = updates.isScheduledByAlgorithm;
  if (updates.courseOfferingId !== undefined) prismaUpdates.courseOfferingId = updates.courseOfferingId ?? null;
  
  return await db.section.update({
    where: { id },
    data: prismaUpdates
  });
}

export async function deleteSection(id: string): Promise<void> {
  await db.section.delete({
    where: { id }
  });
}

/**
 * Get section conflicts using RPC function
 * Note: RPC functions still use Supabase client as they're database functions
 */
export async function getSectionConflicts(sectionId: string): Promise<SectionConflicts | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_section_conflicts', { p_section_id: sectionId });
  
  if (error) throw error;
  return data as SectionConflicts | null;
}

/**
 * Get all schedule conflicts using RPC function
 * Note: RPC functions still use Supabase client as they're database functions
 */
export async function getAllScheduleConflicts(): Promise<SectionConflicts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_all_schedule_conflicts');
  
  if (error) throw error;
  return (data || []) as SectionConflicts[];
}

/**
 * Get sections for SWE courses only (for scheduling algorithm)
 * Filters to SWE courses in levels 4-8
 * 
 * @param state - Section state to filter by (default: 'draft')
 * @returns Array of SWE course sections ready for scheduling
 */
export async function getSWESectionsForScheduling(state: 'draft' | 'released' = 'draft'): Promise<Section[]> {
  return await db.section.findMany({
    where: {
      state,
      isScheduledByAlgorithm: true,
      groupLevel: {
        gte: 4,
        lte: 8
      }
    },
    include: {
      course: {
        select: {
          code: true,
          level: true
        }
      },
      courseOffering: {
        include: {
          semester: true
        }
      }
    }
  });
}
