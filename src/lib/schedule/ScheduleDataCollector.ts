import {
  ScheduleGenerationRequest,
  SWECurriculumLevel,
  SWEStudent,
  FacultyAvailability,
  ElectiveCourse,
  ElectivePackage,
  CourseOffering,
  IrregularStudent,
} from "@/lib/types";
import {
  mockSWECurriculum,
  mockSWEStudents,
  mockSWEFaculty,
  mockElectivePackages,
  mockSWEIrregularStudents,
  mockCourseOfferings,
} from "@/data/mockData";

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
  private curriculum: SWECurriculumLevel[];
  private students: SWEStudent[];
  private faculty: FacultyAvailability[];
  private electives: ElectivePackage[];
  private irregularStudents: IrregularStudent[];
  private externalCourses: CourseOffering[];

  constructor() {
    // Load all data from mock sources
    this.curriculum = mockSWECurriculum;
    this.students = mockSWEStudents;
    this.faculty = mockSWEFaculty;
    this.electives = mockElectivePackages;
    this.irregularStudents = mockSWEIrregularStudents;
    this.externalCourses = mockCourseOfferings;
  }

  /**
   * Get curriculum requirements for specific levels
   */
  getCurriculumForLevels(levels: number[]): SWECurriculumLevel[] {
    return this.curriculum.filter((level) => levels.includes(level.level));
  }

  /**
   * Get students enrolled in specific levels
   */
  getStudentsForLevels(levels: number[]): SWEStudent[] {
    return this.students.filter((student) => levels.includes(student.level));
  }

  /**
   * Get all available faculty
   */
  getAvailableFaculty(): FacultyAvailability[] {
    return [...this.faculty];
  }

  /**
   * Get faculty who can teach specific courses
   */
  getFacultyForCourses(courseCodes: string[]): FacultyAvailability[] {
    return this.faculty.filter((faculty) =>
      faculty.preferences?.some((pref) => courseCodes.includes(pref))
    );
  }

  /**
   * Get all elective courses available for selection
   */
  getAllElectiveCourses(): ElectiveCourse[] {
    return this.electives.flatMap((pkg) => pkg.courses);
  }

  /**
   * Get elective courses by package
   */
  getElectivesByPackage(packageId: string): ElectiveCourse[] {
    const pkg = this.electives.find((p) => p.id === packageId);
    return pkg ? pkg.courses : [];
  }

  /**
   * Get external courses that conflict with SWE scheduling
   */
  getExternalCourses(): CourseOffering[] {
    return [...this.externalCourses];
  }

  /**
   * Get irregular students who need special accommodations
   */
  getIrregularStudents(): IrregularStudent[] {
    return [...this.irregularStudents];
  }

  /**
   * Get irregular students for specific levels
   */
  getIrregularStudentsForLevels(): IrregularStudent[] {
    // Note: Irregular students are identified by their irregularCourses
    // This is a simplified mapping - in real implementation, irregular students
    // would have their own level tracking
    return this.irregularStudents;
  }

  /**
   * Get comprehensive data summary for schedule generation
   */
  getScheduleGenerationData(request: ScheduleGenerationRequest) {
    const levels = request.levels;
    const curriculum = this.getCurriculumForLevels(levels);
    const students = this.getStudentsForLevels(levels);
    const faculty = this.getAvailableFaculty();
    const electives = this.getAllElectiveCourses();
    const externalCourses = this.getExternalCourses();
    const irregularStudents = request.considerIrregularStudents
      ? this.getIrregularStudentsForLevels()
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

  /**
   * Validate that all required data is available for the requested levels
   */
  validateDataAvailability(levels: number[]): {
    valid: boolean;
    missing: string[];
  } {
    const missing: string[] = [];

    // Check curriculum
    const availableLevels = this.curriculum.map((c) => c.level);
    const missingLevels = levels.filter((l) => !availableLevels.includes(l));
    if (missingLevels.length > 0) {
      missing.push(`Curriculum for levels: ${missingLevels.join(", ")}`);
    }

    // Check students
    const availableStudentLevels = [
      ...new Set(this.students.map((s) => s.level)),
    ];
    const missingStudentLevels = levels.filter(
      (l) => !availableStudentLevels.includes(l)
    );
    if (missingStudentLevels.length > 0) {
      missing.push(`Students for levels: ${missingStudentLevels.join(", ")}`);
    }

    // Check faculty availability
    if (this.faculty.length === 0) {
      missing.push("Faculty availability data");
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
