import externalDepartmentsData from "@/data/external-departments.json";

/**
 * ExternalCourseLoader - Phase 2: External Course Handling
 *
 * Loads external courses from the JSON file and converts them
 * to a format that can be used for constraint checking in the scheduler
 */
export class ExternalCourseLoader {
  /**
   * Load all external courses from the JSON file
   */
  loadExternalCourses(): Array<{
    code: string;
    name: string;
    credits: number;
    department: string;
    level: number;
    type: string;
    sections: Array<{
      id: string;
      courseCode: string;
      instructor: string;
      room: string;
      times: Array<{
        day: string;
        start: string;
        end: string;
      }>;
    }>;
    exams: {
      midterm?: {
        date: string;
        time: string;
        duration: number;
      };
      midterm2?: {
        date: string;
        time: string;
        duration: number;
      };
      final: {
        date: string;
        time: string;
        duration: number;
      };
    };
  }> {
    return externalDepartmentsData.courses;
  }

  /**
   * Get all time slots used by external courses
   * This is useful for avoiding conflicts when scheduling SWE courses
   */
  getAllExternalTimeSlots(): Array<{
    courseCode: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }> {
    const courses = this.loadExternalCourses();
    const timeSlots: Array<{
      courseCode: string;
      day: string;
      startTime: string;
      endTime: string;
      room: string;
    }> = [];

    courses.forEach((course) => {
      course.sections.forEach((section) => {
        section.times.forEach((time) => {
          timeSlots.push({
            courseCode: course.code,
            day: time.day,
            startTime: time.start,
            endTime: time.end,
            room: section.room,
          });
        });
      });
    });

    return timeSlots;
  }

  /**
   * Get all exam slots used by external courses
   * This is useful for avoiding exam conflicts
   */
  getAllExternalExamSlots(): Array<{
    courseCode: string;
    examType: string;
    date: string;
    time: string;
    duration: number;
  }> {
    const courses = this.loadExternalCourses();
    const examSlots: Array<{
      courseCode: string;
      examType: string;
      date: string;
      time: string;
      duration: number;
    }> = [];

    courses.forEach((course) => {
      if (course.exams.midterm) {
        examSlots.push({
          courseCode: course.code,
          examType: "midterm",
          date: course.exams.midterm.date,
          time: course.exams.midterm.time,
          duration: course.exams.midterm.duration,
        });
      }

      if (course.exams.midterm2) {
        examSlots.push({
          courseCode: course.code,
          examType: "midterm2",
          date: course.exams.midterm2.date,
          time: course.exams.midterm2.time,
          duration: course.exams.midterm2.duration,
        });
      }

      if (course.exams.final) {
        examSlots.push({
          courseCode: course.code,
          examType: "final",
          date: course.exams.final.date,
          time: course.exams.final.time,
          duration: course.exams.final.duration,
        });
      }
    });

    return examSlots;
  }

  /**
   * Parse and validate external course data
   * Returns validation errors if any
   */
  validateExternalCourses(): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const courses = this.loadExternalCourses();

    if (!courses || courses.length === 0) {
      errors.push("No external courses found in data file");
      return { valid: false, errors };
    }

    courses.forEach((course, index) => {
      if (!course.code) {
        errors.push(`Course at index ${index} missing code`);
      }
      if (!course.name) {
        errors.push(`Course at index ${index} missing name`);
      }
      if (!course.sections || course.sections.length === 0) {
        errors.push(`Course ${course.code} has no sections`);
      }

      course.sections?.forEach((section, sectionIndex) => {
        if (!section.times || section.times.length === 0) {
          errors.push(
            `Course ${course.code}, section ${sectionIndex} has no time slots`
          );
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

