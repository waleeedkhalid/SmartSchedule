import {
  ScheduleGenerationRequest,
  GeneratedSchedule,
  LevelSchedule,
  ScheduleMetadata,
  Section,
  CourseOffering,
  SWEStudent,
  FacultyAvailability,
} from "@/lib/types";
import { ScheduleDataCollector } from "./ScheduleDataCollector";
import { TimeSlotManager } from "./TimeSlotManager";
import { ConflictChecker } from "./ConflictChecker";

/**
 * ScheduleGenerator - Phase 4: Core Generation
 *
 * Main class for generating conflict-free schedules:
 * - Level-by-level schedule generation
 * - Student assignment to sections
 * - Faculty assignment to sections
 * - Room allocation
 * - Exam scheduling
 * - Conflict detection and resolution
 */
export class ScheduleGenerator {
  private dataCollector: ScheduleDataCollector;
  private timeManager: TimeSlotManager;
  private conflictChecker: ConflictChecker;

  // Available rooms for scheduling
  private readonly AVAILABLE_ROOMS = [
    "CCIS 1A101",
    "CCIS 1A102",
    "CCIS 1A103",
    "CCIS 1A104",
    "CCIS 1B101",
    "CCIS 1B102",
    "CCIS 1B103",
    "CCIS 1B104",
    "CCIS 2A101",
    "CCIS 2A102",
    "CCIS 2A103",
    "CCIS 2A104",
    "CCIS 2B101",
    "CCIS 2B102",
    "CCIS 2B103",
    "CCIS 2B104",
  ];

  // Exam time slots
  private readonly EXAM_SLOTS = [
    { time: "08:00", duration: 120 },
    { time: "11:00", duration: 120 },
    { time: "14:00", duration: 120 },
    { time: "16:00", duration: 120 },
  ];

  constructor() {
    this.dataCollector = new ScheduleDataCollector();
    this.timeManager = new TimeSlotManager();
    this.conflictChecker = new ConflictChecker();
  }

  /**
   * Generate complete schedule for requested levels
   */
  async generate(
    request: ScheduleGenerationRequest
  ): Promise<GeneratedSchedule> {
    console.log("🚀 Starting schedule generation...");
    console.log(`Semester: ${request.semester}`);
    console.log(`Levels: ${request.levels.join(", ")}`);

    // Step 1: Collect all required data
    console.log("\n📊 Step 1: Collecting data...");
    // Use async path to support live curriculum via adapter while remaining safe for mock mode
    const data = await this.dataCollector.getScheduleGenerationData(
      request
    );
    console.log(`- Students: ${data.summary.totalStudents}`);
    console.log(`- Faculty: ${data.summary.totalFaculty}`);
    console.log(`- Electives: ${data.summary.totalElectives}`);

    // Step 2: Generate schedules level by level
    console.log("\n📅 Step 2: Generating schedules by level...");
    const levelSchedules: LevelSchedule[] = [];
    const allSections: Section[] = [];

    for (const level of request.levels) {
      console.log(`\nProcessing Level ${level}...`);
      const levelSchedule = this.generateLevelSchedule(level, data);
      levelSchedules.push(levelSchedule);
      allSections.push(...this.extractSections(levelSchedule.courses));
    }

    // Step 3: Detect conflicts
    console.log("\n🔍 Step 3: Detecting conflicts...");
    const allCourses = levelSchedules.flatMap((ls) => ls.courses);
    const conflicts = this.conflictChecker.checkAllConflicts(
      allSections,
      allCourses,
      data.faculty
    );
    console.log(`Found ${conflicts.length} conflicts`);

    // Step 4: Calculate metadata
    console.log("\n📈 Step 4: Calculating metadata...");
    const metadata = this.calculateMetadata(allSections, data.faculty);

    const schedule: GeneratedSchedule = {
      id: `schedule-${Date.now()}`,
      semester: request.semester,
      generatedAt: new Date().toISOString(),
      levels: levelSchedules,
      conflicts,
      metadata,
    };

    console.log("\n✅ Schedule generation complete!");
    console.log(`Total sections: ${metadata.totalSections}`);
    console.log(`Total exams: ${metadata.totalExams}`);
    console.log(
      `Faculty utilization: ${metadata.facultyUtilization.toFixed(1)}%`
    );
    console.log(`Room utilization: ${metadata.roomUtilization.toFixed(1)}%`);

    return schedule;
  }

  /**
   * Generate schedule for a specific level
   */
  private generateLevelSchedule(
    level: number,
    data: Awaited<ReturnType<ScheduleDataCollector["getScheduleGenerationData"]>>
  ): LevelSchedule {
    const curriculum = data.curriculum.find((c) => c.level === level);
    if (!curriculum) {
      throw new Error(`No curriculum found for level ${level}`);
    }

    const students = data.students.filter((s) => s.level === level);
    const studentCount = students.length;

    console.log(`  Students: ${studentCount}`);
    console.log(
      `  Required SWE courses: ${curriculum.requiredSWECourses.length}`
    );
    console.log(`  Elective slots: ${curriculum.electiveSlots}`);

    // Generate courses with sections
    const courses: CourseOffering[] = [];

    // 1. Generate SWE course sections
    for (const courseCode of curriculum.requiredSWECourses) {
      const course = this.generateCourseWithSections(
        courseCode,
        studentCount,
        level,
        data
      );
      if (course) {
        courses.push(course);
      }
    }

    // 2. Add external courses (read-only, already scheduled)
    const externalCourses = this.getExternalCourses(
      curriculum.externalCourses,
      data
    );

    // 3. Generate elective sections based on demand
    if (curriculum.electiveSlots > 0) {
      const electiveCourses = this.generateElectiveSections(
        level,
        curriculum.electiveSlots,
        students,
        data
      );
      courses.push(...electiveCourses);
    }

    return {
      level,
      studentCount,
      courses,
      externalCourses,
      conflicts: [], // Will be populated during conflict detection
    };
  }

  /**
   * Generate a course with appropriate number of sections
   */
  private generateCourseWithSections(
    courseCode: string,
    studentCount: number,
    level: number,
    data: Awaited<ReturnType<ScheduleDataCollector["getScheduleGenerationData"]>>
  ): CourseOffering | null {
    const SECTION_SIZE = 30;
    const numSections = Math.ceil(studentCount / SECTION_SIZE);

    console.log(`    ${courseCode}: ${numSections} section(s)`);

    // Get course details (mock - in real implementation would fetch from database)
    const courseInfo = this.getCourseInfo(courseCode);
    if (!courseInfo) {
      console.warn(`    ⚠️  Course info not found for ${courseCode}`);
      return null;
    }

    const sections: Section[] = [];

    for (let i = 1; i <= numSections; i++) {
      const section = this.generateSection(
        courseCode,
        i,
        SECTION_SIZE,
        level,
        data
      );
      if (section) {
        sections.push(section);
      }
    }

    return {
      code: courseCode,
      name: courseInfo.name,
      credits: courseInfo.credits,
      department: "SWE",
      level,
      type: "REQUIRED",
      prerequisites: courseInfo.prerequisites || [],
      exams: this.scheduleExams(),
      sections,
    };
  }

  /**
   * Generate a single section with time, instructor, and room
   */
  private generateSection(
    courseCode: string,
    sectionNumber: number,
    capacity: number,
    level: number,
    data: Awaited<ReturnType<ScheduleDataCollector["getScheduleGenerationData"]>>
  ): Section | null {
    const sectionId = `${courseCode}-${String(sectionNumber).padStart(2, "0")}`;

    // Find available faculty for this course
    const availableFaculty = data.faculty.filter((f) =>
      f.preferences?.includes(courseCode)
    );

    if (availableFaculty.length === 0) {
      console.warn(`      ⚠️  No faculty available for ${courseCode}`);
      // Assign any available faculty as fallback
      const anyFaculty =
        data.faculty[Math.floor(Math.random() * data.faculty.length)];
      availableFaculty.push(anyFaculty);
    }

    // Select faculty (simple round-robin for now)
    const instructor =
      availableFaculty[sectionNumber % availableFaculty.length];

    // Generate time slots (3 meetings per week, MWTh or STTh pattern)
    const times = this.generateMeetingTimes();

    // Assign room
    const room = this.assignRoom();

    return {
      id: sectionId,
      courseCode,
      instructor: instructor.instructorName,
      times,
      room,
      capacity,
    };
  }

  /**
   * Generate meeting times for a course
   */
  private generateMeetingTimes(): Section["times"] {
    // Simple time slot assignment (can be enhanced with optimization)
    const patterns = [
      // Pattern 1: Sunday, Tuesday, Thursday
      [
        { day: "Sunday", start: "09:00", end: "09:50" },
        { day: "Tuesday", start: "09:00", end: "09:50" },
        { day: "Thursday", start: "09:00", end: "09:50" },
      ],
      // Pattern 2: Monday, Wednesday, Thursday
      [
        { day: "Monday", start: "10:00", end: "10:50" },
        { day: "Wednesday", start: "10:00", end: "10:50" },
        { day: "Thursday", start: "10:00", end: "10:50" },
      ],
      // Pattern 3: Sunday, Tuesday, Wednesday
      [
        { day: "Sunday", start: "11:00", end: "11:50" },
        { day: "Tuesday", start: "11:00", end: "11:50" },
        { day: "Wednesday", start: "11:00", end: "11:50" },
      ],
      // Pattern 4: Monday, Tuesday, Thursday
      [
        { day: "Monday", start: "13:00", end: "13:50" },
        { day: "Tuesday", start: "13:00", end: "13:50" },
        { day: "Thursday", start: "13:00", end: "13:50" },
      ],
    ];

    // Randomly select a pattern (can be optimized based on conflicts)
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    return pattern;
  }

  /**
   * Assign a room from available rooms
   */
  private assignRoom(): string {
    // Simple room assignment (can be enhanced with conflict checking)
    return this.AVAILABLE_ROOMS[
      Math.floor(Math.random() * this.AVAILABLE_ROOMS.length)
    ];
  }

  /**
   * Schedule exams for a course
   */
  private scheduleExams(): {
    midterm: { date: string; time: string; duration: number };
    final: { date: string; time: string; duration: number };
  } {
    // Generate exam dates (simplified - should check for conflicts)
    const midtermDate = "2025-03-15";
    const finalDate = "2025-05-20";

    const examSlot =
      this.EXAM_SLOTS[Math.floor(Math.random() * this.EXAM_SLOTS.length)];

    return {
      midterm: {
        date: midtermDate,
        time: examSlot.time,
        duration: examSlot.duration,
      },
      final: {
        date: finalDate,
        time: examSlot.time,
        duration: examSlot.duration,
      },
    };
  }

  /**
   * Get external courses (already scheduled by other departments)
   */
  private getExternalCourses(
    courseCodes: string[],
    data: Awaited<ReturnType<ScheduleDataCollector["getScheduleGenerationData"]>>
  ): CourseOffering[] {
    return data.externalCourses.filter((course) =>
      courseCodes.includes(course.code)
    );
  }

  /**
   * Generate elective sections based on student demand
   */
  private generateElectiveSections(
    level: number,
    electiveSlots: number,
    students: SWEStudent[],
    data: Awaited<ReturnType<ScheduleDataCollector["getScheduleGenerationData"]>>
  ): CourseOffering[] {
    // Calculate demand for each elective
    const demandMap = new Map<string, number>();

    for (const student of students) {
      const preferences = student.electivePreferences || [];
      for (let i = 0; i < Math.min(preferences.length, electiveSlots); i++) {
        const course = preferences[i];
        demandMap.set(course, (demandMap.get(course) || 0) + 1);
      }
    }

    // Sort by demand
    const sortedElectives = Array.from(demandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Offer top 5 demanded electives

    console.log(`    Electives (top 5 by demand):`);
    const electiveCourses: CourseOffering[] = [];

    for (const [courseCode, demand] of sortedElectives) {
      const numSections = Math.ceil(demand / 30);
      console.log(
        `      ${courseCode}: ${numSections} section(s) (${demand} students)`
      );

      const course = this.generateCourseWithSections(
        courseCode,
        demand,
        level,
        data
      );
      if (course) {
        course.type = "ELECTIVE";
        electiveCourses.push(course);
      }
    }

    return electiveCourses;
  }

  /**
   * Extract all sections from courses
   */
  private extractSections(courses: CourseOffering[]): Section[] {
    return courses.flatMap((course) => course.sections);
  }

  /**
   * Calculate schedule metadata
   */
  private calculateMetadata(
    sections: Section[],
    faculty: FacultyAvailability[]
  ): ScheduleMetadata {
    const totalSections = sections.length;

    // Count exams (each course has midterm + final = 2 exams)
    const uniqueCourses = new Set(sections.map((s) => s.courseCode));
    const totalExams = uniqueCourses.size * 2;

    // Calculate faculty utilization
    const totalFacultyHours = faculty.reduce(
      (sum, f) => sum + f.maxTeachingHours,
      0
    );

    // Each section is 3 hours per week (3 meetings x 50 min)
    const usedFacultyHours = sections.length * 3;

    const facultyUtilization = (usedFacultyHours / totalFacultyHours) * 100;

    // Calculate room utilization (simplified)
    const totalRoomSlots = this.AVAILABLE_ROOMS.length * 50; // 50 time slots per week
    const usedRoomSlots = sections.length * 3; // 3 meetings per section
    const roomUtilization = (usedRoomSlots / totalRoomSlots) * 100;

    return {
      totalSections,
      totalExams,
      facultyUtilization: Math.min(facultyUtilization, 100),
      roomUtilization: Math.min(roomUtilization, 100),
    };
  }

  /**
   * Get course information (mock data)
   */
  private getCourseInfo(courseCode: string): {
    name: string;
    credits: number;
    prerequisites?: string[];
  } | null {
    const courseDatabase: Record<
      string,
      { name: string; credits: number; prerequisites?: string[] }
    > = {
      SWE211: { name: "Introduction to Software Engineering", credits: 3 },
      SWE226: { name: "Software Construction Laboratory", credits: 3 },
      SWE312: {
        name: "Software Requirements Engineering",
        credits: 3,
        prerequisites: ["SWE211"],
      },
      SWE314: {
        name: "Software Security Engineering",
        credits: 3,
        prerequisites: ["SWE211"],
      },
      SWE321: {
        name: "Software Architecture Engineering",
        credits: 3,
        prerequisites: ["SWE211"],
      },
      SWE333: {
        name: "Software Quality Assurance",
        credits: 3,
        prerequisites: ["SWE312"],
      },
      SWE363: {
        name: "Database Systems",
        credits: 3,
        prerequisites: ["SWE211"],
      },
      SWE381: {
        name: "Web Application Development",
        credits: 3,
        prerequisites: ["SWE211"],
      },
      SWE434: {
        name: "Software Testing & Validation",
        credits: 3,
        prerequisites: ["SWE333"],
      },
      SWE444: {
        name: "Software Project Management",
        credits: 3,
        prerequisites: ["SWE312"],
      },
      SWE497: {
        name: "Senior Design Project",
        credits: 6,
        prerequisites: ["SWE434", "SWE444"],
      },
    };

    return courseDatabase[courseCode] || null;
  }
}
