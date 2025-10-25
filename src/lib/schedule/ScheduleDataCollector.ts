import { createClient } from "@/lib/supabase/server";

/**
 * ScheduleDataCollector - Phase 2: Data Services
 *
 * Collects and organizes all input data needed for schedule generation:
 * - Student enrollment data from database
 * - Faculty information from database
 * - Course data
 * - External course constraints
 */
export class ScheduleDataCollector {
  /**
   * Get student count for specific levels
   */
  async getStudentCountForLevels(levels: number[]): Promise<Map<number, number>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("students")
      .select("level")
      .in("level", levels);

    if (error) throw error;

    // Count students per level
    const countMap = new Map<number, number>();
    levels.forEach(level => countMap.set(level, 0));
    
    data.forEach((student) => {
      const current = countMap.get(student.level) || 0;
      countMap.set(student.level, current + 1);
    });

    return countMap;
  }

  /**
   * Get all faculty members with their information
   */
  async getAvailableFaculty(): Promise<Array<{
    id: string;
    name: string;
    email: string;
  }>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("user")
      .select("id, name, email")
      .eq("role", "faculty");

    if (error) throw error;

    return data.map((faculty) => ({
      id: faculty.id,
      name: faculty.name,
      email: faculty.email,
    }));
  }

  /**
   * Get all courses from the database
   */
  async getAllCourses(): Promise<Array<{
    code: string;
    name: string;
    credits: number;
    level: number | null;
    type: string;
    is_swe_managed: boolean;
  }>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("course")
      .select("code, name, credits, level, type, is_swe_managed");

    if (error) throw error;

    return data;
  }

  /**
   * Get courses by level
   */
  async getCoursesByLevel(level: number): Promise<Array<{
    code: string;
    name: string;
    credits: number;
    level: number | null;
    type: string;
    is_swe_managed: boolean;
  }>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("course")
      .select("code, name, credits, level, type, is_swe_managed")
      .eq("level", level);

    if (error) throw error;

    return data;
  }

  /**
   * Get external courses from external_course table
   */
  async getExternalCourses(): Promise<Array<{
    code: string;
    name: string;
    department: string;
  }>> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("external_course")
      .select("code, name, department");

    if (error) throw error;

    return data;
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
      // Check if there are students
      const studentCounts = await this.getStudentCountForLevels(levels);
      const levelsWithNoStudents = levels.filter(l => (studentCounts.get(l) || 0) === 0);
      if (levelsWithNoStudents.length > 0) {
        missing.push(`No students enrolled for levels: ${levelsWithNoStudents.join(", ")}`);
      }

      // Check faculty availability
      const faculty = await this.getAvailableFaculty();
      if (faculty.length === 0) {
        missing.push("No faculty members available");
      }

      // Check courses
      const courses = await this.getAllCourses();
      if (courses.length === 0) {
        missing.push("No courses available in the database");
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
