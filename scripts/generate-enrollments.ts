import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateEnrollments() {
  console.log("Starting enrollment generation...");

  // 1. Fetch all students
  const { data: students, error: studentsError } = await supabase
    .from("student_profile")
    .select("*");

  if (studentsError) {
    console.error("Error fetching students:", studentsError);
    return;
  }

  console.log(`Found ${students.length} students.`);

  // 2. Fetch all courses
  const { data: courses, error: coursesError } = await supabase
    .from("course")
    .select("*");

  if (coursesError) {
    console.error("Error fetching courses:", coursesError);
    return;
  }

  // 3. Fetch all sections
  const { data: sections, error: sectionsError } = await supabase
    .from("section")
    .select("*");

  if (sectionsError) {
    console.error("Error fetching sections:", sectionsError);
    return;
  }

  // Group sections by course_code
  interface Section {
    id: string;
    course_code: string;
    [key: string]: unknown;
  }
  const sectionsByCourse = new Map<string, Section[]>();
  (sections as unknown as Section[]).forEach((section) => {
    if (!sectionsByCourse.has(section.course_code)) {
      sectionsByCourse.set(section.course_code, []);
    }
    sectionsByCourse.get(section.course_code)?.push(section);
  });

  let enrollmentCount = 0;
  let errorCount = 0;

  for (const student of students) {
    // Filter courses for student's level and not elective
    const requiredCourses = courses.filter(
      (c) => c.recommended_level === student.level && !c.is_elective
    );

    // console.log(`Student ${student.user_id} (Level ${student.level}) needs ${requiredCourses.length} courses.`);

    for (const course of requiredCourses) {
      const courseSections = sectionsByCourse.get(course.code) || [];

      if (courseSections.length === 0) {
        // console.warn(`No sections found for course ${course.code}`);
        continue;
      }

      // Pick a random section
      const section =
        courseSections[Math.floor(Math.random() * courseSections.length)];

      // Check if already enrolled (optional, but good to avoid errors if not using upsert)
      // We'll use upsert to be safe and simple

      const { error: enrollError } = await supabase
        .from("student_enrollment")
        .upsert(
          {
            student_id: student.user_id,
            section_id: section.id,
            status: "registered",
            enrolled_at: new Date().toISOString(),
          },
          { onConflict: "student_id, section_id" }
        )
        .select();

      if (enrollError) {
        console.error(
          `Failed to enroll student ${student.user_id} in section ${section.id}:`,
          enrollError.message
        );
        errorCount++;
      } else {
        enrollmentCount++;
      }
    }
  }

  console.log(`Enrollment generation complete.`);
  console.log(`Successfully created/updated ${enrollmentCount} enrollments.`);
  if (errorCount > 0) {
    console.log(`Encountered ${errorCount} errors.`);
  }
}

generateEnrollments().catch(console.error);
