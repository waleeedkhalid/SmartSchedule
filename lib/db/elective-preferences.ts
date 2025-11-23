// Database queries for elective preferences
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { ElectivePreference } from '@/lib/types/database';

export async function getElectivePreferences() {
  const preferences = await db.electivePreference.findMany({
    orderBy: { rank: 'asc' }
  });
  
  return preferences as ElectivePreference[];
}

export async function getElectivePreferencesByStudent(studentId: string) {
  const preferences = await db.electivePreference.findMany({
    where: { student_id: studentId },
    include: {
      course: {
        select: {
          code: true,
          title: true,
          level: true,
          credits: true
        }
      }
    },
    orderBy: { rank: 'asc' }
  });
  
  return preferences;
}

export async function getElectivePreferenceByCourse(studentId: string, courseCode: string) {
  const preference = await db.electivePreference.findUnique({
    where: {
      student_id_course_code: {
        student_id: studentId,
        course_code: courseCode
      }
    }
  });
  
  return preference as ElectivePreference | null;
}

export async function createElectivePreference(
  studentId: string,
  courseCode: string,
  rank: number
) {
  const created = await db.electivePreference.create({
    data: {
      student_id: studentId,
      course_code: courseCode,
      rank
    }
  });
  
  return created as ElectivePreference;
}

export async function updateElectivePreferenceRank(
  id: string,
  rank: number
) {
  const updated = await db.electivePreference.update({
    where: { id },
    data: { rank }
  });
  
  return updated as ElectivePreference;
}

export async function deleteElectivePreference(id: string) {
  await db.electivePreference.delete({
    where: { id }
  });
}

export async function bulkUpdateElectivePreferences(
  studentId: string,
  preferences: { course_code: string; rank: number }[]
) {
  // Use transaction to ensure atomicity
  return await db.$transaction(async (tx) => {
    // Delete all existing preferences for this student
    await tx.electivePreference.deleteMany({
      where: { student_id: studentId }
    });
    
    // Insert new preferences
    if (preferences.length > 0) {
      const created = await tx.electivePreference.createMany({
        data: preferences.map(p => ({
          student_id: studentId,
          course_code: p.course_code,
          rank: p.rank
        }))
      });
      
      // Fetch the created preferences
      const result = await tx.electivePreference.findMany({
        where: { student_id: studentId }
      });
      
      return result as ElectivePreference[];
    }
    
    return [];
  });
}

// Get aggregated preference statistics for scheduling committee
export async function getElectivePreferenceStats() {
  // Get all preferences with course info
  const preferences = await db.electivePreference.findMany({
    include: {
      course: {
        select: {
          code: true,
          title: true,
          level: true,
          credits: true
        }
      }
    }
  });
  
  // Aggregate by course
  const stats: Record<string, {
    course_code: string;
    course_title: string;
    level: number;
    total_requests: number;
    first_choice: number;
    second_choice: number;
    third_choice: number;
    other_choice: number;
  }> = {};
  
  preferences.forEach((pref) => {
    const code = pref.course_code;
    if (!stats[code]) {
      stats[code] = {
        course_code: code,
        course_title: pref.course?.title || '',
        level: pref.course?.level || 0,
        total_requests: 0,
        first_choice: 0,
        second_choice: 0,
        third_choice: 0,
        other_choice: 0,
      };
    }
    
    stats[code].total_requests++;
    if (pref.rank === 1) stats[code].first_choice++;
    else if (pref.rank === 2) stats[code].second_choice++;
    else if (pref.rank === 3) stats[code].third_choice++;
    else stats[code].other_choice++;
  });
  
  return Object.values(stats).sort((a, b) => b.total_requests - a.total_requests);
}

