/**
 * Database queries for student profiles
 * 
 * REFACTORED: New file for student-specific attributes
 * Replaces student fields that were previously in user_roles table
 * 
 * MIGRATED: Now uses Prisma ORM instead of Supabase Client
 */
import { db } from '@/lib/db';
import type { StudentProfile as PrismaStudentProfile } from '@prisma/client';

export interface StudentProfile {
  userId: string;
  level: number;
  studentGroupId: string | null;
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfileCreate {
  userId: string;
  level: number;
  studentGroupId?: string | null;
  department?: string;
}

export interface StudentProfileUpdate {
  level?: number;
  studentGroupId?: string | null;
  department?: string;
}

/**
 * Get a student profile by user ID
 * @param userId - User ID
 * @returns Student profile or null if not found
 */
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  try {
    const profile = await db.studentProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) return null;
    
    return {
      userId: profile.userId,
      level: profile.level,
      studentGroupId: profile.studentGroupId,
      department: profile.department,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  } catch (error) {
    // Handle connection errors with helpful messages
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(
          '\n❌ Database connection refused when fetching student profile.\n' +
          'Please ensure:\n' +
          '  1. Your database is running (if local: `supabase start`)\n' +
          '  2. DATABASE_URL is correctly set in .env.local\n' +
          '  3. The database server is accessible\n'
        );
      }
    }
    // Re-throw to let caller handle
    throw error;
  }
}

/**
 * Get all student profiles
 * @returns Array of student profiles
 */
export async function getStudentProfiles(): Promise<StudentProfile[]> {
  const profiles = await db.studentProfile.findMany({
    orderBy: { userId: 'asc' }
  });
  
  return profiles.map(p => ({
    userId: p.userId,
    level: p.level,
    studentGroupId: p.studentGroupId,
    department: p.department,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Get student profiles by level
 * @param level - Level (1-8)
 * @returns Array of student profiles
 */
export async function getStudentProfilesByLevel(level: number): Promise<StudentProfile[]> {
  const profiles = await db.studentProfile.findMany({
    where: { level },
    orderBy: { userId: 'asc' }
  });
  
  return profiles.map(p => ({
    userId: p.userId,
    level: p.level,
    studentGroupId: p.studentGroupId,
    department: p.department,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Get student profiles by student group
 * @param studentGroupId - Student group ID
 * @returns Array of student profiles
 */
export async function getStudentProfilesByGroup(studentGroupId: string): Promise<StudentProfile[]> {
  const profiles = await db.studentProfile.findMany({
    where: { studentGroupId },
    orderBy: { userId: 'asc' }
  });
  
  return profiles.map(p => ({
    userId: p.userId,
    level: p.level,
    studentGroupId: p.studentGroupId,
    department: p.department,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}

/**
 * Create a new student profile
 * @param profileData - Student profile data
 * @returns Created student profile
 */
export async function createStudentProfile(profileData: StudentProfileCreate): Promise<StudentProfile> {
  const created = await db.studentProfile.create({
    data: {
      userId: profileData.userId,
      level: profileData.level,
      studentGroupId: profileData.studentGroupId ?? null,
      department: profileData.department || 'Software Engineering',
    }
  });
  
  return {
    userId: created.userId,
    level: created.level,
    studentGroupId: created.studentGroupId,
    department: created.department,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

/**
 * Update a student profile
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated student profile
 */
export async function updateStudentProfile(userId: string, updates: StudentProfileUpdate): Promise<StudentProfile> {
  const updated = await db.studentProfile.update({
    where: { userId },
    data: updates
  });
  
  return {
    userId: updated.userId,
    level: updated.level,
    studentGroupId: updated.studentGroupId,
    department: updated.department,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  };
}

/**
 * Delete a student profile
 * @param userId - User ID
 */
export async function deleteStudentProfile(userId: string): Promise<void> {
  await db.studentProfile.delete({
    where: { userId }
  });
}

/**
 * Get student profile with user role information
 * @param userId - User ID
 * @returns Combined student profile and user role data
 */
export async function getStudentWithProfile(userId: string) {
  const profile = await db.studentProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          onboardingCompleted: true
        }
      }
    }
  });
  
  return profile;
}

/**
 * Get all students with their profile information
 * @returns Array of students with profile data
 */
export async function getAllStudentsWithProfiles() {
  const profiles = await db.studentProfile.findMany({
    include: {
      user: {
        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          onboardingCompleted: true,
          createdAt: true
        }
      }
    },
    orderBy: { userId: 'asc' }
  });
  
  return profiles;
}

/**
 * Check if a student profile exists for a user
 * @param userId - User ID
 * @returns True if profile exists
 */
export async function studentProfileExists(userId: string): Promise<boolean> {
  const profile = await getStudentProfile(userId);
  return profile !== null;
}

/**
 * Get students by department
 * @param department - Department name
 * @returns Array of student profiles
 */
export async function getStudentsByDepartment(department: string): Promise<StudentProfile[]> {
  const profiles = await db.studentProfile.findMany({
    where: { department },
    orderBy: { userId: 'asc' }
  });
  
  return profiles.map(p => ({
    userId: p.userId,
    level: p.level,
    studentGroupId: p.studentGroupId,
    department: p.department,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
}


