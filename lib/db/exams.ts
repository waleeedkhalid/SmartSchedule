/**
 * Database queries for exams
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 * 
 * NOTE: Exams in Prisma schema don't have a direct semester link.
 * The old code used academic_semester_id, but Prisma schema doesn't include this.
 * This may need a schema migration to add semesterCode to Exam model.
 * For now, we'll filter by course and date ranges.
 */
import { db } from '@/lib/db';
import type { Exam } from '@prisma/client';
import { getCurrentSemester } from './semesters';
import { createClient } from '@/supabase/server';

// Type for exam input (matches Prisma create input)
export type ExamInput = {
  courseCode: string;
  studentGroupId?: string | null;
  date: Date | string;
  startTime: string;
  durationMinutes: number;
  roomCodes: string[];
  academic_semester_id?: string; // Legacy field - not in Prisma schema
};

/**
 * Get all exams for a semester (DEPRECATED - use getExamsPaginated instead)
 * @deprecated Use getExamsPaginated for better performance
 * @param semesterId - Semester code (defaults to current semester)
 * 
 * NOTE: Since Exam model doesn't have semester link, this filters by date range
 * based on the semester's start/end dates.
 */
export async function getExams(semesterCode?: string): Promise<Exam[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Get semester dates
  const semesterData = await db.academicSemester.findUnique({
    where: { code: semester },
    select: { startDate: true, endDate: true }
  });
  
  if (!semesterData) {
    throw new Error(`Semester ${semester} not found`);
  }
  
  // Filter exams by date range (approximation since no direct semester link)
  return await db.exam.findMany({
    where: {
      date: {
        gte: semesterData.startDate,
        lte: semesterData.endDate
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });
}

/**
 * Get paginated exams with optional filtering and sorting
 * Implements server-side pagination for optimal performance
 * 
 * NOTE: All exams are course-level (apply to all sections of a course)
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of exams per page (default: 20)
 * @param filters - Optional filters: { semesterId?, courseCode?, examType?, startDate?, endDate? }
 * @param sortBy - Field to sort by (default: 'date')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing exams array, total count, and total pages
 */
export async function getExamsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    semesterId?: string
    courseCode?: string
    examType?: 'midterm' | 'midterm2' | 'final' // Note: Not in Prisma schema
    startDate?: string
    endDate?: string
  },
  sortBy: 'date' | 'start_time' | 'course_code' = 'date',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  // Get semester code (required)
  const semester = filters?.semesterId || (await getCurrentSemester())?.code;
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Get semester dates for filtering
  const semesterData = await db.academicSemester.findUnique({
    where: { code: semester },
    select: { startDate: true, endDate: true }
  });
  
  if (!semesterData) {
    throw new Error(`Semester ${semester} not found`);
  }
  
  // Build where clause
  const where: any = {
    date: {
      gte: filters?.startDate ? new Date(filters.startDate) : semesterData.startDate,
      lte: filters?.endDate ? new Date(filters.endDate) : semesterData.endDate
    }
  };
  
  // Apply filters
  if (filters?.courseCode) {
    where.courseCode = filters.courseCode;
  }
  // Note: examType is not in Prisma schema, would need to be added
  
  // Build orderBy
  const orderBy: any = {};
  if (sortBy === 'date') {
    orderBy.date = sortOrder;
    orderBy.startTime = sortOrder; // Secondary sort
  } else if (sortBy === 'start_time') {
    orderBy.startTime = sortOrder;
    orderBy.date = sortOrder; // Secondary sort
  } else if (sortBy === 'course_code') {
    orderBy.courseCode = sortOrder;
  }
  
  // Get total count and data
  const [exams, totalCount] = await Promise.all([
    db.exam.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    db.exam.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  return {
    exams,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  };
}

export async function getExamById(id: string): Promise<Exam | null> {
  return await db.exam.findUnique({
    where: { id }
  });
}

export async function getExamsByCourse(courseCode: string, semesterCode?: string): Promise<Exam[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Get semester dates
  const semesterData = await db.academicSemester.findUnique({
    where: { code: semester },
    select: { startDate: true, endDate: true }
  });
  
  if (!semesterData) {
    throw new Error(`Semester ${semester} not found`);
  }
  
  return await db.exam.findMany({
    where: {
      courseCode,
      date: {
        gte: semesterData.startDate,
        lte: semesterData.endDate
      }
    },
    orderBy: { date: 'asc' }
  });
}

export async function getExamsByDate(date: string, semesterCode?: string): Promise<Exam[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  // Get semester dates to validate
  const semesterData = await db.academicSemester.findUnique({
    where: { code: semester },
    select: { startDate: true, endDate: true }
  });
  
  if (!semesterData) {
    throw new Error(`Semester ${semester} not found`);
  }
  
  const examDate = new Date(date);
  
  // Verify date is within semester range
  if (examDate < semesterData.startDate || examDate > semesterData.endDate) {
    return []; // Return empty if outside semester
  }
  
  return await db.exam.findMany({
    where: {
      date: examDate
    },
    orderBy: { startTime: 'asc' }
  });
}

export async function getExamsByDateRange(startDate: string, endDate: string, semesterCode?: string): Promise<Exam[]> {
  const semester = semesterCode || (await getCurrentSemester())?.code;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester code or set a current semester.');
  }
  
  return await db.exam.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });
}

export async function createExam(exam: ExamInput): Promise<Exam> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Validate exam_type (not in Prisma schema, but validate if provided in legacy code)
  // This would need to be stored in metadata or added to schema
  
  return await db.exam.create({
    data: {
      courseCode: exam.courseCode,
      studentGroupId: exam.studentGroupId ?? null,
      date: typeof exam.date === 'string' ? new Date(exam.date) : exam.date,
      startTime: exam.startTime,
      durationMinutes: exam.durationMinutes,
      roomCodes: exam.roomCodes,
      createdBy: user?.id ?? null
    }
  });
}

export async function updateExam(id: string, updates: Partial<ExamInput>): Promise<Exam> {
  // Convert updates to Prisma format
  const prismaUpdates: any = {};
  
  if (updates.courseCode !== undefined) prismaUpdates.courseCode = updates.courseCode;
  if (updates.studentGroupId !== undefined) prismaUpdates.studentGroupId = updates.studentGroupId ?? null;
  if (updates.date !== undefined) {
    prismaUpdates.date = typeof updates.date === 'string' ? new Date(updates.date) : updates.date;
  }
  if (updates.startTime !== undefined) prismaUpdates.startTime = updates.startTime;
  if (updates.durationMinutes !== undefined) prismaUpdates.durationMinutes = updates.durationMinutes;
  if (updates.roomCodes !== undefined) prismaUpdates.roomCodes = updates.roomCodes;
  
  return await db.exam.update({
    where: { id },
    data: prismaUpdates
  });
}

export async function deleteExam(id: string): Promise<void> {
  await db.exam.delete({
    where: { id }
  });
}

/**
 * Get exam conflicts using RPC function
 * Note: RPC functions still use Supabase client as they're database functions
 */
export async function getExamConflicts(examId: string): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_exam_conflicts', { p_exam_id: examId });
  
  if (error) throw error;
  return data;
}

/**
 * Get all exam conflicts using RPC function
 * Note: RPC functions still use Supabase client as they're database functions
 */
export async function getAllExamConflicts(): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_all_exam_conflicts');
  
  if (error) throw error;
  return (data || []);
}
