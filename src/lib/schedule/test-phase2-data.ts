// /**
//  * Test file to verify Phase 2 implementation
//  * Tests ScheduleDataCollector and TimeSlotManager classes
//  */

// import { ScheduleDataCollector } from "./ScheduleDataCollector";
// import { TimeSlotManager } from "./TimeSlotManager";
// import { TimeSlot } from "@/lib/types";

// export async function testPhase2DataServices() {
//   console.log("=".repeat(60));
//   console.log("SCHEDULE GENERATION - PHASE 2 DATA SERVICES VERIFICATION");
//   console.log("=".repeat(60));
//   console.log();

//   // Test 1: ScheduleDataCollector
//   console.log("✅ TEST 1: SCHEDULE DATA COLLECTOR");
//   console.log("-".repeat(60));

//   const collector = new ScheduleDataCollector();

//   // Test data validation
//   const validation = await collector.validateDataAvailability([4, 5, 6, 7, 8]);
//   console.log(`Data validation: ${validation.valid ? "PASS" : "FAIL"}`);
//   if (!validation.valid) {
//     console.log(`Missing data: ${validation.missing.join(", ")}`);
//   }

//   // Test curriculum retrieval
//   const curriculum = await collector.getCurriculumForLevels([4, 5, 6]);
//   console.log(`Retrieved curriculum for 3 levels: ${curriculum.length} levels`);

//   // Test student retrieval
//   const students = await collector.getStudentsForLevels([4, 5]);
//   console.log(`Retrieved students for levels 4-5: ${students.length} students`);

//   // Test faculty retrieval
//   const faculty = await collector.getAvailableFaculty();
//   console.log(`Available faculty: ${faculty.length} instructors`);

//   // Test elective retrieval
//   const electives = await collector.getAllElectiveCourses();
//   console.log(`Available elective courses: ${electives.length} courses`);

//   // Test comprehensive data collection
//   const request = {
//     semester: "Fall 2025",
//     levels: [4, 5, 6],
//     considerIrregularStudents: false,
//     optimizationGoals: ["minimize-conflicts" as const],
//   };

//   const data = await collector.getScheduleGenerationData(request);
//   console.log(`Comprehensive data collection:`);
//   console.log(`  - Levels: ${data.summary.levels}`);
//   console.log(`  - Students: ${data.summary.totalStudents}`);
//   console.log(`  - Faculty: ${data.summary.totalFaculty}`);
//   console.log(`  - Electives: ${data.summary.totalElectives}`);
//   console.log();

//   // Test 2: TimeSlotManager
//   console.log("✅ TEST 2: TIME SLOT MANAGER");
//   console.log("-".repeat(60));

//   const timeManager = new TimeSlotManager();

//   // Test time slot overlap detection
//   const slot1: TimeSlot = {
//     day: "Monday",
//     startTime: "09:00",
//     endTime: "10:00",
//   };
//   const slot2: TimeSlot = {
//     day: "Monday",
//     startTime: "09:30",
//     endTime: "10:30",
//   };
//   const slot3: TimeSlot = {
//     day: "Tuesday",
//     startTime: "09:00",
//     endTime: "10:00",
//   };

//   console.log(`Slot overlap detection:`);
//   console.log(
//     `  Same day, overlapping: ${timeManager.doTimeSlotsOverlap(slot1, slot2)}`
//   );
//   console.log(
//     `  Different days: ${timeManager.doTimeSlotsOverlap(slot1, slot3)}`
//   );

//   // Test conflict detection
//   const existingSlots = [slot1, slot3];
//   const newSlot: TimeSlot = {
//     day: "Monday",
//     startTime: "10:00",
//     endTime: "11:00",
//   };
//   console.log(
//     `New slot conflicts with existing: ${timeManager.hasConflict(
//       newSlot,
//       existingSlots
//     )}`
//   );

//   // Test time slot generation
//   const allSlots = timeManager.generateTimeSlots(1);
//   console.log(`Generated 1-hour time slots: ${allSlots.length} slots`);

//   // Test available slots
//   const availableSlots = timeManager.getAvailableSlots(existingSlots, 1);
//   console.log(
//     `Available slots (excluding conflicts): ${availableSlots.length} slots`
//   );

//   // Test faculty availability (using first faculty from collector)
//   if (faculty.length > 0) {
//     const firstFaculty = faculty[0];
//     const isAvailable = timeManager.isFacultyAvailable(firstFaculty, slot1);
//     console.log(
//       `Faculty ${firstFaculty.instructorName} available at ${slot1.day} ${slot1.startTime}: ${isAvailable}`
//     );

//     const availableFaculty = timeManager.getAvailableFacultyAtTime(
//       faculty,
//       slot1
//     );
//     console.log(
//       `Faculty available at ${slot1.day} ${slot1.startTime}: ${availableFaculty.length} instructors`
//     );
//   }

//   // Test hour calculations
//   const testSlots = [
//     { day: "Monday", startTime: "09:00", endTime: "11:00" }, // 2 hours
//     { day: "Tuesday", startTime: "14:00", endTime: "15:30" }, // 1.5 hours
//   ];
//   const totalHours = timeManager.calculateTotalHours(testSlots);
//   console.log(`Total hours for test slots: ${totalHours} hours`);

//   // Test slot validation
//   const conflictingSlots = [slot1, slot2]; // These overlap
//   const validation2 = timeManager.validateSlotCollection(conflictingSlots);
//   console.log(
//     `Slot collection validation: ${
//       validation2.valid
//         ? "No conflicts"
//         : `${validation2.conflicts.length} conflicts found`
//     }`
//   );

//   // Test optimal slot finding
//   const manySlots = timeManager.generateTimeSlots(1).slice(0, 10); // First 10 slots
//   const optimalSlots = timeManager.findOptimalSlots(manySlots, 3, true);
//   console.log(`Found ${optimalSlots.length} optimal morning slots`);

//   console.log();
//   console.log("✅ PHASE 2 TESTING COMPLETE");
//   console.log("=".repeat(60));
// }
