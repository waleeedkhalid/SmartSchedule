/**
 * Faculty Availability Fixtures
 * Faculty availability submissions for scheduling
 */

import { TEST_USERS } from './users.fixture';
import { TEST_TERM_CODE } from './sections.fixture';

export type AvailabilityStatus = 'PREFERRED' | 'AVAILABLE' | 'UNAVAILABLE';

export interface TimeSlotAvailability {
  day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
  hour: number; // 8-16 (8 AM - 4 PM)
  status: AvailabilityStatus;
}

export interface TestFacultyAvailability {
  id: string;
  faculty_id: string;
  term_code: string;
  availability_data: TimeSlotAvailability[];
  notes: string | null;
  max_load_preference: number; // Credit hours
  submitted: boolean;
  submitted_at: string | null;
}

// =====================================================
// GENERATE AVAILABILITY FOR ALL FACULTY
// =====================================================

const generateAvailabilityGrid = (pattern: 'morning' | 'afternoon' | 'mixed'): TimeSlotAvailability[] => {
  const grid: TimeSlotAvailability[] = [];
  const days: Array<'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'> = 
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  
  days.forEach((day) => {
    for (let hour = 8; hour <= 16; hour++) {
      let status: AvailabilityStatus;
      
      // Lunch break (12 PM) is always unavailable
      if (hour === 12) {
        status = 'UNAVAILABLE';
      } else if (pattern === 'morning') {
        // Prefer morning (8-11), available afternoon (13-16), unavailable late
        status = hour >= 8 && hour <= 11 ? 'PREFERRED' : 
                hour >= 13 && hour <= 15 ? 'AVAILABLE' : 'UNAVAILABLE';
      } else if (pattern === 'afternoon') {
        // Available morning, prefer afternoon
        status = hour >= 13 && hour <= 16 ? 'PREFERRED' : 
                hour >= 8 && hour <= 11 ? 'AVAILABLE' : 'UNAVAILABLE';
      } else {
        // Mixed pattern
        status = hour >= 9 && hour <= 15 && hour !== 12 ? 'PREFERRED' : 
                hour >= 8 && hour <= 16 && hour !== 12 ? 'AVAILABLE' : 'UNAVAILABLE';
      }
      
      grid.push({ day, hour, status });
    }
  });
  
  return grid;
};

export const createTestAvailability = (): TestFacultyAvailability[] => {
  const faculty = TEST_USERS.faculty;
  
  return [
    {
      id: `avail-${faculty[0].id}`,
      faculty_id: faculty[0].id, // Dr. Ahmad
      term_code: TEST_TERM_CODE,
      availability_data: generateAvailabilityGrid('morning'),
      notes: 'Prefer morning classes. Available most days.',
      max_load_preference: 12,
      submitted: true,
      submitted_at: '2024-10-02T09:00:00Z',
    },
    {
      id: `avail-${faculty[1].id}`,
      faculty_id: faculty[1].id, // Dr. Fatima
      term_code: TEST_TERM_CODE,
      availability_data: generateAvailabilityGrid('afternoon'),
      notes: 'Prefer afternoon classes. Childcare pickup at 3 PM on Thursdays.',
      max_load_preference: 9,
      submitted: true,
      submitted_at: '2024-10-02T11:30:00Z',
    },
    {
      id: `avail-${faculty[2].id}`,
      faculty_id: faculty[2].id, // Dr. Khalid
      term_code: TEST_TERM_CODE,
      availability_data: generateAvailabilityGrid('mixed'),
      notes: 'Flexible schedule. Faculty meetings on Thursdays at 8 AM.',
      max_load_preference: 12,
      submitted: true,
      submitted_at: '2024-10-03T14:00:00Z',
    },
  ];
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getAvailabilityByFaculty = (facultyId: string): TestFacultyAvailability | undefined => {
  return createTestAvailability().find((a) => a.faculty_id === facultyId);
};

export const getSubmittedAvailability = (): TestFacultyAvailability[] => {
  return createTestAvailability().filter((a) => a.submitted);
};

export const getAvailabilityForTimeSlot = (
  facultyId: string,
  day: TimeSlotAvailability['day'],
  hour: number
): AvailabilityStatus | null => {
  const availability = getAvailabilityByFaculty(facultyId);
  if (!availability) return null;
  
  const slot = availability.availability_data.find(
    (slot) => slot.day === day && slot.hour === hour
  );
  
  return slot?.status || null;
};

// =====================================================
// STATISTICS
// =====================================================

export const getAvailabilityStatistics = () => {
  const all = createTestAvailability();
  const submitted = getSubmittedAvailability();
  
  const totalFaculty = TEST_USERS.faculty.length;
  const submissionRate = (submitted.length / totalFaculty) * 100;
  
  const avgMaxLoad = all.reduce((sum, a) => sum + a.max_load_preference, 0) / all.length;
  
  return {
    total_faculty: totalFaculty,
    submitted_count: submitted.length,
    pending_count: totalFaculty - submitted.length,
    submission_rate: submissionRate,
    average_max_load: avgMaxLoad,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const AVAILABILITY_QUICK_REF = {
  drAhmad: getAvailabilityByFaculty(TEST_USERS.faculty[0].id),
  drFatima: getAvailabilityByFaculty(TEST_USERS.faculty[1].id),
  drKhalid: getAvailabilityByFaculty(TEST_USERS.faculty[2].id),
  submitted: getSubmittedAvailability(),
  statistics: getAvailabilityStatistics(),
};

// Export for easy access
export const TEST_AVAILABILITY = {
  all: createTestAvailability(),
  quickRef: AVAILABILITY_QUICK_REF,
  helpers: {
    getByFaculty: getAvailabilityByFaculty,
    getSubmitted: getSubmittedAvailability,
    getForTimeSlot: getAvailabilityForTimeSlot,
    getStatistics: getAvailabilityStatistics,
  },
};

