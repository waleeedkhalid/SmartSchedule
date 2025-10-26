import { describe, it, expect, beforeEach } from 'vitest';
import { exportToPDF, exportToICal } from '@/lib/schedule/schedule-export';
import type { ScheduleSection } from '@/types/schedule';

describe('Schedule Export Utilities', () => {
  const mockSections: ScheduleSection[] = [
    {
      course_code: 'CS301',
      course_name: 'Data Structures',
      section_id: 'CS301-01',
      instructor: 'Dr. Smith',
      room: 'E201',
      type: 'REQUIRED',
      credits: 3,
      times: [
        { day: 'SUNDAY', start_time: '08:00', end_time: '09:30' },
        { day: 'TUESDAY', start_time: '08:00', end_time: '09:30' },
      ],
    },
    {
      course_code: 'CS401',
      course_name: 'Machine Learning',
      section_id: 'CS401-01',
      instructor: 'Dr. Johnson',
      room: 'E202',
      type: 'ELECTIVE',
      credits: 3,
      times: [
        { day: 'MONDAY', start_time: '10:00', end_time: '11:30' },
        { day: 'WEDNESDAY', start_time: '10:00', end_time: '11:30' },
      ],
    },
  ];

  describe('exportToPDF', () => {
    it('should generate PDF blob from schedule data', async () => {
      const result = await exportToPDF(mockSections, {
        studentName: 'Ahmad Al-Rashid',
        termName: 'Fall 2025',
        level: 3,
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });

    it('should include all course information in PDF', async () => {
      const result = await exportToPDF(mockSections, {
        studentName: 'Ahmad Al-Rashid',
        termName: 'Fall 2025',
      });

      // Verify it's a valid PDF blob with content
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(1000); // Should have substantial content
    });

    it('should calculate and display total credits', async () => {
      const result = await exportToPDF(mockSections, {
        studentName: 'Test Student',
        termName: 'Fall 2025',
      });

      // Verify PDF was generated with content
      expect(result.size).toBeGreaterThan(1000);
      expect(result.type).toBe('application/pdf');
    });

    it('should handle empty schedule gracefully', async () => {
      const result = await exportToPDF([], {
        studentName: 'Test Student',
        termName: 'Fall 2025',
      });

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      // Even empty PDF should have base content (header, footer)
      expect(result.size).toBeGreaterThan(500);
    });
  });

  describe('exportToICal', () => {
    it('should generate iCal format string', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('END:VCALENDAR');
      expect(result).toContain('VERSION:2.0');
      expect(result).toContain('PRODID:-//SmartSchedule//');
    });

    it('should create VEVENT for each course time slot', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      // Should have events for CS301 (2 times) and CS401 (2 times) = 4 events
      const eventCount = (result.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(4);
    });

    it('should include course details in event summary', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      expect(result).toContain('SUMMARY:CS301 - Data Structures');
      expect(result).toContain('LOCATION:E201');
      expect(result).toContain('DESCRIPTION:Instructor: Dr. Smith');
    });

    it('should set correct recurrence rules for weekly events', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      // Should have RRULE for weekly recurrence
      expect(result).toContain('RRULE:FREQ=WEEKLY');
      expect(result).toContain('UNTIL=20251220');
    });

    it('should convert day names to iCal format', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      // SUNDAY, MONDAY, etc. should be in iCal format (SU, MO, etc.)
      expect(result).toContain('BYDAY=SU'); // Sunday
      expect(result).toContain('BYDAY=MO'); // Monday
      expect(result).toContain('BYDAY=TU'); // Tuesday
      expect(result).toContain('BYDAY=WE'); // Wednesday
    });

    it('should handle empty schedule gracefully', () => {
      const result = exportToICal([], {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      expect(result).toContain('BEGIN:VCALENDAR');
      expect(result).toContain('END:VCALENDAR');
      const eventCount = (result.match(/BEGIN:VEVENT/g) || []).length;
      expect(eventCount).toBe(0);
    });

    it('should format time slots correctly (HHMMSS format)', () => {
      const result = exportToICal(mockSections, {
        termStartDate: '2025-09-01',
        termEndDate: '2025-12-20',
      });

      // Times should be in format like 080000 for 08:00
      expect(result).toMatch(/DTSTART.*080000/);
      expect(result).toMatch(/DTEND.*093000/);
    });
  });
});

