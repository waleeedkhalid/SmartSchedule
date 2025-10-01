/**
 * Schedule Generation System - Main Exports
 *
 * Phase 1: Foundation ✅
 * - Mock data: curriculum, students, faculty
 *
 * Phase 2: Data Services ✅
 * - ScheduleDataCollector: Collects all input data
 * - TimeSlotManager: Manages time windows and conflicts
 *
 * Phase 3: Conflict Detection ✅
 * - ConflictChecker: Detects all types of conflicts
 *
 * Phase 4: Core Generation (TODO)
 * - ScheduleGenerator: Main generation algorithm
 *
 * Phase 5: API & UI (TODO)
 * - API endpoints and React components
 */

// Phase 2: Data Services
export { ScheduleDataCollector } from "./ScheduleDataCollector";
export { TimeSlotManager } from "./TimeSlotManager";

// Phase 3: Conflict Detection
export { ConflictChecker } from "./ConflictChecker";

// Phase 4: Core Generation
export { ScheduleGenerator } from "./ScheduleGenerator";

// Test suites
export { testScheduleDataSetup } from "./test-phase1-data";
export { testPhase2DataServices } from "./test-phase2-data";
export { testPhase3ConflictDetection } from "./test-phase3-data";
export { testPhase4ScheduleGeneration } from "./test-phase4-data";
