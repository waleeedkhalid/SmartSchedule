// verify-setup.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verifying SmartSchedule MVP Setup...\n");

  // Check courses
  const courseCount = await prisma.course.count();
  console.log(`📚 Courses loaded: ${courseCount}`);

  // Check sections
  const sectionCount = await prisma.section.count();
  console.log(`📝 Sections loaded: ${sectionCount}`);

  // Check section meetings
  const meetingCount = await prisma.sectionMeeting.count();
  console.log(`⏰ Section meetings loaded: ${meetingCount}`);

  // Check workflow state
  const workflowCount = await prisma.workflowState.count();
  console.log(`🔄 Workflow states: ${workflowCount}`);

  // Check student counts
  const studentCountsCount = await prisma.studentCount.count();
  console.log(`👥 Student counts: ${studentCountsCount}`);

  // Check irregular students
  const irregularCount = await prisma.irregularStudent.count();
  console.log(`⚠️  Irregular students: ${irregularCount}`);

  // Check faculty availability
  const facultyCount = await prisma.facultyAvailability.count();
  console.log(`👨‍🏫 Faculty availability records: ${facultyCount}`);

  // Sample data check
  console.log("\n📋 Sample Data:");

  const sampleCourse = await prisma.course.findFirst({
    include: {
      sections: {
        include: {
          meetings: true,
        },
      },
    },
  });

  if (sampleCourse) {
    console.log(`- Course: ${sampleCourse.code} - ${sampleCourse.title}`);
    console.log(`- Sections: ${sampleCourse.sections.length}`);
    console.log(
      `- First section meetings: ${
        sampleCourse.sections[0]?.meetings.length || 0
      }`
    );
  }

  console.log("\n✅ Setup verification completed!");
}

main()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
