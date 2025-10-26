import type { ScheduleSection } from '@/types/schedule';

// =====================================================
// PDF EXPORT
// =====================================================

export interface PDFExportOptions {
  studentName?: string;
  studentNumber?: string;
  termName?: string;
  level?: number;
}

/**
 * Export schedule to PDF format
 * Uses jsPDF library for PDF generation
 */
export async function exportToPDF(
  sections: ScheduleSection[],
  options: PDFExportOptions = {}
): Promise<Blob> {
  // Dynamically import jsPDF to reduce bundle size
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF() as any;

  // Header
  doc.setFontSize(18);
  doc.text('Class Schedule', 105, 15, { align: 'center' });

  // Student Info
  let yPosition = 30;
  doc.setFontSize(11);
  
  if (options.studentName) {
    doc.text(`Student: ${options.studentName}`, 20, yPosition);
    yPosition += 7;
  }
  
  if (options.studentNumber) {
    doc.text(`Student Number: ${options.studentNumber}`, 20, yPosition);
    yPosition += 7;
  }
  
  if (options.termName) {
    doc.text(`Term: ${options.termName}`, 20, yPosition);
    yPosition += 7;
  }
  
  if (options.level) {
    doc.text(`Level: ${options.level}`, 20, yPosition);
    yPosition += 7;
  }

  // Calculate total credits
  const totalCredits = sections.reduce((sum, section) => sum + (section.credits || 0), 0);
  doc.text(`Total Credit Hours: ${totalCredits}`, 20, yPosition);
  yPosition += 10;

  if (sections.length === 0) {
    doc.setFontSize(10);
    doc.text('No courses in schedule', 20, yPosition);
  } else {
    // Course Table
    const tableData = sections.flatMap((section) =>
      section.times.map((time) => [
        section.course_code,
        section.course_name,
        time.day,
        `${time.start_time} - ${time.end_time}`,
        section.room || 'TBA',
        section.instructor || 'TBA',
        section.type,
      ])
    );

    autoTable(doc, {
      startY: yPosition,
      head: [['Code', 'Course Name', 'Day', 'Time', 'Room', 'Instructor', 'Type']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Return as Blob
  return doc.output('blob');
}

// =====================================================
// iCAL EXPORT
// =====================================================

export interface ICalExportOptions {
  termStartDate: string; // YYYY-MM-DD
  termEndDate: string; // YYYY-MM-DD
  timezone?: string;
}

/**
 * Export schedule to iCal format
 * Compatible with Google Calendar, Apple Calendar, Outlook, etc.
 */
export function exportToICal(
  sections: ScheduleSection[],
  options: ICalExportOptions
): string {
  const { termStartDate, termEndDate, timezone = 'Asia/Riyadh' } = options;

  // iCal header
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartSchedule//Student Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Class Schedule`,
    `X-WR-TIMEZONE:${timezone}`,
  ].join('\r\n');

  // Convert day names to iCal format
  const dayMap: Record<string, string> = {
    SUNDAY: 'SU',
    MONDAY: 'MO',
    TUESDAY: 'TU',
    WEDNESDAY: 'WE',
    THURSDAY: 'TH',
    FRIDAY: 'FR',
    SATURDAY: 'SA',
  };

  // Add events for each course time slot
  sections.forEach((section) => {
    section.times.forEach((time) => {
      const startDate = findFirstDayOfWeek(time.day, termStartDate);
      const startDateTime = formatICalDateTime(startDate, time.start_time);
      const endDateTime = formatICalDateTime(startDate, time.end_time);
      const untilDate = termEndDate.replace(/-/g, '');

      icalContent += '\r\n' + [
        'BEGIN:VEVENT',
        `DTSTART;TZID=${timezone}:${startDateTime}`,
        `DTEND;TZID=${timezone}:${endDateTime}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayMap[time.day]};UNTIL=${untilDate}T235959Z`,
        `SUMMARY:${section.course_code} - ${section.course_name}`,
        `LOCATION:${section.room || 'TBA'}`,
        `DESCRIPTION:Instructor: ${section.instructor || 'TBA'}\\nSection: ${section.section_id}\\nType: ${section.type}`,
        `UID:${section.section_id}-${time.day}-${Date.now()}@smartschedule.com`,
        'STATUS:CONFIRMED',
        'END:VEVENT',
      ].join('\r\n');
    });
  });

  icalContent += '\r\nEND:VCALENDAR';

  return icalContent;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Find the first occurrence of a day of week on or after a start date
 */
function findFirstDayOfWeek(dayName: string, startDate: string): Date {
  const dayIndexMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const targetDay = dayIndexMap[dayName];
  const date = new Date(startDate);
  const currentDay = date.getDay();
  
  // Calculate days to add
  const daysToAdd = (targetDay - currentDay + 7) % 7;
  date.setDate(date.getDate() + daysToAdd);
  
  return date;
}

/**
 * Format date and time for iCal format (YYYYMMDDTHHMMSS)
 */
function formatICalDateTime(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Convert time from HH:MM to HHMMSS
  const [hours, minutes] = time.split(':');
  const timeString = `${hours.padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  
  return `${year}${month}${day}T${timeString}`;
}

/**
 * Download blob as file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download text content as file
 */
export function downloadTextFile(content: string, filename: string, mimeType: string = 'text/calendar'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadFile(blob, filename);
}

