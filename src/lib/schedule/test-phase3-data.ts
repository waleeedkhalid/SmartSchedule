/**
 * Test file to verify Phase 3 implementation
 * Tests ConflictChecker class for detecting various types of conflicts
 */

import { ConflictChecker } from "./ConflictChecker";
import { Section, CourseOffering, SWEStudent } from "@/lib/types";
import { mockSWEFaculty } from "@/data/mockData";

export function testPhase3ConflictDetection() {
  console.log("=".repeat(60));
  console.log("SCHEDULE GENERATION - PHASE 3 CONFLICT DETECTION");
  console.log("=".repeat(60));
  console.log();

  const checker = new ConflictChecker();

  // Test 1: Time Conflict Detection
  console.log("✅ TEST 1: TIME CONFLICT DETECTION");
  console.log("-".repeat(60));

  const section1: Section = {
    id: "SWE211-01",
    courseCode: "SWE211",
    instructor: "Dr. Ahmed",
    times: [
      { day: "Sunday", start: "09:00", end: "10:00" },
      { day: "Tuesday", start: "09:00", end: "10:00" },
    ],
    room: "CCIS 1A101",
    capacity: 30,
  };

  const section2: Section = {
    id: "SWE312-01",
    courseCode: "SWE312",
    instructor: "Dr. Fatima",
    times: [
      { day: "Sunday", start: "09:30", end: "10:30" }, // Overlaps with section1
      { day: "Thursday", start: "11:00", end: "12:00" },
    ],
    room: "CCIS 1A102",
    capacity: 30,
  };

  const section3: Section = {
    id: "SWE314-01",
    courseCode: "SWE314",
    instructor: "Dr. Omar",
    times: [
      { day: "Monday", start: "14:00", end: "15:00" }, // No overlap
      { day: "Wednesday", start: "14:00", end: "15:00" },
    ],
    room: "CCIS 1A103",
    capacity: 30,
  };

  const timeConflict = checker.checkSectionTimeConflict(section1, section2);
  console.log(
    `Time conflict between SWE211 and SWE312: ${
      timeConflict ? "FOUND" : "None"
    }`
  );
  if (timeConflict) {
    console.log(`  Message: ${timeConflict.message}`);
  }

  const noConflict = checker.checkSectionTimeConflict(section1, section3);
  console.log(
    `Time conflict between SWE211 and SWE314: ${noConflict ? "FOUND" : "None"}`
  );
  console.log();

  // Test 2: Exam Conflict Detection
  console.log("✅ TEST 2: EXAM CONFLICT DETECTION");
  console.log("-".repeat(60));

  const course1: CourseOffering = {
    code: "SWE211",
    name: "Intro to Software Engineering",
    credits: 3,
    department: "SWE",
    level: 4,
    type: "REQUIRED",
    prerequisites: [],
    exams: {
      midterm: { date: "2025-03-15", time: "16:00", duration: 120 },
      final: { date: "2025-05-20", time: "09:00", duration: 180 },
    },
    sections: [section1],
  };

  const course2: CourseOffering = {
    code: "SWE312",
    name: "Software Requirements",
    credits: 3,
    department: "SWE",
    level: 5,
    type: "REQUIRED",
    prerequisites: ["SWE211"],
    exams: {
      midterm: { date: "2025-03-15", time: "16:00", duration: 120 }, // Same as course1
      final: { date: "2025-05-21", time: "09:00", duration: 180 },
    },
    sections: [section2],
  };

  const examConflicts = checker.checkExamConflict(course1, course2);
  console.log(`Exam conflicts found: ${examConflicts.length}`);
  examConflicts.forEach((conflict, idx) => {
    console.log(`  ${idx + 1}. ${conflict.message}`);
  });
  console.log();

  // Test 3: Faculty Conflict Detection
  console.log("✅ TEST 3: FACULTY CONFLICT DETECTION");
  console.log("-".repeat(60));

  // Use real faculty from mockSWEFaculty
  const faculty = mockSWEFaculty[0]; // Prof. Ahmed Al-Rashid

  // Create sections assigned to same faculty with overlapping times
  const facultySection1: Section = {
    id: "SWE211-01",
    courseCode: "SWE211",
    instructor: faculty.instructorName,
    times: [{ day: "Sunday", start: "09:00", end: "10:00" }],
    room: "CCIS 1A101",
    capacity: 30,
  };

  const facultySection2: Section = {
    id: "SWE312-01",
    courseCode: "SWE312",
    instructor: faculty.instructorName,
    times: [
      { day: "Sunday", start: "09:30", end: "10:30" }, // Overlaps!
    ],
    room: "CCIS 1A102",
    capacity: 30,
  };

  const facultyConflicts = checker.checkFacultyConflict(
    [facultySection1, facultySection2],
    faculty
  );
  console.log(
    `Faculty conflicts for ${faculty.instructorName}: ${facultyConflicts.length}`
  );
  facultyConflicts.forEach((conflict, idx) => {
    console.log(`  ${idx + 1}. ${conflict.message}`);
    console.log(`     Severity: ${conflict.severity}`);
  });
  console.log();

  // Test 4: Room Conflict Detection
  console.log("✅ TEST 4: ROOM CONFLICT DETECTION");
  console.log("-".repeat(60));

  const roomSection1: Section = {
    id: "SWE211-01",
    courseCode: "SWE211",
    instructor: "Dr. Ahmed",
    times: [{ day: "Sunday", start: "09:00", end: "10:00" }],
    room: "CCIS 1A101",
    capacity: 30,
  };

  const roomSection2: Section = {
    id: "SWE312-01",
    courseCode: "SWE312",
    instructor: "Dr. Fatima",
    times: [
      { day: "Sunday", start: "09:30", end: "10:30" }, // Same room, overlapping time
    ],
    room: "CCIS 1A101", // Same room!
    capacity: 30,
  };

  const roomConflicts = checker.checkRoomConflict([roomSection1, roomSection2]);
  console.log(`Room conflicts found: ${roomConflicts.length}`);
  roomConflicts.forEach((conflict, idx) => {
    console.log(`  ${idx + 1}. ${conflict.message}`);
  });
  console.log();

  // Test 5: Capacity Conflict Detection
  console.log("✅ TEST 5: CAPACITY CONFLICT DETECTION");
  console.log("-".repeat(60));

  const capacitySection: Section = {
    id: "SWE211-01",
    courseCode: "SWE211",
    instructor: "Dr. Ahmed",
    times: [{ day: "Sunday", start: "09:00", end: "10:00" }],
    room: "CCIS 1A101",
    capacity: 30,
  };

  const capacityConflict1 = checker.checkCapacityConflict(capacitySection, 25);
  console.log(
    `Capacity check (25/30): ${capacityConflict1 ? "Exceeded" : "OK"}`
  );

  const capacityConflict2 = checker.checkCapacityConflict(capacitySection, 35);
  console.log(
    `Capacity check (35/30): ${capacityConflict2 ? "Exceeded" : "OK"}`
  );
  if (capacityConflict2) {
    console.log(`  Message: ${capacityConflict2.message}`);
  }
  console.log();

  // Test 6: Student Schedule Conflict Detection
  console.log("✅ TEST 6: STUDENT SCHEDULE CONFLICT DETECTION");
  console.log("-".repeat(60));

  const student: SWEStudent = {
    id: "SWE-L4-001",
    name: "Student A",
    level: 4,
    electivePreferences: [],
  };

  const studentConflicts = checker.checkStudentScheduleConflict(student, [
    section1,
    section2, // These have overlapping times
  ]);
  console.log(`Student schedule conflicts: ${studentConflicts.length}`);
  studentConflicts.forEach((conflict, idx) => {
    console.log(`  ${idx + 1}. ${conflict.message}`);
  });
  console.log();

  // Test 7: Comprehensive Conflict Check
  console.log("✅ TEST 7: COMPREHENSIVE CONFLICT CHECK");
  console.log("-".repeat(60));

  const allSections = [
    roomSection1,
    roomSection2,
    section3,
    facultySection1,
    facultySection2,
  ];

  const allCourses = [course1, course2];
  const allFaculty = [faculty];

  const allConflicts = checker.checkAllConflicts(
    allSections,
    allCourses,
    allFaculty
  );
  console.log(`Total conflicts detected: ${allConflicts.length}`);

  const summary = checker.getConflictSummary(allConflicts);
  console.log(`Conflict Summary:`);
  console.log(`  Total: ${summary.total}`);
  console.log(`  By Type:`, summary.byType);
  console.log(`  By Severity:`, summary.bySeverity);
  console.log(`  Critical (ERROR): ${summary.critical.length}`);

  console.log();
  console.log("✅ PHASE 3 TESTING COMPLETE");
  console.log("=".repeat(60));
}
