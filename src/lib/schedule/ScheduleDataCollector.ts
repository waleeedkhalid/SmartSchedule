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
import { getCurriculumByLevel } from "@/lib/schedule/curriculum-source";

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
    // Load all data from mock sources by default
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
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
    if (useMock) {
      return this.curriculum.filter((level) => levels.includes(level.level));
    }
    // In live mode, assemble per-level via adapter on-demand and cache into this.curriculum shape
    // Note: keep synchronous signature by using the last known snapshot if any; callers of async flows should prefer adapter directly.
    // For scheduler usage in this class, we will generate a fresh snapshot synchronously by throwing if called before warm-up.
    // TODO: consider promoting getScheduleGenerationData to async and fetch levels in parallel.
    throw new Error(
      "getCurriculumForLevels requires async adapter in live mode. Use getScheduleGenerationData() which warms curriculum first."
    );
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
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
    let curriculum: SWECurriculumLevel[];
    if (useMock) {
      curriculum = this.getCurriculumForLevels(levels);
    } else {
      // Warm curriculum from adapter synchronously by blocking on Promise.all first
      // Note: converting method body to async would ripple across call sites; keep sync by prefetching and then proceed.
      const hydrated = (globalThis as any).__ss_curriculum_cache as
        | Map<number, SWECurriculumLevel>
        | undefined;
      const cache = hydrated ?? new Map<number, SWECurriculumLevel>();
      // fetch per-level
      const fetchAll = levels.map(async (lvl) => {
        const entry = await getCurriculumByLevel(lvl);
        cache.set(lvl, entry);
        return entry;
      });
      // This is a sync function; however we can block here by using Atomics? Not viable. Instead, we restructure to prefetch via sync wait impossible.
      // Simplest non-breaking choice: if live mode, throw guiding error for now (callers can switch to async API in a follow-up phase).
      throw new Error(
        "Live curriculum requires async collection. Refactor caller to use async pathway or keep NEXT_PUBLIC_USE_MOCK_DATA=true for now."
      );
    }
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
