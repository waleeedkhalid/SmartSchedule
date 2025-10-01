import { FacultyAvailability } from "@/lib/types";

/**
 * Mock SWE Faculty Availability Data
 * Comprehensive faculty pool for the SWE Department
 *
 * Faculty Distribution:
 * - Senior Faculty (Professors): 5 - Can teach any level
 * - Associate Professors: 5 - Can teach levels 4-7
 * - Assistant Professors: 5 - Can teach levels 4-6
 * Total: 15 faculty members
 */

export const mockSWEFaculty: FacultyAvailability[] = [
  // ============================================================================
  // SENIOR FACULTY (PROFESSORS) - Can teach any level, including capstone
  // ============================================================================
  {
    instructorId: "SWE-FAC001",
    instructorName: "Prof. Ahmed Al-Rashid",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "14:00" },
      { day: "Monday", startTime: "08:00", endTime: "14:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "14:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE211", "SWE312", "SWE333", "SWE497"], // Intro to capstone
  },
  {
    instructorId: "SWE-FAC002",
    instructorName: "Prof. Fatima Hassan",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "09:00", endTime: "15:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "15:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "15:00" },
      { day: "Thursday", startTime: "09:00", endTime: "15:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE314", "SWE363", "SWE434", "SWE497"], // Database to capstone
  },
  {
    instructorId: "SWE-FAC003",
    instructorName: "Prof. Omar Ibrahim",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "10:00", endTime: "16:00" },
      { day: "Monday", startTime: "10:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "16:00" },
      { day: "Thursday", startTime: "10:00", endTime: "16:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE226", "SWE321", "SWE381", "SWE444"], // OOP to HCI
  },
  {
    instructorId: "SWE-FAC004",
    instructorName: "Prof. Sara Mohammed",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "13:00" },
      { day: "Monday", startTime: "08:00", endTime: "13:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "13:00" },
      { day: "Thursday", startTime: "08:00", endTime: "13:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE312", "SWE333", "SWE444", "SWE497"], // Architecture focus
  },
  {
    instructorId: "SWE-FAC005",
    instructorName: "Prof. Khalid Abdullah",
    department: "SWE",
    availableSlots: [
      { day: "Monday", startTime: "10:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "17:00" },
      { day: "Thursday", startTime: "10:00", endTime: "17:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE211", "SWE314", "SWE363", "SWE434"], // Intro to SE Engineering
  },

  // ============================================================================
  // ASSOCIATE PROFESSORS - Can teach levels 4-7
  // ============================================================================
  {
    instructorId: "SWE-FAC006",
    instructorName: "Assoc. Prof. Layla Ahmad",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "09:00", endTime: "14:00" },
      { day: "Monday", startTime: "09:00", endTime: "14:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "14:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE211", "SWE226", "SWE312"], // Early level courses
  },
  {
    instructorId: "SWE-FAC007",
    instructorName: "Assoc. Prof. Mohammed Youssef",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "11:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "11:00", endTime: "16:00" },
      { day: "Wednesday", startTime: "11:00", endTime: "16:00" },
      { day: "Thursday", startTime: "11:00", endTime: "16:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE314", "SWE321", "SWE434"], // Web and databases
  },
  {
    instructorId: "SWE-FAC008",
    instructorName: "Assoc. Prof. Nora Salem",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "12:00" },
      { day: "Monday", startTime: "08:00", endTime: "12:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "12:00" },
      { day: "Thursday", startTime: "08:00", endTime: "12:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE226", "SWE333", "SWE363"], // OOP and design patterns
  },
  {
    instructorId: "SWE-FAC009",
    instructorName: "Assoc. Prof. Hassan Khalil",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "13:00", endTime: "17:00" },
      { day: "Monday", startTime: "13:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "13:00", endTime: "17:00" },
      { day: "Thursday", startTime: "13:00", endTime: "17:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE312", "SWE381", "SWE444"], // Architecture and SE Eng
  },
  {
    instructorId: "SWE-FAC010",
    instructorName: "Assoc. Prof. Amina Mustafa",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "10:00", endTime: "15:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "15:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "15:00" },
      { day: "Thursday", startTime: "10:00", endTime: "15:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE211", "SWE321", "SWE434"], // Intro, web, HCI
  },

  // ============================================================================
  // ASSISTANT PROFESSORS - Can teach levels 4-6 (foundational courses)
  // ============================================================================
  {
    instructorId: "SWE-FAC011",
    instructorName: "Asst. Prof. Rania Farid",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "13:00" },
      { day: "Monday", startTime: "08:00", endTime: "13:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "13:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "13:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE211", "SWE226", "SWE314"], // Intro and foundational
  },
  {
    instructorId: "SWE-FAC012",
    instructorName: "Asst. Prof. Tariq Mahmoud",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "09:00", endTime: "14:00" },
      { day: "Tuesday", startTime: "09:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "14:00" },
      { day: "Thursday", startTime: "09:00", endTime: "14:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE211", "SWE312", "SWE333"], // OOP focus
  },
  {
    instructorId: "SWE-FAC013",
    instructorName: "Asst. Prof. Dina Kamal",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "11:00", endTime: "16:00" },
      { day: "Monday", startTime: "11:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "11:00", endTime: "16:00" },
      { day: "Thursday", startTime: "11:00", endTime: "16:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE226", "SWE321", "SWE363"], // Web and requirements
  },
  {
    instructorId: "SWE-FAC014",
    instructorName: "Asst. Prof. Yasser Nabil",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "10:00", endTime: "14:00" },
      { day: "Monday", startTime: "10:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "14:00" },
      { day: "Thursday", startTime: "10:00", endTime: "14:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE211", "SWE314", "SWE381"], // Database and testing
  },
  {
    instructorId: "SWE-FAC015",
    instructorName: "Asst. Prof. Hoda Sami",
    department: "SWE",
    availableSlots: [
      { day: "Sunday", startTime: "13:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "13:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "13:00", endTime: "17:00" },
      { day: "Thursday", startTime: "13:00", endTime: "17:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE226", "SWE312", "SWE333"], // Architecture focus
  },
];

/**
 * Helper: Get faculty who can teach a specific course (by preference)
 */
export function getFacultyForCourse(courseCode: string): FacultyAvailability[] {
  return mockSWEFaculty.filter((f) => f.preferences?.includes(courseCode));
}

/**
 * Helper: Get all SWE faculty
 */
export function getAllSWEFaculty(): FacultyAvailability[] {
  return mockSWEFaculty;
}

/**
 * Helper: Get faculty count
 */
export function getSWEFacultyCount(): number {
  return mockSWEFaculty.length;
}

/**
 * Helper: Get faculty by rank
 */
export function getFacultyByRank(
  rank: "Professor" | "Associate" | "Assistant"
): FacultyAvailability[] {
  const ranges = {
    Professor: [
      "SWE-FAC001",
      "SWE-FAC002",
      "SWE-FAC003",
      "SWE-FAC004",
      "SWE-FAC005",
    ],
    Associate: [
      "SWE-FAC006",
      "SWE-FAC007",
      "SWE-FAC008",
      "SWE-FAC009",
      "SWE-FAC010",
    ],
    Assistant: [
      "SWE-FAC011",
      "SWE-FAC012",
      "SWE-FAC013",
      "SWE-FAC014",
      "SWE-FAC015",
    ],
  };

  return mockSWEFaculty.filter((f) => ranges[rank].includes(f.instructorId));
}

/**
 * Helper: Get available faculty for a specific time slot
 */
export function getFacultyAvailableAt(
  day: string,
  startTime: string
): FacultyAvailability[] {
  return mockSWEFaculty.filter((faculty) =>
    faculty.availableSlots.some(
      (slot) =>
        slot.day === day &&
        slot.startTime <= startTime &&
        slot.endTime > startTime
    )
  );
}

/**
 * Helper: Calculate total teaching capacity (hours/week)
 */
export function getTotalTeachingCapacity(): number {
  return mockSWEFaculty.reduce((sum, f) => sum + f.maxTeachingHours, 0);
}

/**
 * Helper: Get faculty statistics
 */
export function getFacultyStatistics() {
  return {
    total: mockSWEFaculty.length,
    professors: getFacultyByRank("Professor").length,
    associates: getFacultyByRank("Associate").length,
    assistants: getFacultyByRank("Assistant").length,
    totalCapacity: getTotalTeachingCapacity(),
    averageCapacity: getTotalTeachingCapacity() / mockSWEFaculty.length,
  };
}
