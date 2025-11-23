/**
 * Database queries for academic semesters
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 * 
 * REFACTORED: New file for semester management
 * Supports semester-based scheduling context
 * 
 * NOTE: Prisma schema uses:
 * - `code` as the ID (not `id`)
 * - `isActive` instead of `is_current`
 * - Different field names (camelCase in Prisma, snake_case in DB via @map)
 */
import { db } from '@/lib/db';
import type { AcademicSemester, SemesterType } from '@prisma/client';
import { createClient } from '@/supabase/server';

// Type for semester (matches Prisma model)
export type Semester = AcademicSemester;

// Type for semester create input
export interface SemesterCreate {
  code: string;
  name: string;
  type: SemesterType;
  startDate: Date | string;
  endDate: Date | string;
  isActive?: boolean;
  electivesSurveyOpen?: boolean;
  registrationOpen?: boolean;
  feedbackOpen?: boolean;
  schedulePublished?: boolean;
  isFacultyAvailabilityOpen?: boolean;
}

// Type for semester update input
export interface SemesterUpdate {
  name?: string;
  type?: SemesterType;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
  electivesSurveyOpen?: boolean;
  registrationOpen?: boolean;
  feedbackOpen?: boolean;
  schedulePublished?: boolean;
  isFacultyAvailabilityOpen?: boolean;
}

/**
 * Get the current active semester
 * @returns Current semester or null if no current semester is set
 */
export async function getCurrentSemester(): Promise<Semester | null> {
  const semester = await db.academicSemester.findFirst({
    where: { isActive: true }
  });
  
  return semester;
}

/**
 * Get all semesters, ordered by startDate descending (most recent first)
 * @returns Array of semesters
 */
export async function getSemesters(): Promise<Semester[]> {
  return await db.academicSemester.findMany({
    orderBy: { startDate: 'desc' }
  });
}

/**
 * Get a specific semester by code
 * @param code - Semester code (e.g., "471", "472")
 * @returns Semester or null if not found
 */
export async function getSemester(code: string): Promise<Semester | null> {
  return await db.academicSemester.findUnique({
    where: { code }
  });
}

/**
 * Create a new semester
 * @param semesterData - Semester data
 * @returns Created semester
 */
export async function createSemester(semesterData: SemesterCreate): Promise<Semester> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return await db.academicSemester.create({
    data: {
      code: semesterData.code,
      name: semesterData.name,
      type: semesterData.type,
      startDate: typeof semesterData.startDate === 'string' 
        ? new Date(semesterData.startDate) 
        : semesterData.startDate,
      endDate: typeof semesterData.endDate === 'string' 
        ? new Date(semesterData.endDate) 
        : semesterData.endDate,
      isActive: semesterData.isActive ?? false,
      electivesSurveyOpen: semesterData.electivesSurveyOpen ?? false,
      registrationOpen: semesterData.registrationOpen ?? false,
      feedbackOpen: semesterData.feedbackOpen ?? false,
      schedulePublished: semesterData.schedulePublished ?? false,
      isFacultyAvailabilityOpen: semesterData.isFacultyAvailabilityOpen ?? false
    }
  });
}

/**
 * Update an existing semester
 * @param code - Semester code
 * @param updates - Fields to update
 * @returns Updated semester
 */
export async function updateSemester(code: string, updates: SemesterUpdate): Promise<Semester> {
  const prismaUpdates: any = {};
  
  if (updates.name !== undefined) prismaUpdates.name = updates.name;
  if (updates.type !== undefined) prismaUpdates.type = updates.type;
  if (updates.startDate !== undefined) {
    prismaUpdates.startDate = typeof updates.startDate === 'string' 
      ? new Date(updates.startDate) 
      : updates.startDate;
  }
  if (updates.endDate !== undefined) {
    prismaUpdates.endDate = typeof updates.endDate === 'string' 
      ? new Date(updates.endDate) 
      : updates.endDate;
  }
  if (updates.isActive !== undefined) prismaUpdates.isActive = updates.isActive;
  if (updates.electivesSurveyOpen !== undefined) prismaUpdates.electivesSurveyOpen = updates.electivesSurveyOpen;
  if (updates.registrationOpen !== undefined) prismaUpdates.registrationOpen = updates.registrationOpen;
  if (updates.feedbackOpen !== undefined) prismaUpdates.feedbackOpen = updates.feedbackOpen;
  if (updates.schedulePublished !== undefined) prismaUpdates.schedulePublished = updates.schedulePublished;
  if (updates.isFacultyAvailabilityOpen !== undefined) prismaUpdates.isFacultyAvailabilityOpen = updates.isFacultyAvailabilityOpen;
  
  return await db.academicSemester.update({
    where: { code },
    data: prismaUpdates
  });
}

/**
 * Delete a semester
 * @param code - Semester code
 */
export async function deleteSemester(code: string): Promise<void> {
  await db.academicSemester.delete({
    where: { code }
  });
}

/**
 * Archive a semester (sets isActive to false)
 * Uses Prisma update directly
 * @param code - Semester code
 * @returns Updated semester
 */
export async function archiveSemester(code: string): Promise<Semester> {
  // Try using database function first (if it exists)
  const supabase = await createClient();
  const { data: fnData, error: fnError } = await supabase
    .rpc('archive_semester', { semester_code: code });
  
  if (!fnError && fnData) {
    // Function succeeded, return the archived semester
    return await getSemester(code) as Semester;
  }
  
  // Fallback to direct update
  return await updateSemester(code, {
    isActive: false
  });
}

/**
 * Check if registration is currently open for a semester
 * @param semesterCode - Semester code (defaults to current semester)
 * @returns True if registration is open
 */
export async function isRegistrationOpen(semesterCode?: string): Promise<boolean> {
  const code = semesterCode || (await getCurrentSemester())?.code;
  
  if (!code) return false;
  
  // Try database function first
  const supabase = await createClient();
  const { data: fnData, error: fnError } = await supabase
    .rpc('is_registration_open', { semester_code: code });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback to manual check
  const semester = await getSemester(code);
  if (!semester || !semester.registrationOpen) return false;
  
  const now = new Date();
  // Note: Prisma schema doesn't have registration_start_date/end_date
  // This would need to be added to schema or checked via timeline events
  return semester.registrationOpen;
}

/**
 * Check if add/drop period is currently open for a semester
 * @param semesterCode - Semester code (defaults to current semester)
 * @returns True if add/drop is open
 */
export async function isAddDropOpen(semesterCode?: string): Promise<boolean> {
  const code = semesterCode || (await getCurrentSemester())?.code;
  
  if (!code) return false;
  
  // Try database function first
  const supabase = await createClient();
  const { data: fnData, error: fnError } = await supabase
    .rpc('is_add_drop_open', { semester_code: code });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback: Check if semester is active
  const semester = await getSemester(code);
  if (!semester || !semester.isActive) return false;
  
  // Note: Prisma schema doesn't have add_drop_deadline
  // This would need to be added to schema or checked via timeline events
  return semester.isActive;
}

/**
 * Get semesters by active status
 * @param isActive - Active status
 * @returns Array of semesters
 */
export async function getSemestersByStatus(isActive: boolean): Promise<Semester[]> {
  return await db.academicSemester.findMany({
    where: { isActive },
    orderBy: { startDate: 'desc' }
  });
}

/**
 * Set a semester as current (and unset all others)
 * @param code - Semester code
 * @returns Updated semester
 */
export async function setCurrentSemester(code: string): Promise<Semester> {
  // Use transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    // First, unset all active semesters
    await tx.academicSemester.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    // Then set the new active semester
    return await tx.academicSemester.update({
      where: { code },
      data: { isActive: true }
    });
  });
}
