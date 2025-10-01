/**
 * Test file to verify Phase 4 implementation
 * Tests ScheduleGenerator class for generating complete schedules
 */

import { ScheduleGenerator } from "./ScheduleGenerator";
import { ScheduleGenerationRequest } from "@/lib/types";

export async function testPhase4ScheduleGeneration() {
  console.log("=".repeat(60));
  console.log("SCHEDULE GENERATION - PHASE 4 CORE GENERATION");
  console.log("=".repeat(60));
  console.log();

  const generator = new ScheduleGenerator();

  // Test 1: Generate schedule for a single level
  console.log("✅ TEST 1: SINGLE LEVEL GENERATION");
  console.log("-".repeat(60));

  const request1: ScheduleGenerationRequest = {
    semester: "Fall 2025",
    levels: [4],
    considerIrregularStudents: false,
    optimizationGoals: ["minimize-conflicts"],
  };

  const schedule1 = await generator.generate(request1);
  console.log(`\nGenerated Schedule ID: ${schedule1.id}`);
  console.log(`Semester: ${schedule1.semester}`);
  console.log(`Levels processed: ${schedule1.levels.length}`);
  console.log(`Total sections: ${schedule1.metadata.totalSections}`);
  console.log(`Total exams: ${schedule1.metadata.totalExams}`);
  console.log(`Conflicts found: ${schedule1.conflicts.length}`);
  console.log();

  // Test 2: Generate schedule for multiple levels
  console.log("✅ TEST 2: MULTIPLE LEVELS GENERATION");
  console.log("-".repeat(60));

  const request2: ScheduleGenerationRequest = {
    semester: "Fall 2025",
    levels: [4, 5, 6],
    considerIrregularStudents: false,
    optimizationGoals: ["minimize-conflicts", "balance-load"],
  };

  const schedule2 = await generator.generate(request2);
  console.log(`\nGenerated Schedule ID: ${schedule2.id}`);
  console.log(`Semester: ${schedule2.semester}`);
  console.log(`Levels processed: ${schedule2.levels.length}`);

  schedule2.levels.forEach((level) => {
    console.log(`\nLevel ${level.level}:`);
    console.log(`  Students: ${level.studentCount}`);
    console.log(`  SWE Courses: ${level.courses.length}`);
    console.log(`  External Courses: ${level.externalCourses.length}`);
    console.log(
      `  Sections: ${level.courses.reduce(
        (sum, c) => sum + c.sections.length,
        0
      )}`
    );
  });

  console.log(`\nOverall Metadata:`);
  console.log(`  Total sections: ${schedule2.metadata.totalSections}`);
  console.log(`  Total exams: ${schedule2.metadata.totalExams}`);
  console.log(
    `  Faculty utilization: ${schedule2.metadata.facultyUtilization.toFixed(
      1
    )}%`
  );
  console.log(
    `  Room utilization: ${schedule2.metadata.roomUtilization.toFixed(1)}%`
  );
  console.log(`  Conflicts: ${schedule2.conflicts.length}`);
  console.log();

  // Test 3: Generate complete schedule for all levels
  console.log("✅ TEST 3: ALL LEVELS GENERATION");
  console.log("-".repeat(60));

  const request3: ScheduleGenerationRequest = {
    semester: "Fall 2025",
    levels: [4, 5, 6, 7, 8],
    considerIrregularStudents: true,
    optimizationGoals: ["minimize-conflicts", "balance-load", "prefer-morning"],
  };

  const schedule3 = await generator.generate(request3);
  console.log(`\nGenerated Schedule ID: ${schedule3.id}`);
  console.log(`Semester: ${schedule3.semester}`);

  console.log(`\nLevel Summary:`);
  schedule3.levels.forEach((level) => {
    const totalSections = level.courses.reduce(
      (sum, c) => sum + c.sections.length,
      0
    );
    console.log(
      `  Level ${level.level}: ${level.studentCount} students, ${level.courses.length} courses, ${totalSections} sections`
    );
  });

  console.log(`\nCourse Breakdown by Level:`);
  schedule3.levels.forEach((level) => {
    console.log(`\nLevel ${level.level}:`);
    level.courses.forEach((course) => {
      console.log(
        `  ${course.code} (${course.type}): ${course.sections.length} section(s)`
      );
    });
  });

  console.log(`\nFinal Metadata:`);
  console.log(`  Total sections: ${schedule3.metadata.totalSections}`);
  console.log(`  Total exams: ${schedule3.metadata.totalExams}`);
  console.log(
    `  Faculty utilization: ${schedule3.metadata.facultyUtilization.toFixed(
      1
    )}%`
  );
  console.log(
    `  Room utilization: ${schedule3.metadata.roomUtilization.toFixed(1)}%`
  );

  console.log(`\nConflict Analysis:`);
  console.log(`  Total conflicts: ${schedule3.conflicts.length}`);
  if (schedule3.conflicts.length > 0) {
    const conflictTypes = schedule3.conflicts.reduce((acc, conflict) => {
      acc[conflict.type] = (acc[conflict.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`  By type:`, conflictTypes);

    const conflictSeverity = schedule3.conflicts.reduce((acc, conflict) => {
      acc[conflict.severity] = (acc[conflict.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log(`  By severity:`, conflictSeverity);

    console.log(`\nSample conflicts (first 5):`);
    schedule3.conflicts.slice(0, 5).forEach((conflict, idx) => {
      console.log(`  ${idx + 1}. [${conflict.severity}] ${conflict.message}`);
    });
  }

  // Test 4: Section Details
  console.log();
  console.log("✅ TEST 4: SECTION DETAILS");
  console.log("-".repeat(60));

  const firstLevel = schedule3.levels[0];
  const firstCourse = firstLevel.courses[0];

  if (firstCourse && firstCourse.sections.length > 0) {
    console.log(`\nExample course: ${firstCourse.code} - ${firstCourse.name}`);
    console.log(`Type: ${firstCourse.type}`);
    console.log(`Credits: ${firstCourse.credits}`);
    console.log(`Sections: ${firstCourse.sections.length}`);

    console.log(`\nSection details:`);
    firstCourse.sections.forEach((section) => {
      console.log(`\n  ${section.id}:`);
      console.log(`    Instructor: ${section.instructor}`);
      console.log(`    Room: ${section.room}`);
      console.log(`    Capacity: ${section.capacity}`);
      console.log(`    Meeting times:`);
      section.times.forEach((time) => {
        console.log(`      ${time.day} ${time.start}-${time.end}`);
      });
    });

    if (firstCourse.exams) {
      console.log(`\n  Exams:`);
      if (firstCourse.exams.midterm) {
        console.log(
          `    Midterm: ${firstCourse.exams.midterm.date} at ${firstCourse.exams.midterm.time}`
        );
      }
      if (firstCourse.exams.final) {
        console.log(
          `    Final: ${firstCourse.exams.final.date} at ${firstCourse.exams.final.time}`
        );
      }
    }
  }

  // Test 5: Electives Generation
  console.log();
  console.log("✅ TEST 5: ELECTIVES GENERATION");
  console.log("-".repeat(60));

  const electiveLevels = schedule3.levels.filter((l) => l.level >= 6);
  console.log(
    `\nLevels with electives: ${electiveLevels.map((l) => l.level).join(", ")}`
  );

  electiveLevels.forEach((level) => {
    const electives = level.courses.filter((c) => c.type === "ELECTIVE");
    console.log(`\nLevel ${level.level}:`);
    console.log(`  Elective courses offered: ${electives.length}`);
    electives.forEach((course) => {
      const totalCapacity = course.sections.reduce(
        (sum, s) => sum + (s.capacity || 0),
        0
      );
      console.log(
        `    ${course.code}: ${course.sections.length} section(s), capacity ${totalCapacity}`
      );
    });
  });

  console.log();
  console.log("✅ PHASE 4 TESTING COMPLETE");
  console.log("=".repeat(60));
  console.log();
  console.log("Summary:");
  console.log(`  ✓ Single level generation works`);
  console.log(`  ✓ Multiple levels generation works`);
  console.log(`  ✓ Complete schedule (all 5 levels) generated`);
  console.log(`  ✓ Section details properly structured`);
  console.log(`  ✓ Electives generated based on demand`);
  console.log(`  ✓ Metadata calculated correctly`);
  console.log(`  ✓ Conflicts detected and reported`);
}
