/**
 * Charts Formatter for SmartSchedule
 * Formats data for Chart.js visualization and CSV export
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface CSVExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
}

export interface Section {
  id: string;
  room_number?: string | null;
  capacity?: number;
  enrolled_count?: number;
  instructor_id?: string | null;
  instructor_name?: string | null;
  credits?: number;
}

export interface ElectivePreference {
  id: string;
  student_id: string;
  course_code: string;
  preference_order: number;
}

export interface Schedule {
  id: string;
  student_id: string;
  data: {
    sections: Array<{
      course_code: string;
      course_type: string;
    }>;
  };
}

export interface Feedback {
  id: string;
  rating: number;
  comments: string;
}

// ============================================================================
// Chart Formatting Functions
// ============================================================================

/**
 * Format satisfaction rate data for Chart.js
 * Shows how many students got their 1st, 2nd, 3rd, 4th, 5th choice electives
 */
export function formatSatisfactionRate(
  preferences: ElectivePreference[],
  schedules: Schedule[]
): ChartData {
  // Count how many students got each preference order
  const satisfactionCounts = [0, 0, 0, 0, 0]; // Indices 0-4 for 1st-5th choice
  
  schedules.forEach(schedule => {
    const studentPrefs = preferences.filter(p => p.student_id === schedule.student_id);
    const assignedElectives = schedule.data.sections
      .filter(s => s.course_type === 'ELECTIVE')
      .map(s => s.course_code);
    
    assignedElectives.forEach(electiveCode => {
      const pref = studentPrefs.find(p => p.course_code === electiveCode);
      if (pref && pref.preference_order >= 1 && pref.preference_order <= 5) {
        satisfactionCounts[pref.preference_order - 1]++;
      }
    });
  });
  
  // Convert counts to percentages
  const totalAssignments = satisfactionCounts.reduce((sum, count) => sum + count, 0);
  const percentages = satisfactionCounts.map(count => 
    totalAssignments > 0 ? Math.round((count / totalAssignments) * 100) : 0
  );
  
  return {
    labels: ['1st Choice', '2nd Choice', '3rd Choice', '4th Choice', '5th Choice'],
    datasets: [
      {
        label: 'Satisfaction Rate',
        data: percentages,
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',   // Green
          'rgba(59, 130, 246, 0.7)',  // Blue
          'rgba(250, 204, 21, 0.7)',  // Yellow
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(239, 68, 68, 0.7)',   // Red
        ],
      },
    ],
  };
}

/**
 * Format room utilization data as heatmap
 * Shows how full each room is
 */
export function formatRoomUtilization(sections: Section[]): ChartData {
  // Group by room
  const roomData = new Map<string, { totalCapacity: number; totalEnrolled: number }>();
  
  sections.forEach(section => {
    if (!section.room_number) return;
    
    const current = roomData.get(section.room_number) || { totalCapacity: 0, totalEnrolled: 0 };
    roomData.set(section.room_number, {
      totalCapacity: current.totalCapacity + (section.capacity || 0),
      totalEnrolled: current.totalEnrolled + (section.enrolled_count || 0),
    });
  });
  
  // Calculate utilization percentages
  const rooms = Array.from(roomData.keys()).sort();
  const utilizations = rooms.map(room => {
    const data = roomData.get(room)!;
    return data.totalCapacity > 0 
      ? Math.round((data.totalEnrolled / data.totalCapacity) * 100)
      : 0;
  });
  
  return {
    labels: rooms,
    datasets: [
      {
        label: 'Room Utilization',
        data: utilizations,
        backgroundColor: utilizations.map(util => {
          if (util >= 90) return 'rgba(239, 68, 68, 0.7)';   // Red (overutilized)
          if (util >= 75) return 'rgba(250, 204, 21, 0.7)';  // Yellow (good)
          if (util >= 50) return 'rgba(34, 197, 94, 0.7)';   // Green (optimal)
          return 'rgba(59, 130, 246, 0.7)';                  // Blue (underutilized)
        }),
      },
    ],
  };
}

/**
 * Format faculty load distribution as histogram
 * Shows credit hours assigned to each faculty member
 */
export function formatLoadDistribution(sections: Section[]): ChartData {
  // Group by faculty
  const facultyLoad = new Map<string, number>();
  
  sections.forEach(section => {
    if (!section.instructor_id || !section.instructor_name) return;
    
    const current = facultyLoad.get(section.instructor_name) || 0;
    facultyLoad.set(section.instructor_name, current + (section.credits || 3));
  });
  
  // Sort by name for consistent ordering
  const facultyNames = Array.from(facultyLoad.keys()).sort();
  const loads = facultyNames.map(name => facultyLoad.get(name)!);
  
  return {
    labels: facultyNames,
    datasets: [
      {
        label: 'Teaching Load',
        data: loads,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
      },
    ],
  };
}

/**
 * Format feedback distribution as pie chart
 * Shows rating distribution (1-5 stars)
 */
export function formatFeedbackDistribution(feedback: Feedback[]): ChartData {
  // Count ratings
  const ratingCounts = [0, 0, 0, 0, 0]; // Indices for ratings 5, 4, 3, 2, 1
  
  feedback.forEach(f => {
    if (f.rating >= 1 && f.rating <= 5) {
      ratingCounts[5 - f.rating]++; // Reverse order (5 first)
    }
  });
  
  return {
    labels: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
    datasets: [
      {
        label: 'Feedback Distribution',
        data: ratingCounts,
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',   // Green (5 stars)
          'rgba(59, 130, 246, 0.7)',  // Blue (4 stars)
          'rgba(250, 204, 21, 0.7)',  // Yellow (3 stars)
          'rgba(249, 115, 22, 0.7)',  // Orange (2 stars)
          'rgba(239, 68, 68, 0.7)',   // Red (1 star)
        ],
      },
    ],
  };
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Export chart data to CSV format
 */
export function exportToCSV(
  chartData: ChartData,
  options: CSVExportOptions = {}
): string {
  const delimiter = options.delimiter || ',';
  const includeHeaders = options.includeHeaders !== false; // Default true
  
  const lines: string[] = [];
  
  // Add header row
  if (includeHeaders) {
    const headers = ['Label', ...chartData.datasets.map(d => d.label)];
    lines.push(headers.join(delimiter));
  }
  
  // Add data rows
  chartData.labels.forEach((label, index) => {
    const values = chartData.datasets.map(dataset => dataset.data[index]);
    const row = [label, ...values];
    lines.push(row.join(delimiter));
  });
  
  return lines.join('\n');
}

/**
 * Export multiple charts to CSV with sections
 */
export function exportMultipleChartsToCSV(
  charts: Array<{ title: string; data: ChartData }>,
  options: CSVExportOptions = {}
): string {
  const sections = charts.map(chart => {
    const csv = exportToCSV(chart.data, options);
    return `\n# ${chart.title}\n${csv}`;
  });
  
  return sections.join('\n');
}

/**
 * Create downloadable CSV file
 */
export function downloadCSV(csv: string, filename: string = 'chart-data.csv'): void {
  if (typeof window === 'undefined') return;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

