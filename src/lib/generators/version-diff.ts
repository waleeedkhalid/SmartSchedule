/**
 * Version Diff Generator for SmartSchedule
 * Compares schedule versions and generates deltas for rollback/comparison
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface Schedule {
  id: string;
  student_id: string;
  data: {
    sections: Array<{
      section_id: string;
      course_code?: string;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface VersionDelta {
  added: Schedule[];
  modified: Schedule[];
  deleted: Schedule[];
  unchanged: Schedule[];
}

export interface ChangeStatistics {
  totalSchedules: number;
  addedCount: number;
  deletedCount: number;
  modifiedCount: number;
  unchangedCount: number;
  changePercentage: number;
  sectionChangesCount: number;
}

export interface ComparisonResult {
  summary: string;
  details: string[];
}

// ============================================================================
// Delta Generation Functions
// ============================================================================

/**
 * Generate delta between two schedule versions
 * Identifies added, modified, deleted, and unchanged schedules
 */
export function generateDelta(v1: Schedule[], v2: Schedule[]): VersionDelta {
  const v1Map = new Map(v1.map(s => [s.student_id, s]));
  const v2Map = new Map(v2.map(s => [s.student_id, s]));
  
  const added: Schedule[] = [];
  const modified: Schedule[] = [];
  const deleted: Schedule[] = [];
  const unchanged: Schedule[] = [];
  
  // Check for added and modified
  v2.forEach(schedule => {
    const oldSchedule = v1Map.get(schedule.student_id);
    
    if (!oldSchedule) {
      // New schedule in v2
      added.push(schedule);
    } else if (hasScheduleChanged(oldSchedule, schedule)) {
      // Schedule exists but changed
      modified.push(schedule);
    } else {
      // Schedule unchanged
      unchanged.push(schedule);
    }
  });
  
  // Check for deleted
  v1.forEach(schedule => {
    if (!v2Map.has(schedule.student_id)) {
      deleted.push(schedule);
    }
  });
  
  return { added, modified, deleted, unchanged };
}

/**
 * Check if a schedule has changed between versions
 */
function hasScheduleChanged(oldSchedule: Schedule, newSchedule: Schedule): boolean {
  // Compare sections
  const oldSections = JSON.stringify(
    oldSchedule.data.sections.map(s => ({
      section_id: s.section_id,
      course_code: s.course_code,
    })).sort((a, b) => a.section_id.localeCompare(b.section_id))
  );
  
  const newSections = JSON.stringify(
    newSchedule.data.sections.map(s => ({
      section_id: s.section_id,
      course_code: s.course_code,
    })).sort((a, b) => a.section_id.localeCompare(b.section_id))
  );
  
  return oldSections !== newSections;
}

/**
 * Generate rollback delta (reverse of forward delta)
 * To roll back v2 to v1, we need to:
 * - Delete what was added
 * - Add back what was deleted
 * - Restore what was modified
 */
export function generateRollbackDelta(v1: Schedule[], v2: Schedule[]): VersionDelta {
  const forwardDelta = generateDelta(v1, v2);
  
  return {
    added: forwardDelta.deleted,      // Add back deleted schedules
    modified: forwardDelta.modified.map(newSchedule => {
      // Find original version
      const original = v1.find(s => s.student_id === newSchedule.student_id);
      return original || newSchedule;
    }),
    deleted: forwardDelta.added,      // Delete added schedules
    unchanged: forwardDelta.unchanged, // Keep unchanged
  };
}

// ============================================================================
// Statistics and Reporting
// ============================================================================

/**
 * Calculate change statistics between versions
 */
export function calculateChangeStatistics(v1: Schedule[], v2: Schedule[]): ChangeStatistics {
  const delta = generateDelta(v1, v2);
  
  const totalSchedules = Math.max(v1.length, v2.length);
  const changedCount = delta.added.length + delta.deleted.length + delta.modified.length;
  const changePercentage = totalSchedules > 0 
    ? Math.round((changedCount / totalSchedules) * 100)
    : 0;
  
  // Count section-level changes
  let sectionChangesCount = 0;
  delta.modified.forEach(newSchedule => {
    const oldSchedule = v1.find(s => s.student_id === newSchedule.student_id);
    if (oldSchedule) {
      sectionChangesCount += countSectionChanges(oldSchedule, newSchedule);
    }
  });
  
  return {
    totalSchedules,
    addedCount: delta.added.length,
    deletedCount: delta.deleted.length,
    modifiedCount: delta.modified.length,
    unchangedCount: delta.unchanged.length,
    changePercentage,
    sectionChangesCount,
  };
}

/**
 * Count section-level changes within a modified schedule
 */
function countSectionChanges(oldSchedule: Schedule, newSchedule: Schedule): number {
  const oldSectionIds = new Set(oldSchedule.data.sections.map(s => s.section_id));
  const newSectionIds = new Set(newSchedule.data.sections.map(s => s.section_id));
  
  let changes = 0;
  
  // Added sections
  newSectionIds.forEach(id => {
    if (!oldSectionIds.has(id)) changes++;
  });
  
  // Removed sections
  oldSectionIds.forEach(id => {
    if (!newSectionIds.has(id)) changes++;
  });
  
  return changes;
}

/**
 * Generate human-readable comparison summary
 */
export function generateHumanReadableComparison(v1: Schedule[], v2: Schedule[]): ComparisonResult {
  const delta = generateDelta(v1, v2);
  const stats = calculateChangeStatistics(v1, v2);
  
  const summaryParts: string[] = [];
  
  if (delta.added.length > 0) {
    summaryParts.push(`${delta.added.length} added`);
  }
  if (delta.modified.length > 0) {
    summaryParts.push(`${delta.modified.length} modified`);
  }
  if (delta.deleted.length > 0) {
    summaryParts.push(`${delta.deleted.length} deleted`);
  }
  if (delta.unchanged.length > 0) {
    summaryParts.push(`${delta.unchanged.length} unchanged`);
  }
  
  const summary = summaryParts.length > 0
    ? `Changes: ${summaryParts.join(', ')} (${stats.changePercentage}% change rate)`
    : 'No changes detected';
  
  const details: string[] = [];
  
  // Added schedules
  if (delta.added.length > 0) {
    details.push('\n📗 Added Schedules:');
    delta.added.forEach(schedule => {
      details.push(`  - Student ${schedule.student_id}: ${schedule.data.sections.length} sections`);
    });
  }
  
  // Modified schedules
  if (delta.modified.length > 0) {
    details.push('\n📝 Modified Schedules:');
    delta.modified.forEach(newSchedule => {
      const oldSchedule = v1.find(s => s.student_id === newSchedule.student_id);
      if (oldSchedule) {
        const oldSectionIds = oldSchedule.data.sections.map(s => s.section_id).sort();
        const newSectionIds = newSchedule.data.sections.map(s => s.section_id).sort();
        details.push(`  - Student ${newSchedule.student_id}:`);
        details.push(`      Before: ${oldSectionIds.join(', ')}`);
        details.push(`      After:  ${newSectionIds.join(', ')}`);
      }
    });
  }
  
  // Deleted schedules
  if (delta.deleted.length > 0) {
    details.push('\n📕 Deleted Schedules:');
    delta.deleted.forEach(schedule => {
      details.push(`  - Student ${schedule.student_id}: ${schedule.data.sections.length} sections removed`);
    });
  }
  
  return {
    summary,
    details,
  };
}

/**
 * Generate detailed change report
 */
export function generateChangeReport(v1: Schedule[], v2: Schedule[]): string {
  const comparison = generateHumanReadableComparison(v1, v2);
  const stats = calculateChangeStatistics(v1, v2);
  
  const report: string[] = [
    '=' .repeat(60),
    'SCHEDULE VERSION COMPARISON REPORT',
    '=' .repeat(60),
    '',
    comparison.summary,
    '',
    'Statistics:',
    `  Total Schedules: ${stats.totalSchedules}`,
    `  Added: ${stats.addedCount}`,
    `  Modified: ${stats.modifiedCount}`,
    `  Deleted: ${stats.deletedCount}`,
    `  Unchanged: ${stats.unchangedCount}`,
    `  Change Rate: ${stats.changePercentage}%`,
    `  Section Changes: ${stats.sectionChangesCount}`,
    '',
    ...comparison.details,
    '',
    '=' .repeat(60),
  ];
  
  return report.join('\n');
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export delta as JSON
 */
export function exportDeltaAsJSON(delta: VersionDelta): string {
  return JSON.stringify(delta, null, 2);
}

/**
 * Export comparison as CSV
 */
export function exportComparisonAsCSV(v1: Schedule[], v2: Schedule[]): string {
  const delta = generateDelta(v1, v2);
  
  const rows: string[] = [
    'Student ID,Change Type,Old Sections Count,New Sections Count',
  ];
  
  delta.added.forEach(schedule => {
    rows.push(`${schedule.student_id},ADDED,0,${schedule.data.sections.length}`);
  });
  
  delta.modified.forEach(newSchedule => {
    const oldSchedule = v1.find(s => s.student_id === newSchedule.student_id);
    const oldCount = oldSchedule?.data.sections.length || 0;
    rows.push(`${newSchedule.student_id},MODIFIED,${oldCount},${newSchedule.data.sections.length}`);
  });
  
  delta.deleted.forEach(schedule => {
    rows.push(`${schedule.student_id},DELETED,${schedule.data.sections.length},0`);
  });
  
  delta.unchanged.forEach(schedule => {
    rows.push(`${schedule.student_id},UNCHANGED,${schedule.data.sections.length},${schedule.data.sections.length}`);
  });
  
  return rows.join('\n');
}

