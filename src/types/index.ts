/**
 * Central Type Exports
 * Single source of truth for all TypeScript types
 */

// Database schema types
export * from './database';

// API request/response types
export * from './api';

// Schedule generation types
export * from './schedule';

// Scheduler system types
export * from './scheduler';

// =====================================================
// FACULTY TYPES
// =====================================================

export interface FacultyAvailabilityData {
  id: string;
  faculty_id: string;
  term_code: string;
  availability_data: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

