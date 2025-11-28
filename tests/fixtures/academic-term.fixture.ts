/**
 * Academic Term Fixtures
 * Academic terms/semesters with configuration flags
 */

import type { Database } from '../../src/types/test-schema';

type AcademicTerm = Database['public']['Tables']['academic_term']['Row'];

// =====================================================
// CURRENT TEST TERM (Fall 2025/2026 - Term 471)
// =====================================================

export const CURRENT_TERM: AcademicTerm = {
  code: '471',
  name: 'Fall 2025/2026',
  type: 'FALL',
  start_date: '2025-09-01',
  end_date: '2026-01-15',
  is_active: true,
  schedule_published: false, // Will be true after v2 generation
  electives_survey_open: true,
  feedback_open: false,
  is_faculty_availability_open: true,
  registration_open: false,
  created_at: '2025-08-01T10:00:00Z',
  updated_at: '2025-08-01T10:00:00Z',
};

// =====================================================
// PREVIOUS TERMS (for historical data)
// =====================================================

export const PREVIOUS_TERMS: AcademicTerm[] = [
  {
    code: '462',
    name: 'Spring 2024/2025',
    type: 'SPRING',
    start_date: '2025-01-20',
    end_date: '2025-06-15',
    is_active: false,
    schedule_published: true,
    electives_survey_open: false,
    feedback_open: false,
    is_faculty_availability_open: false,
    registration_open: false,
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2025-06-15T10:00:00Z',
  },
  {
    code: '461',
    name: 'Fall 2024/2025',
    type: 'FALL',
    start_date: '2024-09-01',
    end_date: '2025-01-15',
    is_active: false,
    schedule_published: true,
    electives_survey_open: false,
    feedback_open: false,
    is_faculty_availability_open: false,
    registration_open: false,
    created_at: '2024-08-01T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    code: '452',
    name: 'Spring 2023/2024',
    type: 'SPRING',
    start_date: '2024-01-20',
    end_date: '2024-06-15',
    is_active: false,
    schedule_published: true,
    electives_survey_open: false,
    feedback_open: false,
    is_faculty_availability_open: false,
    registration_open: false,
    created_at: '2023-12-01T10:00:00Z',
    updated_at: '2024-06-15T10:00:00Z',
  },
];

// =====================================================
// UPCOMING TERMS (for planning)
// =====================================================

export const UPCOMING_TERMS: AcademicTerm[] = [
  {
    code: '472',
    name: 'Spring 2025/2026',
    type: 'SPRING',
    start_date: '2026-01-20',
    end_date: '2026-06-15',
    is_active: false,
    schedule_published: false,
    electives_survey_open: false,
    feedback_open: false,
    is_faculty_availability_open: false,
    registration_open: false,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
  },
  {
    code: '473',
    name: 'Summer 2025/2026',
    type: 'SUMMER',
    start_date: '2026-06-20',
    end_date: '2026-08-31',
    is_active: false,
    schedule_published: false,
    electives_survey_open: false,
    feedback_open: false,
    is_faculty_availability_open: false,
    registration_open: false,
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-01T10:00:00Z',
  },
];

// =====================================================
// ALL TERMS COMBINED
// =====================================================

export const ALL_TERMS: AcademicTerm[] = [
  ...PREVIOUS_TERMS.reverse(), // Oldest first
  CURRENT_TERM,
  ...UPCOMING_TERMS,
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getTermByCode = (code: string): AcademicTerm | undefined => {
  return ALL_TERMS.find(t => t.code === code);
};

export const getActiveTerm = (): AcademicTerm | undefined => {
  return ALL_TERMS.find(t => t.is_active === true);
};

export const getTermsByType = (type: AcademicTerm['type']): AcademicTerm[] => {
  return ALL_TERMS.filter(t => t.type === type);
};

export const getPublishedTerms = (): AcademicTerm[] => {
  return ALL_TERMS.filter(t => t.schedule_published === true);
};

export const getTermsWithOpenSurvey = (): AcademicTerm[] => {
  return ALL_TERMS.filter(t => t.electives_survey_open === true);
};

export const getTermsWithOpenFeedback = (): AcademicTerm[] => {
  return ALL_TERMS.filter(t => t.feedback_open === true);
};

// =====================================================
// TERM STATE TRANSITIONS (for testing workflows)
// =====================================================

/**
 * Updates term flags to simulate workflow progression
 */
export const getTermInPhase = (phase: 'setup' | 'collection' | 'generation' | 'review' | 'published'): AcademicTerm => {
  const term = { ...CURRENT_TERM };
  
  switch (phase) {
    case 'setup':
      term.is_faculty_availability_open = false;
      term.electives_survey_open = false;
      term.schedule_published = false;
      term.feedback_open = false;
      term.registration_open = false;
      break;
      
    case 'collection':
      term.is_faculty_availability_open = true;
      term.electives_survey_open = true;
      term.schedule_published = false;
      term.feedback_open = false;
      term.registration_open = false;
      break;
      
    case 'generation':
      term.is_faculty_availability_open = false;
      term.electives_survey_open = false;
      term.schedule_published = false;
      term.feedback_open = false;
      term.registration_open = false;
      break;
      
    case 'review':
      term.is_faculty_availability_open = false;
      term.electives_survey_open = false;
      term.schedule_published = true; // Published draft
      term.feedback_open = true;
      term.registration_open = false;
      break;
      
    case 'published':
      term.is_faculty_availability_open = false;
      term.electives_survey_open = false;
      term.schedule_published = true;
      term.feedback_open = false;
      term.registration_open = true; // Elective registration open
      break;
  }
  
  return term;
};

// =====================================================
// STATISTICS
// =====================================================

export const getTermStatistics = () => {
  return {
    total_terms: ALL_TERMS.length,
    active_terms: ALL_TERMS.filter(t => t.is_active).length,
    published_terms: getPublishedTerms().length,
    fall_terms: getTermsByType('FALL').length,
    spring_terms: getTermsByType('SPRING').length,
    summer_terms: getTermsByType('SUMMER').length,
    terms_with_open_survey: getTermsWithOpenSurvey().length,
    terms_with_open_feedback: getTermsWithOpenFeedback().length,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const TERMS_QUICK_REF = {
  current: CURRENT_TERM,
  active: getActiveTerm(),
  previous: PREVIOUS_TERMS,
  upcoming: UPCOMING_TERMS,
  all: ALL_TERMS,
  fall: getTermsByType('FALL'),
  spring: getTermsByType('SPRING'),
  summer: getTermsByType('SUMMER'),
  published: getPublishedTerms(),
  statistics: getTermStatistics(),
};

// Export for easy access
export const TEST_TERM_DATA = {
  current: CURRENT_TERM,
  all: ALL_TERMS,
  quickRef: TERMS_QUICK_REF,
  helpers: {
    getByCode: getTermByCode,
    getActive: getActiveTerm,
    getByType: getTermsByType,
    getPublished: getPublishedTerms,
    getWithOpenSurvey: getTermsWithOpenSurvey,
    getWithOpenFeedback: getTermsWithOpenFeedback,
    getInPhase: getTermInPhase,
    getStatistics: getTermStatistics,
  },
};


