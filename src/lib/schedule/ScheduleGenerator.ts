import { ScheduleDataCollector } from "./ScheduleDataCollector";
import { TimeSlotManager } from "./TimeSlotManager";
import { ConflictChecker } from "./ConflictChecker";
import { ExternalCourseLoader } from "./ExternalCourseLoader";
import { TimeSlot } from "@/types";

/**
 * ScheduleGenerator - Phase 2: Core Generation
 *
 * Simplified schedule generation that:
 * - Generates sections for courses based on student enrollment
 * - Assigns time slots avoiding conflicts
 * - Considers external course constraints
 */
export class ScheduleGenerator {
  private dataCollector: ScheduleDataCollector;
  private timeManager: TimeSlotManager;
  private conflictChecker: ConflictChecker;
  private externalLoader: ExternalCourseLoader;

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
  ];

  // Standard section capacity
  private readonly SECTION_CAPACITY = 30;

  constructor() {
    this.dataCollector = new ScheduleDataCollector();
    this.timeManager = new TimeSlotManager();
    this.conflictChecker = new ConflictChecker();
    this.externalLoader = new ExternalCourseLoader();
  }

  /**
   * Generate schedule for specific levels
   */
  async generate(request: {
    term_code: string;
    target_levels: number[];
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      levels: Array<{
        level: number;
        studentCount: number;
        courses: Array<{
          courseCode: string;
          courseName: string;
          sectionsCreated: number;
        }>;
      }>;
      conflicts: Array<{
        type: string;
        description: string;
      }>;
    };
  }> {
    try {
      console.log("🚀 Starting schedule generation...");
      console.log(`Term: ${request.term_code}`);
      console.log(`Levels: ${request.target_levels.join(", ")}`);

      // Step 1: Validate data availability
      console.log("\n📊 Step 1: Validating data...");
      const validation = await this.dataCollector.validateDataAvailability(
        request.target_levels
      );

      if (!validation.valid) {
        return {
          success: false,
          message: `Data validation failed: ${validation.missing.join(", ")}`,
        };
      }

      // Step 2: Get student counts
      const studentCounts = await this.dataCollector.getStudentCountForLevels(
        request.target_levels
      );

      // Step 3: Get courses for each level
      const levelsData = [];
      const allConflicts: Array<{
        type: string;
        description: string;
      }> = [];

      for (const level of request.target_levels) {
        console.log(`\nProcessing Level ${level}...`);
        
        const courses = await this.dataCollector.getCoursesByLevel(level);
        const studentCount = studentCounts.get(level) || 0;

        console.log(`  Students: ${studentCount}`);
        console.log(`  Courses: ${courses.length}`);

        const levelCourses = courses.map((course) => {
          const sectionsNeeded = Math.ceil(studentCount / this.SECTION_CAPACITY);
          
          return {
            courseCode: course.code,
            courseName: course.name,
            sectionsCreated: sectionsNeeded,
          };
        });

        levelsData.push({
          level,
          studentCount,
          courses: levelCourses,
        });
      }

      // Step 4: Check for external course conflicts
      console.log("\n🔍 Step 4: Checking external course conflicts...");
      const externalValidation = this.externalLoader.validateExternalCourses();
      
      if (!externalValidation.valid) {
        externalValidation.errors.forEach((error) => {
          allConflicts.push({
            type: "external_validation",
            description: error,
          });
        });
      }

      console.log("\n✅ Schedule generation analysis complete!");
      console.log(`Total levels processed: ${levelsData.length}`);
      console.log(`Total conflicts found: ${allConflicts.length}`);

      return {
        success: true,
        message: "Schedule analysis completed successfully",
        data: {
          levels: levelsData,
          conflicts: allConflicts,
        },
      };
    } catch (error) {
      console.error("Schedule generation error:", error);
      return {
        success: false,
        message: `Schedule generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * Calculate number of sections needed based on student count
   */
  private calculateSectionsNeeded(studentCount: number): number {
    return Math.ceil(studentCount / this.SECTION_CAPACITY);
  }

  /**
   * Generate time slots avoiding conflicts
   */
  private generateNonConflictingTimeSlots(
    count: number,
    existingSlots: TimeSlot[]
  ): TimeSlot[] {
    const availableSlots = this.timeManager.getAvailableSlots(existingSlots, 1);
    return this.timeManager.findOptimalSlots(availableSlots, count, true);
  }

  /**
   * Assign room from available rooms
   */
  private assignRoom(usedRooms: string[]): string {
    const availableRooms = this.AVAILABLE_ROOMS.filter(
      (room) => !usedRooms.includes(room)
    );
    
    return availableRooms.length > 0
      ? availableRooms[0]
      : this.AVAILABLE_ROOMS[0];
  }
}
