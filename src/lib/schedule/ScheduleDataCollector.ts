import {
  ScheduleGenerationRequest,
  SWECurriculumLevel,
  SWEStudent,
  FacultyAvailability,
  ElectiveCourse,
  CourseOffering,
  IrregularStudent,
} from "@/lib/types";
import { getCurriculumByLevel } from "@/lib/schedule/curriculum-source";
import { getSupabaseAdminOrThrow } from "@/lib/supabase-admin";

/**
 * ScheduleDataCollector - Phase 2: Data Services
 *
 * Collects and organizes all input data needed for schedule generation:
 * - Curriculum requirements by level
 * - Student enrollment data
 * - Faculty availability and preferences
 * - Elective course offerings
 * - External course constraints
 * - Irregular student accommodations
 */
export class ScheduleDataCollector {
  constructor() {
    // Live mode: all data fetched from Supabase on demand
  }

  /**
   * Get curriculum requirements for specific levels
   */
  async getCurriculumForLevels(levels: number[]): Promise<SWECurriculumLevel[]> {
    const curriculum = await Promise.all(
      levels.map((level) => getCurriculumByLevel(level))
    );
    return curriculum;
  }

  /**
   * Get students enrolled in specific levels (updated for new student profile system)
   */
  async getStudentsForLevels(levels: number[]): Promise<SWEStudent[]> {
    const supabase = getSupabaseAdminOrThrow();
    // Use the existing students table for now (will be updated when database types are regenerated)
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .in("level", levels);
    
    if (error) throw error;
    
    return data.map((student) => ({
      id: student.user_id, // Use user_id as the main identifier
      name: student.name,
      level: student.level,
      electivePreferences: [], // TODO: Fetch from elective_preferences table
    }));
  }

  /**
   * Get all available faculty
   */
  async getAvailableFaculty(): Promise<FacultyAvailability[]> {
    const supabase = getSupabaseAdminOrThrow();
    const { data, error } = await supabase
      .from("user")
      .select(`
        *,
        faculty_availability(*)
      `)
      .eq("role", "faculty");
    
    if (error) throw error;
    
    return data.map((faculty) => ({
      instructorId: faculty.id,
      instructorName: faculty.name,
      department: "SWE", // TODO: Add department field to user table
      availableSlots: [], // TODO: Map from faculty_availability table
      maxTeachingHours: 20, // TODO: Add to faculty_availability table
    }));
  }

  /**
   * Get faculty who can teach specific courses
   */
  async getFacultyForCourses(courseCodes: string[]): Promise<FacultyAvailability[]> {
    const allFaculty = await this.getAvailableFaculty();
    return allFaculty.filter((faculty) =>
      faculty.preferences?.some((pref) => courseCodes.includes(pref))
    );
  }

  /**
   * Get all elective courses available for selection
   */
  async getAllElectiveCourses(): Promise<ElectiveCourse[]> {
    const supabase = getSupabaseAdminOrThrow();
    const { data, error } = await supabase
      .from("course")
      .select("*")
      .eq("type", "elective");
    
    if (error) throw error;
    
    return data.map((course) => ({
      id: course.code,
      code: course.code,
      name: course.name,
      credits: course.credits,
      level: course.level,
      type: course.type,
    }));
  }

  /**
   * Get elective courses by package
   */
  async getElectivesByPackage(_packageId: string): Promise<ElectiveCourse[]> {
    // TODO: Implement elective packages table
    return [];
  }

  /**
   * Get external courses that conflict with SWE scheduling
   */
  async getExternalCourses(): Promise<CourseOffering[]> {
    const supabase = getSupabaseAdminOrThrow();
    const { data, error } = await supabase
      .from("external_course")
      .select(`
        *,
        time_slot(*)
      `);
    
    if (error) throw error;
    
    return data.map((course) => ({
      code: course.code,
      name: course.name,
      credits: 3, // TODO: Add credits to external_course table
      department: course.department,
      level: 4, // TODO: Add level to external_course table
      type: "ELECTIVE" as const,
      prerequisites: [],
      sections: [],
      exams: {
        final: {
          date: "2025-05-15",
          time: "16:00",
          duration: 120,
        },
      },
    }));
  }

  /**
   * Get irregular students who need special accommodations
   */
  async getIrregularStudents(): Promise<IrregularStudent[]> {
    const supabase = getSupabaseAdminOrThrow();
    const { data, error } = await supabase
      .from("irregular_student")
      .select(`
        *,
        student:user(*)
      `);
    
    if (error) throw error;
    
    return data.map((irregular) => ({
      id: irregular.id,
      name: "Irregular Student", // TODO: Join with user table to get name
      requiredCourses: Array.isArray(irregular.remaining_courses) 
        ? irregular.remaining_courses as string[]
        : [],
    }));
  }

  /**
   * Get irregular students for specific levels
   */
  async getIrregularStudentsForLevels(): Promise<IrregularStudent[]> {
    return await this.getIrregularStudents();
  }

  /**
   * Get comprehensive data summary for schedule generation
   */
  async getScheduleGenerationData(request: ScheduleGenerationRequest) {
    const levels = request.levels;
    const curriculum = await this.getCurriculumForLevels(levels);
    const students = await this.getStudentsForLevels(levels);
    const faculty = await this.getAvailableFaculty();
    const electives = await this.getAllElectiveCourses();
    const externalCourses = await this.getExternalCourses();
    const irregularStudents = request.considerIrregularStudents
      ? await this.getIrregularStudentsForLevels()
      : [];

    return {
      request,
      curriculum,
      students,
      faculty,
      electives,
      externalCourses,
      irregularStudents,
      summary: {
        levels: levels.length,
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalElectives: electives.length,
        totalExternalCourses: externalCourses.length,
        irregularStudentsCount: irregularStudents.length,
      },
    };
  }

  // Legacy method - now just calls the main async method
  async getScheduleGenerationDataAsync(request: ScheduleGenerationRequest) {
    return await this.getScheduleGenerationData(request);
  }

  /**
   * Validate that all required data is available for the requested levels
   */
  async validateDataAvailability(levels: number[]): Promise<{
    valid: boolean;
    missing: string[];
  }> {
    const missing: string[] = [];

    try {
      // Check curriculum
      const curriculum = await this.getCurriculumForLevels(levels);
      const availableLevels = curriculum.map((c) => c.level);
      const missingLevels = levels.filter((l) => !availableLevels.includes(l));
      if (missingLevels.length > 0) {
        missing.push(`Curriculum for levels: ${missingLevels.join(", ")}`);
      }

      // Check students
      const students = await this.getStudentsForLevels(levels);
      const availableStudentLevels = [
        ...new Set(students.map((s) => s.level)),
      ];
      const missingStudentLevels = levels.filter(
        (l) => !availableStudentLevels.includes(l)
      );
      if (missingStudentLevels.length > 0) {
        missing.push(`Students for levels: ${missingStudentLevels.join(", ")}`);
      }

      // Check faculty availability
      const faculty = await this.getAvailableFaculty();
      if (faculty.length === 0) {
        missing.push("Faculty availability data");
      }
    } catch (error) {
      missing.push(`Data validation error: ${error}`);
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
