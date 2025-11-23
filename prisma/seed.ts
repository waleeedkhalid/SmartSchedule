import { PrismaClient, UserRoleType, SemesterType, RoomType, SectionState } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Complete database seed script for Supabase Local + Prisma
 * 
 * This script assumes a clean database and creates seed data in the correct order:
 * 1. UserRole (must exist before StudentProfile, FacultyProfile, etc.)
 * 2. StudentProfile (depends on UserRole)
 * 3. FacultyProfile (depends on UserRole)
 * 4. AcademicSemester
 * 5. Course
 * 6. CourseOffering (depends on Course and AcademicSemester)
 * 7. Room
 * 8. Section (depends on Course, CourseOffering, Room, FacultyProfile)
 * 9. StudentGroup
 * 10. Other supporting data
 * 
 * Uses upsert for idempotency - can be re-run safely.
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Create UserRoles (Foundation)
  // ============================================
  console.log('📝 Creating UserRoles...');

  const studentUser = await prisma.userRole.upsert({
    where: { userId: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000001',
      role: UserRoleType.student,
      name: 'Test Student',
      email: 'student@test.local',
      onboardingCompleted: true,
    },
  });

  const facultyUser = await prisma.userRole.upsert({
    where: { userId: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000002',
      role: UserRoleType.faculty,
      name: 'Test Faculty',
      email: 'faculty@test.local',
      onboardingCompleted: true,
    },
  });

  const registrarUser = await prisma.userRole.upsert({
    where: { userId: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000003',
      role: UserRoleType.registrar,
      name: 'Test Registrar',
      email: 'registrar@test.local',
      onboardingCompleted: true,
    },
  });

  const schedulingUser = await prisma.userRole.upsert({
    where: { userId: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      userId: '00000000-0000-0000-0000-000000000004',
      role: UserRoleType.scheduling,
      name: 'Test Scheduler',
      email: 'scheduler@test.local',
      onboardingCompleted: true,
    },
  });

  console.log('✅ UserRoles created\n');

  // ============================================
  // 2. Create StudentProfile (depends on UserRole)
  // ============================================
  console.log('👨‍🎓 Creating StudentProfile...');

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.userId },
    update: {},
    create: {
      userId: studentUser.userId,
      level: 3,
      department: 'Software Engineering',
    },
  });

  console.log('✅ StudentProfile created\n');

  // ============================================
  // 3. Create FacultyProfile (depends on UserRole)
  // ============================================
  console.log('👨‍🏫 Creating FacultyProfile...');

  await prisma.facultyProfile.upsert({
    where: { userId: facultyUser.userId },
    update: {},
    create: {
      userId: facultyUser.userId,
      preferredTimes: [],
      unavailableTimes: [],
      maxLoadPerWeek: 12,
    },
  });

  console.log('✅ FacultyProfile created\n');

  // ============================================
  // 4. Create AcademicSemester
  // ============================================
  console.log('📅 Creating AcademicSemester...');

  const currentDate = new Date();
  const fallStart = new Date(currentDate.getFullYear(), 8, 1); // September 1
  const fallEnd = new Date(currentDate.getFullYear(), 11, 31); // December 31

  const semester = await prisma.academicSemester.upsert({
    where: { code: 'FALL2024' },
    update: {},
    create: {
      code: 'FALL2024',
      name: 'Fall 2024',
      type: SemesterType.FALL,
      startDate: fallStart,
      endDate: fallEnd,
      isActive: true,
      electivesSurveyOpen: false,
      registrationOpen: true,
      feedbackOpen: false,
      schedulePublished: false,
      isFacultyAvailabilityOpen: true,
    },
  });

  console.log('✅ AcademicSemester created\n');

  // ============================================
  // 5. Create Courses
  // ============================================
  console.log('📚 Creating Courses...');

  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      title: 'Introduction to Computer Science',
      level: 1,
      credits: 3,
      weeklyHours: 3,
      isElective: false,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      title: 'Data Structures',
      level: 2,
      credits: 3,
      weeklyHours: 3,
      isElective: false,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      code: 'CS301',
      title: 'Advanced Algorithms',
      level: 3,
      credits: 3,
      weeklyHours: 3,
      isElective: true,
    },
  });

  console.log('✅ Courses created\n');

  // ============================================
  // 6. Create CourseOffering (depends on Course & Semester)
  // ============================================
  console.log('📖 Creating CourseOfferings...');

  const offering1 = await prisma.courseOffering.upsert({
    where: {
      courseCode_semesterCode: {
        courseCode: course1.code,
        semesterCode: semester.code,
      },
    },
    update: {},
    create: {
      courseCode: course1.code,
      semesterCode: semester.code,
      isActive: true,
      maxSections: 5,
      createdBy: schedulingUser.userId,
    },
  });

  const offering2 = await prisma.courseOffering.upsert({
    where: {
      courseCode_semesterCode: {
        courseCode: course2.code,
        semesterCode: semester.code,
      },
    },
    update: {},
    create: {
      courseCode: course2.code,
      semesterCode: semester.code,
      isActive: true,
      maxSections: 3,
      createdBy: schedulingUser.userId,
    },
  });

  console.log('✅ CourseOfferings created\n');

  // ============================================
  // 7. Create Rooms
  // ============================================
  console.log('🏫 Creating Rooms...');

  const room1 = await prisma.room.upsert({
    where: { code: 'A101' },
    update: {},
    create: {
      code: 'A101',
      type: RoomType.Lecture,
      createdBy: schedulingUser.userId,
    },
  });

  const room2 = await prisma.room.upsert({
    where: { code: 'LAB101' },
    update: {},
    create: {
      code: 'LAB101',
      type: RoomType.Lab,
      createdBy: schedulingUser.userId,
    },
  });

  console.log('✅ Rooms created\n');

  // ============================================
  // 8. Create StudentGroup
  // ============================================
  console.log('👥 Creating StudentGroup...');

  const studentGroup = await prisma.studentGroup.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      level: 3,
      size: 1,
      name: 'Level 3 - Group A',
      createdBy: registrarUser.userId,
    },
  });

  // Update StudentProfile with group
  await prisma.studentProfile.update({
    where: { userId: studentUser.userId },
    data: { studentGroupId: studentGroup.id },
  });

  console.log('✅ StudentGroup created and linked\n');

  // ============================================
  // 9. Create Sections (depends on Course, Offering, Room, Faculty)
  // ============================================
  console.log('📋 Creating Sections...');

  const section1 = await prisma.section.upsert({
    where: {
      courseCode_sectionNo: {
        courseCode: course1.code,
        sectionNo: '01',
      },
    },
    update: {},
    create: {
      courseCode: course1.code,
      sectionNo: '01',
      instructorId: facultyUser.userId,
      roomCode: room1.code,
      capacity: 30,
      meetingPattern: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '09:00',
        endTime: '10:00',
      },
      groupLevel: 1,
      state: SectionState.draft,
      isScheduledByAlgorithm: false,
      courseOfferingId: offering1.id,
      createdBy: schedulingUser.userId,
    },
  });

  const section2 = await prisma.section.upsert({
    where: {
      courseCode_sectionNo: {
        courseCode: course2.code,
        sectionNo: '01',
      },
    },
    update: {},
    create: {
      courseCode: course2.code,
      sectionNo: '01',
      instructorId: facultyUser.userId,
      roomCode: room2.code,
      capacity: 25,
      meetingPattern: {
        days: ['Tuesday', 'Thursday'],
        startTime: '10:00',
        endTime: '11:30',
      },
      groupLevel: 2,
      state: SectionState.draft,
      isScheduledByAlgorithm: false,
      courseOfferingId: offering2.id,
      createdBy: schedulingUser.userId,
    },
  });

  console.log('✅ Sections created\n');

  // ============================================
  // 10. Create TimeGridConfig
  // ============================================
  console.log('⏰ Creating TimeGridConfig...');

  await prisma.timeGridConfig.upsert({
    where: { id: '00000000-0000-0000-0000-000000000020' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000020',
      teachingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dailyStartTime: '08:00:00',
      dailyEndTime: '17:00:00',
      slotDurationMinutes: 60,
      breakStartTime: '12:00:00',
      breakEndTime: '13:00:00',
      examDays: ['Saturday', 'Sunday'],
      examStartTime: '09:00:00',
      examEndTime: '17:00:00',
      typicalLabDurationMinutes: 120,
      updatedBy: schedulingUser.userId,
    },
  });

  console.log('✅ TimeGridConfig created\n');

  console.log('🎉 Database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - UserRoles: 4`);
  console.log(`   - StudentProfile: 1`);
  console.log(`   - FacultyProfile: 1`);
  console.log(`   - AcademicSemester: 1`);
  console.log(`   - Courses: 3`);
  console.log(`   - CourseOfferings: 2`);
  console.log(`   - Rooms: 2`);
  console.log(`   - StudentGroup: 1`);
  console.log(`   - Sections: 2`);
  console.log(`   - TimeGridConfig: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


