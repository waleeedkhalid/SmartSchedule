/**
 * Test Script for Exam Scheduling
 *
 * This script tests the exam scheduling CSP solver to verify that exams
 * can be scheduled with day/time even when rooms are limited.
 *
 * Run with: npx tsx scripts/test-exam-scheduling.ts
 */

import {
  solveExamCSP,
  type ExamVariable,
  type ExamCSPSolverConfig,
  type StudentEnrollmentMatrix,
} from "../lib/scheduling/exam-csp-solver";

async function testExamScheduling() {
  console.log("🧪 Testing Exam Scheduling CSP Solver\n");
  console.log("=".repeat(60));

  // Create sample exam variables (14 SWE courses) - includes all required properties
  const examVariables: ExamVariable[] = [
    {
      course_code: "SWE 211",
      course_level: 2,
      duration_minutes: 120,
      student_enrollment_count: 50,
      instructor_id: null,
    },
    {
      course_code: "SWE 314",
      course_level: 3,
      duration_minutes: 120,
      student_enrollment_count: 45,
      instructor_id: null,
    },
    {
      course_code: "SWE 312",
      course_level: 3,
      duration_minutes: 120,
      student_enrollment_count: 40,
      instructor_id: null,
    },
    {
      course_code: "SWE 381",
      course_level: 3,
      duration_minutes: 120,
      student_enrollment_count: 35,
      instructor_id: null,
    },
    {
      course_code: "SWE 321",
      course_level: 3,
      duration_minutes: 120,
      student_enrollment_count: 42,
      instructor_id: null,
    },
    {
      course_code: "SWE 333",
      course_level: 3,
      duration_minutes: 120,
      student_enrollment_count: 38,
      instructor_id: null,
    },
    {
      course_code: "SWE 444",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 30,
      instructor_id: null,
    },
    {
      course_code: "SWE 434",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 28,
      instructor_id: null,
    },
    {
      course_code: "SWE 496",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 25,
      instructor_id: null,
    },
    {
      course_code: "SWE 477",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 32,
      instructor_id: null,
    },
    {
      course_code: "SWE 482",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 27,
      instructor_id: null,
    },
    {
      course_code: "SWE 466",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 22,
      instructor_id: null,
    },
    {
      course_code: "SWE 455",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 24,
      instructor_id: null,
    },
    {
      course_code: "SWE 497",
      course_level: 4,
      duration_minutes: 120,
      student_enrollment_count: 20,
      instructor_id: null,
    },
  ];

  // Create sample student enrollment matrix (simulate some conflicts)
  const enrollmentMatrix: StudentEnrollmentMatrix = new Map();

  // Student 1 takes multiple level 3 courses (would conflict without level constraint)
  enrollmentMatrix.set("student1", new Set(["SWE 314", "SWE 312", "SWE 381"]));

  // Student 2 takes multiple level 4 courses
  enrollmentMatrix.set("student2", new Set(["SWE 444", "SWE 434", "SWE 496"]));

  // Student 3 takes courses across levels
  enrollmentMatrix.set("student3", new Set(["SWE 211", "SWE 321", "SWE 477"]));

  // Add more students with various combinations
  for (let i = 4; i <= 20; i++) {
    const courses = new Set<string>();
    const numCourses = Math.floor(Math.random() * 3) + 2; // 2-4 courses per student
    for (let j = 0; j < numCourses; j++) {
      const randomCourse =
        examVariables[Math.floor(Math.random() * examVariables.length)];
      courses.add(randomCourse.course_code);
    }
    enrollmentMatrix.set(`student${i}`, courses);
  }

  // Limited room availability (only 3 rooms, causing domain exhaustion in old version)
  const examRooms = [
    { code: "A101", capacity: 50, type: "Lecture" as const },
    { code: "B202", capacity: 40, type: "Lecture" as const },
    { code: "C303", capacity: 35, type: "Lab" as const },
  ];

  // Exam schedule configuration
  const examDays = [
    "2025-12-07", // Saturday
    "2025-12-14", // Saturday
    "2025-12-21", // Saturday
  ];

  const examTimeSlots = ["09:00", "12:00", "15:00"];

  const config: ExamCSPSolverConfig = {
    examDays,
    examTimeSlots,
    examRooms,
    studentEnrollmentMatrix: enrollmentMatrix,
    maxBacktracks: 50000,
    enableForwardChecking: true,
    enableSoftConstraints: true,
  };

  console.log("\n📊 Test Configuration:");
  console.log(`   Exams to schedule: ${examVariables.length}`);
  console.log(`   Available rooms: ${examRooms.length}`);
  console.log(`   Exam days: ${examDays.length}`);
  console.log(`   Time slots per day: ${examTimeSlots.length}`);
  console.log(
    `   Max possible assignments: ${
      examDays.length * examTimeSlots.length * examRooms.length
    } (without TBD)`
  );
  console.log(`   Students with enrollments: ${enrollmentMatrix.size}`);
  console.log("");

  // Run the solver
  console.log("🚀 Running CSP Solver...\n");
  const startTime = Date.now();

  const result = await solveExamCSP(examVariables, config, (progress) => {
    if (
      progress.assigned % 5 === 0 ||
      progress.assigned === examVariables.length
    ) {
      console.log(
        `   Progress: ${progress.assigned}/${progress.total} assigned (${progress.backtracks} backtracks)`
      );
    }
  });

  const elapsed = Date.now() - startTime;

  console.log("\n" + "=".repeat(60));
  console.log("✅ RESULTS:\n");
  console.log(`   Success: ${result.success ? "✅ YES" : "❌ NO"}`);
  console.log(`   Total Exams: ${result.stats.total_exams}`);
  console.log(
    `   Assigned: ${result.stats.assigned} (${Math.round(
      (result.stats.assigned / result.stats.total_exams) * 100
    )}%)`
  );
  console.log(`   Unassigned: ${result.stats.unassigned}`);
  console.log(`   Backtracks: ${result.stats.backtracks}`);
  console.log(`   Time taken: ${elapsed}ms`);
  console.log("");

  // Analyze assignments
  let realRoomCount = 0;
  let tbdRoomCount = 0;
  const roomUsage = new Map<string, number>();

  for (const [courseCode, assignment] of result.assignments.entries()) {
    if (assignment.room === "TBD") {
      tbdRoomCount++;
    } else {
      realRoomCount++;
      roomUsage.set(assignment.room, (roomUsage.get(assignment.room) || 0) + 1);
    }
  }

  console.log("📍 Room Assignments:");
  console.log(`   Real rooms: ${realRoomCount}`);
  console.log(`   TBD rooms: ${tbdRoomCount}`);
  console.log("");

  if (roomUsage.size > 0) {
    console.log("   Room Usage:");
    for (const [room, count] of roomUsage.entries()) {
      console.log(`     ${room}: ${count} exams`);
    }
    console.log("");
  }

  // Show sample assignments
  console.log("📅 Sample Assignments:");
  let count = 0;
  for (const [courseCode, assignment] of result.assignments.entries()) {
    if (count < 5) {
      console.log(
        `   ${courseCode}: ${assignment.date} at ${assignment.time} in ${assignment.room}`
      );
      count++;
    }
  }
  if (result.assignments.size > 5) {
    console.log(`   ... and ${result.assignments.size - 5} more`);
  }
  console.log("");

  // Show unassigned (if any)
  if (result.unassigned.length > 0) {
    console.log("❌ Unassigned Exams:");
    for (const unassigned of result.unassigned) {
      console.log(`   ${unassigned.course_code}: ${unassigned.reason}`);
    }
    console.log("");
  }

  // Verify no student conflicts
  console.log("🔍 Verifying Student Conflicts...");
  let conflictCount = 0;
  for (const [studentId, courses] of enrollmentMatrix.entries()) {
    const studentExams = new Map<string, { date: string; time: string }>();

    for (const courseCode of courses) {
      const assignment = result.assignments.get(courseCode);
      if (assignment) {
        const key = `${assignment.date}-${assignment.time}`;
        if (studentExams.has(key)) {
          console.log(
            `   ⚠️  ${studentId} has conflict: ${courseCode} and ${studentExams.get(
              key
            )} at ${assignment.date} ${assignment.time}`
          );
          conflictCount++;
        }
        studentExams.set(key, { date: assignment.date, time: assignment.time });
      }
    }
  }

  if (conflictCount === 0) {
    console.log("   ✅ No student conflicts found!");
  } else {
    console.log(`   ❌ Found ${conflictCount} student conflicts!`);
  }
  console.log("");

  console.log("=".repeat(60));
  console.log("\n✨ Test Complete!\n");

  // Summary
  if (
    result.stats.assigned === result.stats.total_exams &&
    conflictCount === 0
  ) {
    console.log("🎉 SUCCESS: All exams scheduled with no conflicts!");
    console.log("   The TBD room feature is working correctly.");
  } else if (result.stats.assigned > 0) {
    console.log("⚠️  PARTIAL SUCCESS: Some exams scheduled.");
  } else {
    console.log("❌ FAILURE: No exams were scheduled.");
  }
}

// Run the test
testExamScheduling().catch(console.error);
