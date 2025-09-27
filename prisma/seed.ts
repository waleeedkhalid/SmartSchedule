// prisma/seed.ts

import { PrismaClient, Role, ScheduleStatus } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Departments
  const cs = await prisma.department.create({
    data: { name: "Computer Science", code: "CS" },
  });
  const math = await prisma.department.create({
    data: { name: "Mathematics", code: "MATH" },
  });

  // Users
  const scheduling = await prisma.user.create({
    data: {
      name: "Scheduler One",
      email: "sched1@ksu.test",
      password: "hashedpassword",
      role: Role.SCHEDULING_COMMITTEE,
      departmentId: cs.id,
    },
  });

  const faculty = await prisma.user.create({
    data: {
      name: "Prof. Ali",
      email: "ali@ksu.test",
      password: "hashedpassword",
      role: Role.FACULTY,
      departmentId: cs.id,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Student Sara",
      email: "sara@ksu.test",
      password: "hashedpassword",
      role: Role.STUDENT,
      departmentId: cs.id,
    },
  });

  // Courses
  const swEng = await prisma.course.create({
    data: {
      code: "SWE321",
      title: "Software Design",
      credits: 3,
      departmentId: cs.id,
    },
  });

  const calculus = await prisma.course.create({
    data: {
      code: "MATH101",
      title: "Calculus I",
      credits: 4,
      departmentId: math.id,
    },
  });

  // Timeslots for classes
  const ts1 = await prisma.timeslot.create({
    data: {
      dayOfWeek: 0, // Sunday
      startTime: new Date("2025-09-21T08:00:00.000Z"),
      endTime: new Date("2025-09-21T09:30:00.000Z"),
    },
  });

  // Section
  const section1 = await prisma.section.create({
    data: {
      number: "32763",
      capacity: 40,
      courseId: swEng.id,
      instructorId: faculty.id,
      timeslotId: ts1.id,
    },
  });

  // Schedule (Draft v1)
  const sched = await prisma.schedule.create({
    data: {
      version: 1,
      status: ScheduleStatus.DRAFT,
      departmentId: cs.id,
      createdBy: scheduling.id,
      sections: { connect: { id: section1.id } },
    },
  });

  // Feedback
  await prisma.feedback.create({
    data: {
      content: "Looks good, but section timing is tight.",
      version: 1,
      userId: student.id,
      scheduleId: sched.id,
    },
  });

  // Rule
  await prisma.rule.create({
    data: {
      name: "Break Time",
      description: "No classes between 12–1 PM",
      createdBy: scheduling.id,
    },
  });

  // Exam Timeslots
  const examTs1 = await prisma.timeslot.create({
    data: {
      dayOfWeek: 1, // Monday
      startTime: new Date("2025-12-01T12:00:00.000Z"),
      endTime: new Date("2025-12-01T14:00:00.000Z"),
    },
  });

  const examTs2 = await prisma.timeslot.create({
    data: {
      dayOfWeek: 3, // Wednesday
      startTime: new Date("2025-12-03T08:00:00.000Z"),
      endTime: new Date("2025-12-03T10:00:00.000Z"),
    },
  });

  // Exams
  await prisma.exam.create({
    data: {
      courseId: swEng.id,
      timeslotId: examTs1.id,
      scheduleId: sched.id,
      type: "MIDTERM",
    },
  });

  await prisma.exam.create({
    data: {
      courseId: calculus.id,
      timeslotId: examTs2.id,
      scheduleId: sched.id,
      type: "FINAL",
    },
  });

  console.log("Seeding completed with courses, sections, and exams.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
