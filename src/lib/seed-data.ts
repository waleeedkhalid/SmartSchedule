// Seed data to populate the in-memory data store
// Loads data from mockData.ts

import {
  dataStore,
  studentCountService,
  electivePackageService,
  irregularStudentService,
  courseOfferingService,
} from "./data-store";
import {
  mockStudentCounts,
  mockElectivePackages,
  mockSWEIrregularStudents,
  mockCourseOfferings,
} from "@/data/mockData";
import { CourseOffering } from "./types";

export function seedData() {
  // Skip if already seeded
  if (dataStore.courseOfferings.length > 0) {
    console.log("Data already seeded, skipping...");
    return;
  }

  console.log("Seeding data from mockData.ts...");

  // Load student counts
  mockStudentCounts.forEach((sc) => {
    studentCountService.create(sc);
  });
  console.log(`✅ Loaded ${mockStudentCounts.length} student counts`);

  // Load elective packages
  mockElectivePackages.forEach((pkg) => {
    electivePackageService.create(pkg);
  });
  console.log(`✅ Loaded ${mockElectivePackages.length} elective packages`);

  // Load irregular students
  mockSWEIrregularStudents.forEach((student) => {
    irregularStudentService.create(student);
  });
  console.log(
    `✅ Loaded ${mockSWEIrregularStudents.length} irregular students`
  );

  // Load course offerings (with type assertion for JSON compatibility)
  mockCourseOfferings.forEach((course: CourseOffering) => {
    courseOfferingService.create(course);
  });
  console.log(`✅ Loaded ${mockCourseOfferings.length} course offerings`);

  console.log("✅ Seeding complete!");
}
